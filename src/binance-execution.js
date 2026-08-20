import { createHmac } from 'node:crypto'

const DEFAULT_TIMEOUT_MS = 12_000
const DEFAULT_RECV_WINDOW = 5_000
const USER_AGENT = 'Clustr-Trading-Console/0.6'
const MARKETS = new Set(['spot', 'usd-m-futures'])

function safeCode(value) {
  return value == null ? null : String(value).slice(0, 64)
}

function errorMessage(code, status) {
  const known = {
    '-1007': 'Binance 未在时限内确认订单结果',
    '-1021': '本机时间与 Binance 服务器时间不同步',
    '-1022': 'Binance API 签名校验失败',
    '-1100': '订单包含 Binance 不接受的字符',
    '-1111': '订单数量或价格精度不符合 Binance 规则',
    '-1116': 'Binance 不支持该订单类型',
    '-2010': 'Binance 拒绝了新订单',
    '-2011': 'Binance 找不到可撤销的订单',
    '-2013': 'Binance 找不到该订单',
    '-2014': 'Binance API Key 格式无效',
    '-2015': 'Binance API Key、权限或 IP 白名单被拒绝',
    RATE_LIMITED: 'Binance 请求频率受限',
    IP_BANNED: '当前网络出口暂时被 Binance 限制',
    REGION_RESTRICTED: '当前地区或网络无法访问 Binance 官方接口',
    NETWORK_ERROR: 'Binance 连接异常',
    TIMEOUT: 'Binance 连接超时',
    INVALID_RESPONSE: 'Binance 返回了无法解析的数据',
  }
  return known[String(code)] ?? (status ? `Binance 返回 HTTP ${status}` : 'Binance 请求未完成')
}

export class BinanceExecutionError extends Error {
  constructor(code, { status = null, outcomeUnknown = false, retryAfterMs = null } = {}) {
    super(errorMessage(code, status))
    this.name = 'BinanceExecutionError'
    this.code = safeCode(code)
    this.status = status == null ? null : Number.isFinite(Number(status)) ? Number(status) : null
    this.outcomeUnknown = outcomeUnknown === true
    this.retryAfterMs = retryAfterMs == null ? null : Number.isFinite(Number(retryAfterMs)) ? Number(retryAfterMs) : null
  }
}

function compact(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}

function normalizeMarket(value) {
  const market = String(value ?? '').trim().toLowerCase()
  if (market === 'futures' || market === 'swap' || market === 'linear') return 'usd-m-futures'
  if (!MARKETS.has(market)) throw new Error('Binance 订单市场必须是 spot 或 usd-m-futures')
  return market
}

function normalizeSymbol(value) {
  const symbol = String(value ?? '').trim().toUpperCase().replace(/[-/_]/g, '')
  if (!symbol || symbol.length > 40 || !/^[A-Z0-9]+$/.test(symbol)) throw new Error('Binance 交易标的无效')
  return symbol
}

function normalizeSide(value) {
  const side = String(value ?? '').trim().toUpperCase()
  if (!['BUY', 'SELL'].includes(side)) throw new Error('Binance 订单方向无效')
  return side
}

function normalizeClientOrderId(value) {
  const id = String(value ?? '').trim()
  if (!id || id.length > 36 || !/^[.A-Za-z0-9_:/-]+$/.test(id)) throw new Error('Binance 客户端订单编号无效')
  return id
}

function orderType(input, market) {
  const requested = String(input.ordType ?? input.orderType ?? '').trim().toLowerCase()
  if (requested === 'market') return { type: 'MARKET' }
  if (requested === 'limit') return { type: 'LIMIT', timeInForce: String(input.timeInForce ?? 'GTC').toUpperCase() }
  if (requested === 'post_only') return market === 'spot' ? { type: 'LIMIT_MAKER' } : { type: 'LIMIT', timeInForce: 'GTX' }
  if (requested === 'ioc' || requested === 'fok') return { type: 'LIMIT', timeInForce: requested.toUpperCase() }
  throw new Error('Binance 当前只支持 market、limit、post_only、ioc 和 fok')
}

function filterMap(symbol) {
  return new Map((symbol?.filters ?? []).map((item) => [String(item.filterType ?? ''), item]))
}

