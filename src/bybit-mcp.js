import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { CLUSTR_VERSION } from './version.js'

const require = createRequire(import.meta.url)
const REQUIRED_TOOLS = Object.freeze([
  'queryAPIKey',
  'getInstrumentsInfo',
  'getTickers',
  'createOrder',
  'preCheckOrder',
  'cancelOrder',
  'getOpenOrders',
  'getOrderHistory',
  'getPositionInfo',
])
const ALLOWED_TOOLS = new Set(REQUIRED_TOOLS)
const CATEGORIES = new Set(['spot', 'linear', 'inverse'])

function resolveBybitBin() {
  const pkgPath = require.resolve('bybit-official-trading-server/package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.['bybit-official-trading-server'] ?? pkg.bin?.['trading-mcp']
  if (!bin) throw new Error('Bybit 官方 Trading MCP 缺少可执行入口')
  return join(dirname(pkgPath), bin)
}

function safeText(value, secrets = []) {
  let text = String(value ?? '')
  for (const secret of secrets) {
    if (typeof secret === 'string' && secret.length >= 4) text = text.split(secret).join('[REDACTED]')
  }
  return text.slice(0, 600)
}

function parsedToolResult(result, secrets) {
  const text = (result?.content ?? []).filter((item) => item?.type === 'text').map((item) => String(item.text ?? '')).join('\n')
  if (result?.isError) throw new BybitMcpError('MCP_TOOL_FAILED', { detail: safeText(text, secrets) })
  if (!text) return null
  try { return JSON.parse(text) } catch { throw new BybitMcpError('MCP_INVALID_RESPONSE') }
}

function bybitErrorMessage(code) {
  const known = {
    MCP_START_FAILED: 'Bybit 官方 Trading MCP 启动失败',
    MCP_EXITED: 'Bybit 官方 Trading MCP 连接已中断',
    MCP_TIMEOUT: 'Bybit 官方 Trading MCP 请求超时',
    MCP_TOOL_MISSING: 'Bybit 官方 Trading MCP 缺少所需交易工具',
    MCP_TOOL_DENIED: 'Bybit MCP 工具不在 Clustr 安全白名单中',
    MCP_TOOL_FAILED: 'Bybit 官方 Trading MCP 拒绝了请求',
    MCP_INVALID_RESPONSE: 'Bybit 官方 Trading MCP 返回了无法解析的数据',
    EXCHANGE_REJECTED: 'Bybit 拒绝了交易请求',
    ORDER_NOT_FOUND: 'Bybit 暂未返回匹配订单',
  }
  return known[String(code)] ?? 'Bybit 交易请求未完成'
}

export class BybitMcpError extends Error {
  constructor(code, { detail = null, outcomeUnknown = false } = {}) {
    super(bybitErrorMessage(code))
    this.name = 'BybitMcpError'
    this.code = String(code)
    this.detail = detail ? String(detail).slice(0, 600) : null
    this.outcomeUnknown = outcomeUnknown === true
  }
}

export class BybitMcpBridge {
  constructor({ credentials, testnet = false, timeoutMs = 30_000, spawnImpl = spawn, binResolver = resolveBybitBin, baseEnv = process.env } = {}) {
    this.credentials = credentials
    this.testnet = testnet === true
    this.timeoutMs = Math.min(60_000, Math.max(5_000, Number(timeoutMs) || 30_000))
    this.spawnImpl = spawnImpl
    this.binResolver = binResolver
    this.baseEnv = baseEnv
    this.child = null
    this.ready = false
    this.health = 'stopped'
    this.nextId = 1
    this.pending = new Map()
    this.startPromise = null
    this.stderrTail = ''
    this.secretValues = []
  }

  async start() {
    if (this.ready) return
    if (this.startPromise) return this.startPromise
    this.startPromise = this.#start().finally(() => { this.startPromise = null })
    return this.startPromise
  }

  async #start() {
    this.health = 'starting'
    const credentials = typeof this.credentials === 'function' ? await this.credentials() : this.credentials
    if (!credentials?.apiKey || !credentials?.secretKey) throw new BybitMcpError('MCP_START_FAILED')
    this.secretValues = [credentials.apiKey, credentials.secretKey]
    const env = { ...this.baseEnv, BYBIT_API_KEY: credentials.apiKey, BYBIT_API_SECRET: credentials.secretKey, BYBIT_TESTNET: this.testnet ? 'true' : 'false' }
    delete env.BYBIT_API_PRIVATE_KEY_PATH
    const bin = this.binResolver()
    const child = this.spawnImpl(process.execPath, [bin], { stdio: ['pipe', 'pipe', 'pipe'], env })
    this.child = child
    let buffer = ''
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      buffer += chunk
      let index
      while ((index = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, index).trim()
        buffer = buffer.slice(index + 1)
        if (!line) continue
        try { this.#onMessage(JSON.parse(line)) } catch {}
      }
    })
    child.stderr.on('data', (chunk) => { this.stderrTail = safeText(this.stderrTail + String(chunk), this.secretValues).slice(-2000) })
    child.on('error', () => { this.health = 'failed'; this.#rejectPending(new BybitMcpError('MCP_START_FAILED')) })
    child.on('exit', () => {
      this.ready = false
      this.health = 'stopped'
      this.#rejectPending(new BybitMcpError('MCP_EXITED'))
    })
    try {
      await this.request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'clustr-trading-console', version: CLUSTR_VERSION } })
      this.notify('notifications/initialized', {})
      const tools = await this.listTools({ skipStart: true })
      const names = new Set(tools.map((tool) => tool?.name))
      const missing = REQUIRED_TOOLS.filter((name) => !names.has(name))
      if (missing.length) throw new BybitMcpError('MCP_TOOL_MISSING', { detail: missing.join(',') })
      this.ready = true
      this.health = 'ready'
    } catch (error) {
      await this.dispose()
      throw error instanceof BybitMcpError ? error : new BybitMcpError('MCP_START_FAILED')
    }
  }

  #onMessage(message) {
    if (message?.id == null || !this.pending.has(message.id)) return
    const pending = this.pending.get(message.id)
    this.pending.delete(message.id)
    if (message.error) pending.reject(new BybitMcpError('MCP_TOOL_FAILED', { detail: safeText(message.error?.message, this.secretValues) }))
    else pending.resolve(message.result)
  }

  #rejectPending(error) {
    const pending = [...this.pending.values()]
    this.pending.clear()
    for (const item of pending) item.reject(error)
  }

  notify(method, params) {
    try { this.child?.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n') } catch {}
  }

  request(method, params) {
    if (!this.child) return Promise.reject(new BybitMcpError('MCP_EXITED'))
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new BybitMcpError('MCP_TIMEOUT', { outcomeUnknown: method === 'tools/call' }))
      }, this.timeoutMs)
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value) },
        reject: (error) => { clearTimeout(timer); reject(error) },
      })
      try { this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n') }
      catch { clearTimeout(timer); this.pending.delete(id); reject(new BybitMcpError('MCP_EXITED')) }
    })
  }

  async listTools({ skipStart = false } = {}) {
    if (!skipStart && !this.ready) await this.start()
    const result = await this.request('tools/list', {})
    return result?.tools ?? []
  }

  async callTool(name, args = {}) {
    if (!ALLOWED_TOOLS.has(name)) throw new BybitMcpError('MCP_TOOL_DENIED')
    if (!this.ready) await this.start()
    const result = await this.request('tools/call', { name, arguments: args })
    return parsedToolResult(result, this.secretValues)
  }

  async dispose() {
    this.ready = false
    this.health = 'stopped'
    if (this.child) {
      try { this.child.kill() } catch {}
      this.child = null
    }
    this.#rejectPending(new BybitMcpError('MCP_EXITED'))
    this.secretValues = []
    this.stderrTail = ''
  }
}