function positive(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : null
}

function averageFillPrice(row) {
  const direct = positive(row?.avgPrice)
  if (direct != null) return direct
  const quote = positive(row?.cummulativeQuoteQty ?? row?.cumQuote)
  const size = positive(row?.executedQty)
  return quote != null && size != null ? quote / size : null
}

export function normalizeBinanceOrder(row = {}, market = 'spot') {
  return {
    exchange: 'binance',
    market: normalizeMarket(market),
    symbol: String(row.symbol ?? ''),
    orderId: row.orderId == null ? null : String(row.orderId),
    clientOrderId: String(row.clientOrderId ?? row.origClientOrderId ?? ''),
    status: String(row.status ?? 'NEW').toUpperCase(),
    side: String(row.side ?? '').toLowerCase(),
    positionSide: String(row.positionSide ?? '').toLowerCase(),
    orderType: String(row.type ?? row.origType ?? '').toLowerCase(),
    size: positive(row.origQty),
    filledSize: Number.isFinite(Number(row.executedQty)) ? Number(row.executedQty) : null,
    price: positive(row.price),
    averageFillPrice: averageFillPrice(row),
    reduceOnly: row.reduceOnly === true || String(row.reduceOnly).toLowerCase() === 'true',
    createdAt: Number(row.time ?? row.transactTime) || null,
    updatedAt: Number(row.updateTime ?? row.transactTime) || null,
    raw: row,
  }
}

export class BinanceExecutionAdapter {
  constructor({ credentials, fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS, recvWindow = DEFAULT_RECV_WINDOW, now = () => Date.now(), spotBase = 'https://api.binance.com', futuresBase = 'https://fapi.binance.com' } = {}) {
    if (!credentials?.apiKey || !credentials?.secretKey) throw new Error('Binance 执行凭证缺失')
    this.credentials = credentials
    this.fetchImpl = fetchImpl
    this.timeoutMs = Math.min(30_000, Math.max(1_000, Number(timeoutMs) || DEFAULT_TIMEOUT_MS))
    this.recvWindow = Math.min(5_000, Math.max(1_000, Number(recvWindow) || DEFAULT_RECV_WINDOW))
    this.now = now
    this.bases = { spot: spotBase, 'usd-m-futures': futuresBase }
    this.clockOffsets = new Map()
  }

  async syncTime(marketInput) {
    const market = normalizeMarket(marketInput)
    const path = market === 'spot' ? '/api/v3/time' : '/fapi/v1/time'
    const payload = await this.#request({ market, method: 'GET', path, signed: false })
    const serverTime = Number(payload?.serverTime)
    if (!Number.isFinite(serverTime)) throw new BinanceExecutionError('INVALID_RESPONSE')
    const offset = serverTime - this.now()
    if (Math.abs(offset) > 60_000) throw new Error('本机时间与 Binance 相差超过一分钟，执行保持关闭')
    this.clockOffsets.set(market, offset)
    return { market, offsetMs: offset }
  }

  async instrument(marketInput, symbolInput, orderTypeInput = 'limit') {
    const market = normalizeMarket(marketInput)
    const symbol = normalizeSymbol(symbolInput)
    const path = market === 'spot' ? '/api/v3/exchangeInfo' : '/fapi/v1/exchangeInfo'
    const payload = await this.#request({ market, method: 'GET', path, params: { symbol }, signed: false })
    const row = (payload?.symbols ?? []).find((item) => String(item?.symbol ?? '').toUpperCase() === symbol)
    if (!row || !['TRADING', 'PRE_TRADING'].includes(String(row.status ?? '').toUpperCase())) throw new Error('Binance 交易标的当前不可交易')
    const filters = filterMap(row)
    const requested = String(orderTypeInput ?? '').toLowerCase()
    const lot = requested === 'market' && positive(filters.get('MARKET_LOT_SIZE')?.stepSize)
      ? filters.get('MARKET_LOT_SIZE')
      : filters.get('LOT_SIZE')
    const price = filters.get('PRICE_FILTER')
    const notional = filters.get('NOTIONAL') ?? filters.get('MIN_NOTIONAL')
    return {
      exchange: 'binance', instId: symbol, market, baseCcy: row.baseAsset, quoteCcy: row.quoteAsset, settleCcy: market === 'usd-m-futures' ? row.marginAsset ?? row.quoteAsset : row.quoteAsset,
      minSz: lot?.minQty ?? null, maxSz: lot?.maxQty ?? null, lotSz: lot?.stepSize ?? null,
      tickSz: price?.tickSize ?? null, minPx: price?.minPrice ?? null, maxPx: price?.maxPrice ?? null,
      minNotional: notional?.minNotional ?? notional?.notional ?? null, maxNotional: notional?.maxNotional ?? null,
      rawStatus: row.status,
    }
  }

  async account(marketInput) {
    const market = normalizeMarket(marketInput)
    const path = market === 'spot' ? '/api/v3/account' : '/fapi/v3/account'
    return this.#request({ market, method: 'GET', path, signed: true })
  }

  async positionRisk(symbolInput) {
    const symbol = normalizeSymbol(symbolInput)
    const rows = await this.#request({ market: 'usd-m-futures', method: 'GET', path: '/fapi/v3/positionRisk', params: { symbol }, signed: true })
    return Array.isArray(rows) ? rows : []
  }

  async placeOrder(input = {}) {
    const market = normalizeMarket(input.market)
    const symbol = normalizeSymbol(input.instId ?? input.symbol)
    const side = normalizeSide(input.side)
    const clientOrderId = normalizeClientOrderId(input.clientOrderId)
    const mapped = orderType(input, market)
    const size = String(input.size ?? '').trim()
    if (!positive(size)) throw new Error('Binance 订单数量无效')
    if (mapped.type !== 'MARKET' && !positive(input.price)) throw new Error('Binance 非市价订单必须提供有效价格')
    const positionSide = market === 'usd-m-futures' ? String(input.posSide ?? 'BOTH').toUpperCase() : null
    if (market === 'usd-m-futures' && !['BOTH', 'LONG', 'SHORT'].includes(positionSide)) throw new Error('Binance 合约持仓方向无效')
    const params = compact({
      symbol, side, type: mapped.type, timeInForce: mapped.timeInForce, quantity: size,
      price: mapped.type === 'MARKET' ? null : String(input.price),
      newClientOrderId: clientOrderId,
      newOrderRespType: market === 'spot' ? 'FULL' : 'RESULT',
      positionSide: market === 'usd-m-futures' ? positionSide : null,
      reduceOnly: market === 'usd-m-futures' && input.reduceOnly === true && positionSide === 'BOTH' ? 'true' : null,
    })
    const path = market === 'spot' ? '/api/v3/order' : '/fapi/v1/order'
    const row = await this.#request({ market, method: 'POST', path, params, signed: true, outcomeCanBeUnknown: true })
    return normalizeBinanceOrder(row, market)
  }

  async queryOrder(input = {}) {
    const market = normalizeMarket(input.market)
    const symbol = normalizeSymbol(input.instId ?? input.symbol)
    const orderId = input.orderId == null || input.orderId === '' ? null : String(input.orderId)
    const clientOrderId = input.clientOrderId == null || input.clientOrderId === '' ? null : normalizeClientOrderId(input.clientOrderId)
    if (!orderId && !clientOrderId) throw new Error('查询 Binance 订单需要 orderId 或 clientOrderId')
    const params = compact({ symbol, orderId, origClientOrderId: clientOrderId })
    const path = market === 'spot' ? '/api/v3/order' : '/fapi/v1/order'
    const row = await this.#request({ market, method: 'GET', path, params, signed: true })
    return normalizeBinanceOrder(row, market)
  }

  async cancelOrder(input = {}) {
    const market = normalizeMarket(input.market)
    const symbol = normalizeSymbol(input.instId ?? input.symbol)
    const orderId = input.orderId == null || input.orderId === '' ? null : String(input.orderId)
    const clientOrderId = input.clientOrderId == null || input.clientOrderId === '' ? null : normalizeClientOrderId(input.clientOrderId)
    if (!orderId && !clientOrderId) throw new Error('撤销 Binance 订单需要 orderId 或 clientOrderId')
    const params = compact({ symbol, orderId, origClientOrderId: clientOrderId })
    const path = market === 'spot' ? '/api/v3/order' : '/fapi/v1/order'
    const row = await this.#request({ market, method: 'DELETE', path, params, signed: true, outcomeCanBeUnknown: true })
    return normalizeBinanceOrder(row, market)
  }