function category(value) {
  const result = String(value ?? '').trim().toLowerCase()
  if (!CATEGORIES.has(result)) throw new Error('Bybit 订单市场必须是 spot、linear 或 inverse')
  return result
}

function symbol(value) {
  const result = String(value ?? '').trim().toUpperCase().replace(/[-/_]/g, '')
  if (!result || result.length > 40 || !/^[A-Z0-9]+$/.test(result)) throw new Error('Bybit 交易标的无效')
  return result
}

function positive(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function side(value) {
  const result = String(value ?? '').trim().toLowerCase()
  if (!['buy', 'sell'].includes(result)) throw new Error('Bybit 订单方向无效')
  return result === 'buy' ? 'Buy' : 'Sell'
}

function clientOrderId(value) {
  const result = String(value ?? '').trim()
  if (!result || result.length > 36 || !/^[A-Za-z0-9_-]+$/.test(result)) throw new Error('Bybit 客户端订单编号无效')
  return result
}

function positionIdx(value) {
  const result = String(value ?? 'net').trim().toLowerCase()
  if (result === 'net' || result === 'both') return '0'
  if (result === 'long') return '1'
  if (result === 'short') return '2'
  throw new Error('Bybit 合约持仓方向无效')
}

function orderSettings(input = {}) {
  const type = String(input.ordType ?? input.orderType ?? '').trim().toLowerCase()
  if (type === 'market') return { orderType: 'Market' }
  if (type === 'limit') return { orderType: 'Limit', timeInForce: 'GTC' }
  if (type === 'post_only') return { orderType: 'Limit', timeInForce: 'PostOnly' }
  if (type === 'ioc') return { orderType: 'Limit', timeInForce: 'IOC' }
  if (type === 'fok') return { orderType: 'Limit', timeInForce: 'FOK' }
  throw new Error('Bybit 当前只支持 market、limit、post_only、ioc 和 fok')
}

function assertSuccess(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new BybitMcpError('MCP_INVALID_RESPONSE')
  if (Number(payload.retCode) !== 0) throw new BybitMcpError('EXCHANGE_REJECTED', { detail: `${String(payload.retCode ?? '')}:${String(payload.retMsg ?? '')}` })
  return payload.result ?? {}
}

export function normalizeBybitOrder(row = {}, market = 'spot') {
  return {
    exchange: 'bybit',
    market: category(market),
    symbol: String(row.symbol ?? ''),
    orderId: row.orderId == null ? null : String(row.orderId),
    clientOrderId: String(row.orderLinkId ?? ''),
    status: String(row.orderStatus ?? row.status ?? 'Acknowledged'),
    side: String(row.side ?? '').toLowerCase(),
    positionSide: String(row.positionIdx ?? '') === '1' ? 'long' : String(row.positionIdx ?? '') === '2' ? 'short' : 'net',
    orderType: String(row.orderType ?? '').toLowerCase(),
    size: positive(row.qty),
    filledSize: Number.isFinite(Number(row.cumExecQty)) ? Number(row.cumExecQty) : null,
    price: positive(row.price),
    averageFillPrice: positive(row.avgPrice),
    reduceOnly: row.reduceOnly === true,
    createdAt: Number(row.createdTime) || null,
    updatedAt: Number(row.updatedTime) || null,
    raw: row,
  }
}

function orderArguments(input = {}) {
  const market = category(input.market)
  const settings = orderSettings(input)
  const qty = String(input.size ?? '').trim()
  if (!positive(qty)) throw new Error('Bybit 订单数量无效')
  if (settings.orderType === 'Limit' && !positive(input.price)) throw new Error('Bybit 非市价订单必须提供有效价格')
  const args = {
    category: market,
    symbol: symbol(input.instId ?? input.symbol),
    side: side(input.side),
    orderType: settings.orderType,
    qty,
    orderLinkId: clientOrderId(input.clientOrderId),
    timeInForce: settings.timeInForce,
    price: settings.orderType === 'Limit' ? String(input.price) : undefined,
    marketUnit: market === 'spot' ? 'baseCoin' : undefined,
    isLeverage: market === 'spot' ? '0' : undefined,
    positionIdx: market === 'spot' ? undefined : positionIdx(input.posSide),
    reduceOnly: market === 'spot' ? undefined : input.reduceOnly === true,
    takeProfit: input.takeProfitTrigger == null ? undefined : String(input.takeProfitTrigger),
    stopLoss: input.stopLossTrigger == null ? undefined : String(input.stopLossTrigger),
    tpLimitPrice: input.takeProfitPrice == null ? undefined : String(input.takeProfitPrice),
    slLimitPrice: input.stopLossPrice == null ? undefined : String(input.stopLossPrice),
    tpOrderType: input.takeProfitPrice == null ? undefined : 'Limit',
    slOrderType: input.stopLossPrice == null ? undefined : 'Limit',
  }
  return Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}

export class BybitTradingAdapter {
  constructor({ bridge } = {}) {
    if (!bridge?.callTool) throw new Error('Bybit Trading MCP Bridge 缺失')
    this.bridge = bridge
  }

  async verifyApiKey() {
    return assertSuccess(await this.bridge.callTool('queryAPIKey', {}))
  }

  async instrument(marketInput, symbolInput) {
    const market = category(marketInput)
    const normalizedSymbol = symbol(symbolInput)
    const result = assertSuccess(await this.bridge.callTool('getInstrumentsInfo', { category: market, symbol: normalizedSymbol }))
    const row = (result.list ?? []).find((item) => String(item?.symbol ?? '').toUpperCase() === normalizedSymbol)
    if (!row || !['Trading', 'PreLaunch'].includes(String(row.status ?? ''))) throw new Error('Bybit 交易标的当前不可交易')
    const lot = row.lotSizeFilter ?? {}
    const price = row.priceFilter ?? {}
    return {
      exchange: 'bybit', instId: normalizedSymbol, market,
      baseCcy: row.baseCoin, quoteCcy: row.quoteCoin, settleCcy: row.settleCoin ?? row.quoteCoin,
      minSz: lot.minOrderQty ?? lot.minOrderAmt ?? null,
      maxSz: lot.maxOrderQty ?? lot.maxMktOrderQty ?? null,
      lotSz: lot.qtyStep ?? lot.basePrecision ?? null,
      tickSz: price.tickSize ?? null,
      minNotional: lot.minOrderAmt ?? null,
      contractMultiplier: positive(row.contractSize) ?? 1,
      rawStatus: row.status,
    }
  }

  async ticker(marketInput, symbolInput) {
    const market = category(marketInput)
    const normalizedSymbol = symbol(symbolInput)
    const result = assertSuccess(await this.bridge.callTool('getTickers', { category: market, symbol: normalizedSymbol }))
    const row = (result.list ?? []).find((item) => String(item?.symbol ?? '').toUpperCase() === normalizedSymbol)
    const price = positive(row?.lastPrice ?? row?.markPrice ?? row?.indexPrice)
    if (price == null) throw new Error('Bybit 行情价格无法确认')
    return { price, row }
  }

  async preCheckOrder(input = {}) {
    const args = orderArguments(input)
    if (args.category !== 'linear') return { skipped: true, reason: 'Bybit 订单预检查仅适用于 linear' }
    return assertSuccess(await this.bridge.callTool('preCheckOrder', args))
  }

  async placeOrder(input = {}) {
    const args = orderArguments(input)
    const result = assertSuccess(await this.bridge.callTool('createOrder', args))
    return normalizeBybitOrder({ ...args, ...result, orderStatus: 'Acknowledged' }, args.category)
  }

  async queryOrder(input = {}) {
    const market = category(input.market)
    const normalizedSymbol = symbol(input.instId ?? input.symbol)
    const orderId = input.orderId == null || input.orderId === '' ? null : String(input.orderId)
    const orderLinkId = input.clientOrderId == null || input.clientOrderId === '' ? null : clientOrderId(input.clientOrderId)
    if (!orderId && !orderLinkId) throw new Error('查询 Bybit 订单需要 orderId 或 clientOrderId')
    const args = Object.fromEntries(Object.entries({ category: market, symbol: normalizedSymbol, orderId, orderLinkId, openOnly: '1', limit: 20 }).filter(([, value]) => value != null))
    const realtime = assertSuccess(await this.bridge.callTool('getOpenOrders', args))
    let row = (realtime.list ?? []).find((item) => (!orderId || String(item.orderId) === orderId) && (!orderLinkId || String(item.orderLinkId) === orderLinkId))
    if (!row) {
      const historyArgs = { ...args }
      delete historyArgs.openOnly
      const history = assertSuccess(await this.bridge.callTool('getOrderHistory', historyArgs))
      row = (history.list ?? []).find((item) => (!orderId || String(item.orderId) === orderId) && (!orderLinkId || String(item.orderLinkId) === orderLinkId))
    }
    return row ? normalizeBybitOrder(row, market) : null
  }

  async cancelOrder(input = {}) {
    const market = category(input.market)
    const normalizedSymbol = symbol(input.instId ?? input.symbol)
    const orderId = input.orderId == null || input.orderId === '' ? null : String(input.orderId)
    const orderLinkId = input.clientOrderId == null || input.clientOrderId === '' ? null : clientOrderId(input.clientOrderId)
    if (!orderId && !orderLinkId) throw new Error('撤销 Bybit 订单需要 orderId 或 clientOrderId')
    const args = Object.fromEntries(Object.entries({ category: market, symbol: normalizedSymbol, orderId, orderLinkId }).filter(([, value]) => value != null))
    const result = assertSuccess(await this.bridge.callTool('cancelOrder', args))
    return normalizeBybitOrder({ symbol: normalizedSymbol, orderId: result.orderId ?? orderId, orderLinkId: result.orderLinkId ?? orderLinkId, orderStatus: 'CancelPending' }, market)
  }

  async positions(marketInput, symbolInput) {
    const market = category(marketInput)
    if (market === 'spot') return []
    const normalizedSymbol = symbol(symbolInput)
    const result = assertSuccess(await this.bridge.callTool('getPositionInfo', { category: market, symbol: normalizedSymbol, limit: 20 }))
    return Array.isArray(result.list) ? result.list : []
  }

  async closePosition(input = {}) {
    const market = category(input.market)
    if (market === 'spot') throw new Error('Bybit 整仓平仓仅适用于 linear 或 inverse')
    const normalizedSymbol = symbol(input.instId ?? input.symbol)
    const rows = await this.positions(market, normalizedSymbol)
    const requested = String(input.posSide ?? '').toLowerCase()
    const candidates = rows.filter((row) => {
      const rowSide = String(row.side ?? '').toLowerCase()
      const semanticSide = rowSide === 'buy' ? 'long' : rowSide === 'sell' ? 'short' : rowSide
      return positive(row.size) && (!requested || requested === 'net' || requested === semanticSide)
    })
    if (candidates.length !== 1) throw new Error(candidates.length === 0 ? 'Bybit 没有可平的目标持仓' : '存在多个方向持仓，请明确指定 long 或 short')
    const row = candidates[0]
    return this.placeOrder({
      ...input,
      market,
      instId: normalizedSymbol,
      side: String(row.side).toLowerCase() === 'buy' ? 'sell' : 'buy',
      posSide: String(row.positionIdx) === '1' ? 'long' : String(row.positionIdx) === '2' ? 'short' : 'net',
      ordType: 'market',
      size: String(row.size),
      reduceOnly: true,
    })
  }
}

export const __test = { assertSuccess, category, symbol, positionIdx, orderArguments, REQUIRED_TOOLS }