  async closePosition(input = {}) {
    const market = normalizeMarket(input.market)
    if (market !== 'usd-m-futures') throw new Error('Binance 整仓平仓仅支持 U 本位合约')
    const symbol = normalizeSymbol(input.instId ?? input.symbol)
    const rows = await this.positionRisk(symbol)
    const requestedSide = String(input.posSide ?? '').toUpperCase()
    const candidates = rows.filter((row) => positive(Math.abs(Number(row.positionAmt))) && (!requestedSide || requestedSide === 'NET' || String(row.positionSide).toUpperCase() === requestedSide))
    if (candidates.length !== 1) throw new Error(candidates.length === 0 ? 'Binance 没有可平的目标持仓' : '存在多个方向持仓，请明确指定 LONG 或 SHORT')
    const position = candidates[0]
    const amount = Number(position.positionAmt)
    const positionSide = String(position.positionSide ?? 'BOTH').toUpperCase()
    const side = positionSide === 'LONG' ? 'sell' : positionSide === 'SHORT' ? 'buy' : amount > 0 ? 'sell' : 'buy'
    return this.placeOrder({ ...input, market, instId: symbol, side, posSide: positionSide, ordType: 'market', size: String(Math.abs(amount)), reduceOnly: positionSide === 'BOTH' })
  }

  async #request({ market: marketInput, method, path, params = {}, signed, outcomeCanBeUnknown = false }) {
    const market = normalizeMarket(marketInput)
    const requestParams = compact(params)
    if (signed) {
      requestParams.recvWindow = String(this.recvWindow)
      requestParams.timestamp = String(this.now() + (this.clockOffsets.get(market) ?? 0))
    }
    const payload = new URLSearchParams(Object.entries(requestParams).map(([key, value]) => [key, String(value)])).toString()
    const signature = signed ? createHmac('sha256', this.credentials.secretKey).update(payload).digest('hex') : null
    const query = [payload, signature ? `signature=${signature}` : ''].filter(Boolean).join('&')
    const url = new URL(`${path}${query ? `?${query}` : ''}`, this.bases[market])
    let response
    try {
      response = await this.fetchImpl(url, {
        method,
        headers: { accept: 'application/json', 'user-agent': USER_AGENT, ...(signed ? { 'X-MBX-APIKEY': this.credentials.apiKey } : {}) },
        signal: AbortSignal.timeout(this.timeoutMs),
      })
    } catch (cause) {
      const timeout = cause?.name === 'TimeoutError' || cause?.cause?.name === 'TimeoutError'
      throw new BinanceExecutionError(timeout ? 'TIMEOUT' : 'NETWORK_ERROR', { outcomeUnknown: outcomeCanBeUnknown })
    }
    const retryAfter = Number(response.headers?.get?.('retry-after'))
    const text = await response.text()
    let data
    try { data = text ? JSON.parse(text) : {} } catch { throw new BinanceExecutionError('INVALID_RESPONSE', { status: response.status, outcomeUnknown: outcomeCanBeUnknown && response.status >= 500 }) }
    if (!response.ok || (Number.isFinite(Number(data?.code)) && Number(data.code) < 0)) {
      const exchangeCode = Number.isFinite(Number(data?.code)) && Number(data.code) < 0 ? data.code : null
      const code = response.status === 429 ? 'RATE_LIMITED' : response.status === 418 ? 'IP_BANNED' : response.status === 451 ? 'REGION_RESTRICTED' : exchangeCode ?? `HTTP_${response.status}`
      const unknown = outcomeCanBeUnknown && (response.status >= 500 || Number(data?.code) === -1007)
      throw new BinanceExecutionError(code, { status: response.status, outcomeUnknown: unknown, retryAfterMs: Number.isFinite(retryAfter) ? retryAfter * 1000 : null })
    }
    return data
  }
}

export const __test = { normalizeMarket, normalizeSymbol, orderType, averageFillPrice }
