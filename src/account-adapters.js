import { createHmac } from 'node:crypto'

const USER_AGENT = 'Clustr-Trading-Console/0.2'
const TIMEOUT_MS = 12_000

class AccountApiError extends Error {
  constructor(exchange, code, status) {
    super(`${exchange} account request failed`)
    this.name = 'AccountApiError'
    this.exchange = exchange
    this.code = code == null ? null : String(code).slice(0, 64)
    this.status = Number.isFinite(Number(status)) ? Number(status) : null
  }
}

function numberOrNull(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function nonZero(value) {
  const number = numberOrNull(value)
  return number != null && Math.abs(number) > 0
}

function sanitizedError(scope, error) {
  const status = Number.isFinite(Number(error?.status)) ? Number(error.status) : null
  const code = error?.code == null ? null : String(error.code).slice(0, 64)
  const exchangeCodeReason = ({
    '50105': 'API Passphrase 与创建该 API Key 时设置的 Passphrase 不一致',
    '50110': '当前网络出口未加入 API Key 的 IP 白名单',
    '50113': 'API 签名校验失败',
    '-2014': 'API Key 格式被交易所拒绝',
    '-2015': 'API Key、权限或 IP 白名单被交易所拒绝',
    '10003': 'API Key 被交易所拒绝',
    '10005': 'API Key 缺少所需读取权限',
    '10010': '当前网络出口未加入 API Key 的 IP 白名单',
    'NON_JSON_HTTP_ERROR': '交易所拒绝当前地区或网络访问',
  })[code]
  const reason = exchangeCodeReason ?? (error?.name === 'TimeoutError' || error?.cause?.name === 'TimeoutError'
    ? '连接超时'
    : code === 'NETWORK_ERROR' || status === 0
      ? '交易所连接异常'
    : status === 451
      ? '当前地区或网络无法访问交易所官方接口'
    : status === 401 || status === 403
      ? '凭证或权限被交易所拒绝'
      : status === 429
        ? '请求频率受限'
        : status != null
        ? `交易所返回 HTTP ${status}`
          : '交易所连接异常')
  return { scope, reason, status, code }
}

async function jsonRequest(exchange, url, options = {}, fetchImpl = fetch) {
  let response
  try {
    response = await fetchImpl(url, {
      ...options,
      headers: { accept: 'application/json', 'user-agent': USER_AGENT, ...(options.headers ?? {}) },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (cause) {
    if (cause?.name === 'TimeoutError') throw cause
    throw new AccountApiError(exchange, 'NETWORK_ERROR', null)
  }
  const text = await response.text()
  let payload = null
  try { payload = text ? JSON.parse(text) : null }
  catch { throw new AccountApiError(exchange, response.ok ? 'INVALID_JSON' : 'NON_JSON_HTTP_ERROR', response.status) }
  if (!response.ok) throw new AccountApiError(exchange, payload?.code ?? payload?.retCode ?? 'HTTP_ERROR', response.status)
  return payload
}

function combine(scopes) {
  const fulfilled = scopes.filter((item) => item.result.status === 'fulfilled')
  const errors = scopes.filter((item) => item.result.status === 'rejected').map((item) => sanitizedError(item.scope, item.result.reason))
  return {
    readStatus: fulfilled.length === scopes.length ? 'ready' : fulfilled.length > 0 ? 'partial' : 'error',
    scopes: scopes.map((item) => ({ scope: item.scope, status: item.result.status === 'fulfilled' ? 'ready' : 'error' })),
    errors,
  }
}

function okxHeaders(credentials, method, requestPath, body = '') {
  const timestamp = new Date().toISOString()
  const signature = createHmac('sha256', credentials.secretKey).update(timestamp + method + requestPath + body).digest('base64')
  return {
    'OK-ACCESS-KEY': credentials.apiKey,
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': credentials.passphrase,
  }
}

async function okxGet(credentials, requestPath, demo, fetchImpl) {
  const headers = okxHeaders(credentials, 'GET', requestPath)
  if (demo) headers['x-simulated-trading'] = '1'
  const payload = await jsonRequest('okx', new URL(requestPath, 'https://www.okx.com'), { headers }, fetchImpl)
  if (String(payload?.code ?? '0') !== '0') throw new AccountApiError('okx', payload?.code ?? 'EXCHANGE_REJECTED', 200)
  return payload
}

async function readOkx(credentials, { demo = false, fetchImpl = fetch } = {}) {
  const [balanceResult, positionsResult, configResult, ordersResult] = await Promise.allSettled([
    okxGet(credentials, '/api/v5/account/balance', demo, fetchImpl),
    okxGet(credentials, '/api/v5/account/positions', demo, fetchImpl),
    okxGet(credentials, '/api/v5/account/config', demo, fetchImpl),
    okxGet(credentials, '/api/v5/trade/orders-pending', demo, fetchImpl),
  ])
  const balanceRoot = balanceResult.status === 'fulfilled' ? balanceResult.value?.data?.[0] : null
  const balances = (balanceRoot?.details ?? []).map((row) => ({
    asset: String(row.ccy ?? ''), total: numberOrNull(row.eq ?? row.cashBal), available: numberOrNull(row.availEq ?? row.availBal), locked: numberOrNull(row.frozenBal), usdValue: numberOrNull(row.eqUsd), accountType: demo ? 'demo' : 'live',
  })).filter((row) => row.asset && (nonZero(row.total) || nonZero(row.usdValue)))
  const positions = (positionsResult.status === 'fulfilled' ? positionsResult.value?.data ?? [] : []).map((row) => ({
    symbol: String(row.instId ?? ''), marketType: String(row.instType ?? '').toLowerCase(), side: row.posSide === 'net' ? (Number(row.pos) >= 0 ? 'long' : 'short') : String(row.posSide ?? ''), size: numberOrNull(row.pos), entryPrice: numberOrNull(row.avgPx), markPrice: numberOrNull(row.markPx), unrealizedPnl: numberOrNull(row.upl), leverage: numberOrNull(row.lever), liquidationPrice: numberOrNull(row.liqPx), marginMode: String(row.mgnMode ?? ''), margin: numberOrNull(row.margin),
  })).filter((row) => row.symbol && nonZero(row.size))
  const orders = (ordersResult.status === 'fulfilled' ? ordersResult.value?.data ?? [] : []).map((row) => ({
    exchange: 'okx', id: String(row.ordId ?? ''), clientOrderId: String(row.clOrdId ?? ''), symbol: String(row.instId ?? ''), marketType: String(row.instType ?? '').toLowerCase(), side: String(row.side ?? '').toLowerCase(), positionSide: String(row.posSide ?? '').toLowerCase(), orderType: String(row.ordType ?? '').toLowerCase(), size: numberOrNull(row.sz), filledSize: numberOrNull(row.accFillSz), price: numberOrNull(row.px), averageFillPrice: numberOrNull(row.avgPx), reduceOnly: String(row.reduceOnly ?? '').toLowerCase() === 'true', status: String(row.state ?? 'open').toLowerCase(), createdAt: numberOrNull(row.cTime), updatedAt: numberOrNull(row.uTime),
  })).filter((row) => row.symbol && (row.id || row.clientOrderId))
  const accountConfig = configResult.status === 'fulfilled' ? configResult.value?.data?.[0] : null
  const permissions = String(accountConfig?.perm ?? '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
  const highRisk = permissions.some((item) => /withdraw|transfer/.test(item))
  return {
    ...combine([{ scope: 'balance', result: balanceResult }, { scope: 'positions', result: positionsResult }, { scope: 'permissions', result: configResult }, { scope: 'open-orders', result: ordersResult }]),
    totalEquityUsd: numberOrNull(balanceRoot?.totalEq), balances, positions, orders, openOrderCount: orders.length,
    security: { permissions, canTrade: permissions.includes('trade'), highRisk, highRiskReason: highRisk ? 'API Key 含提现或划转权限' : null },
    environment: demo ? 'demo' : 'live', readAt: Date.now(),
  }
}

function binanceSignedQuery(credentials, params = {}, timestampOffsetMs = 0) {
  const query = new URLSearchParams({ ...params, recvWindow: '5000', timestamp: String(Date.now() + (Number(timestampOffsetMs) || 0)) }).toString()
  const signature = createHmac('sha256', credentials.secretKey).update(query).digest('hex')
  return `${query}&signature=${signature}`
}

async function binanceGet(credentials, base, path, params = {}, fetchImpl = fetch, timestampOffsetMs = 0) {
  const query = binanceSignedQuery(credentials, params, timestampOffsetMs)
  return jsonRequest('binance', new URL(`${path}?${query}`, base), { headers: { 'X-MBX-APIKEY': credentials.apiKey } }, fetchImpl)
}

async function readBinance(credentials, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch
  let spotOffsetMs = Number(options.timestampOffsetMs) || 0
  let futuresOffsetMs = spotOffsetMs
  if (!Object.hasOwn(options, 'timestampOffsetMs')) {
    const [spotClock, futuresClock] = await Promise.allSettled([
      jsonRequest('binance', new URL('/api/v3/time', 'https://api.binance.com'), {}, fetchImpl),
      jsonRequest('binance', new URL('/fapi/v1/time', 'https://fapi.binance.com'), {}, fetchImpl),
    ])
    if (spotClock.status === 'fulfilled' && Number.isFinite(Number(spotClock.value?.serverTime))) spotOffsetMs = Number(spotClock.value.serverTime) - Date.now()
    if (futuresClock.status === 'fulfilled' && Number.isFinite(Number(futuresClock.value?.serverTime))) futuresOffsetMs = Number(futuresClock.value.serverTime) - Date.now()
  }
  const [spotResult, futuresAccountResult, futuresPositionsResult, spotOrdersResult, futuresOrdersResult] = await Promise.allSettled([
    binanceGet(credentials, 'https://api.binance.com', '/api/v3/account', { omitZeroBalances: 'true' }, fetchImpl, spotOffsetMs),
    binanceGet(credentials, 'https://fapi.binance.com', '/fapi/v3/account', {}, fetchImpl, futuresOffsetMs),
    binanceGet(credentials, 'https://fapi.binance.com', '/fapi/v3/positionRisk', {}, fetchImpl, futuresOffsetMs),
    binanceGet(credentials, 'https://api.binance.com', '/api/v3/openOrders', {}, fetchImpl, spotOffsetMs),
    binanceGet(credentials, 'https://fapi.binance.com', '/fapi/v1/openOrders', {}, fetchImpl, futuresOffsetMs),
  ])
  const spot = spotResult.status === 'fulfilled' ? spotResult.value : null
  const futures = futuresAccountResult.status === 'fulfilled' ? futuresAccountResult.value : null
  const balances = [
    ...(spot?.balances ?? []).map((row) => ({ asset: String(row.asset ?? ''), total: (numberOrNull(row.free) ?? 0) + (numberOrNull(row.locked) ?? 0), available: numberOrNull(row.free), locked: numberOrNull(row.locked), usdValue: null, accountType: 'spot' })),
    ...(futures?.assets ?? []).map((row) => ({ asset: String(row.asset ?? ''), total: numberOrNull(row.walletBalance), available: numberOrNull(row.availableBalance), locked: null, usdValue: row.asset === 'USDT' || row.asset === 'USDC' ? numberOrNull(row.marginBalance) : null, accountType: 'usd-m-futures' })),
  ].filter((row) => row.asset && nonZero(row.total))
  const positions = (futuresPositionsResult.status === 'fulfilled' ? futuresPositionsResult.value ?? [] : []).map((row) => ({
    symbol: String(row.symbol ?? ''), marketType: 'usd-m-futures', side: Number(row.positionAmt) >= 0 ? 'long' : 'short', size: numberOrNull(row.positionAmt), entryPrice: numberOrNull(row.entryPrice), markPrice: numberOrNull(row.markPrice), unrealizedPnl: numberOrNull(row.unRealizedProfit), leverage: numberOrNull(row.leverage), liquidationPrice: numberOrNull(row.liquidationPrice), marginMode: row.isolated === true || String(row.marginType).toLowerCase() === 'isolated' ? 'isolated' : 'cross', margin: numberOrNull(row.isolatedMargin),
  })).filter((row) => row.symbol && nonZero(row.size))
  const mapOrder = (row, marketType) => ({
    exchange: 'binance', id: String(row.orderId ?? ''), clientOrderId: String(row.clientOrderId ?? ''), symbol: String(row.symbol ?? ''), marketType, side: String(row.side ?? '').toLowerCase(), positionSide: String(row.positionSide ?? '').toLowerCase(), orderType: String(row.type ?? '').toLowerCase(), size: numberOrNull(row.origQty), filledSize: numberOrNull(row.executedQty), price: numberOrNull(row.price), averageFillPrice: numberOrNull(row.avgPrice), reduceOnly: row.reduceOnly === true, status: String(row.status ?? 'open').toLowerCase(), createdAt: numberOrNull(row.time), updatedAt: numberOrNull(row.updateTime),
  })
  const orders = [
    ...(spotOrdersResult.status === 'fulfilled' && Array.isArray(spotOrdersResult.value) ? spotOrdersResult.value.map((row) => mapOrder(row, 'spot')) : []),
    ...(futuresOrdersResult.status === 'fulfilled' && Array.isArray(futuresOrdersResult.value) ? futuresOrdersResult.value.map((row) => mapOrder(row, 'usd-m-futures')) : []),
  ].filter((row) => row.symbol && (row.id || row.clientOrderId))
  const highRisk = spot?.canWithdraw === true
  return {
    ...combine([{ scope: 'spot', result: spotResult }, { scope: 'futures-account', result: futuresAccountResult }, { scope: 'futures-positions', result: futuresPositionsResult }, { scope: 'spot-open-orders', result: spotOrdersResult }, { scope: 'futures-open-orders', result: futuresOrdersResult }]),
    totalEquityUsd: numberOrNull(futures?.totalMarginBalance), balances, positions, orders, openOrderCount: orders.length,
    security: {
      permissions: Array.isArray(spot?.permissions) ? spot.permissions.map(String) : [],
      canTrade: spot?.canTrade === true || futures?.canTrade === true,
      marketPermissions: { spotCanTrade: spot?.canTrade === true, futuresCanTrade: futures?.canTrade === true },
      highRisk,
      highRiskReason: highRisk ? 'API Key 含提现权限' : null,
    },
    environment: 'live', readAt: Date.now(),
  }
}

function sortedQuery(params) {
  return new URLSearchParams(Object.entries(params).filter(([, value]) => value != null && value !== '').sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, String(value)])).toString()
}

async function bybitGet(credentials, path, params, fetchImpl = fetch) {
  const timestamp = String(Date.now())
  const recvWindow = '5000'
  const query = sortedQuery(params)
  const signature = createHmac('sha256', credentials.secretKey).update(timestamp + credentials.apiKey + recvWindow + query).digest('hex')
  const baseUrl = credentials.testnet === true ? 'https://api-testnet.bybit.com' : 'https://api.bybit.com'
  const payload = await jsonRequest('bybit', new URL(`${path}?${query}`, baseUrl), { headers: {
    'X-BAPI-API-KEY': credentials.apiKey,
    'X-BAPI-TIMESTAMP': timestamp,
    'X-BAPI-RECV-WINDOW': recvWindow,
    'X-BAPI-SIGN': signature,
  } }, fetchImpl)
  if (Number(payload?.retCode) !== 0) throw new AccountApiError('bybit', payload?.retCode ?? 'EXCHANGE_REJECTED', 200)
  return payload
}

async function readBybit(credentials, { fetchImpl = fetch } = {}) {
  const [walletResult, usdtResult, usdcResult, inverseResult, permissionResult, spotOrdersResult, linearOrdersResult, inverseOrdersResult] = await Promise.allSettled([
    bybitGet(credentials, '/v5/account/wallet-balance', { accountType: 'UNIFIED' }, fetchImpl),
    bybitGet(credentials, '/v5/position/list', { category: 'linear', settleCoin: 'USDT' }, fetchImpl),
    bybitGet(credentials, '/v5/position/list', { category: 'linear', settleCoin: 'USDC' }, fetchImpl),
    bybitGet(credentials, '/v5/position/list', { category: 'inverse', settleCoin: 'BTC' }, fetchImpl),
    bybitGet(credentials, '/v5/user/query-api', {}, fetchImpl),
    bybitGet(credentials, '/v5/order/realtime', { category: 'spot', openOnly: 0, limit: 50 }, fetchImpl),
    bybitGet(credentials, '/v5/order/realtime', { category: 'linear', openOnly: 0, limit: 50 }, fetchImpl),
    bybitGet(credentials, '/v5/order/realtime', { category: 'inverse', openOnly: 0, limit: 50 }, fetchImpl),
  ])
  const wallet = walletResult.status === 'fulfilled' ? walletResult.value?.result?.list?.[0] : null
  const balances = (wallet?.coin ?? []).map((row) => ({ asset: String(row.coin ?? ''), total: numberOrNull(row.walletBalance), available: numberOrNull(row.availableToWithdraw ?? row.availableBalance), locked: numberOrNull(row.locked), usdValue: numberOrNull(row.usdValue), accountType: 'unified' })).filter((row) => row.asset && (nonZero(row.total) || nonZero(row.usdValue)))
  const positionRows = [usdtResult, usdcResult, inverseResult].flatMap((result) => result.status === 'fulfilled' ? result.value?.result?.list ?? [] : [])
  const positions = positionRows.map((row) => ({ symbol: String(row.symbol ?? ''), marketType: String(row.category ?? 'derivatives'), side: String(row.side ?? '').toLowerCase(), size: numberOrNull(row.size), entryPrice: numberOrNull(row.avgPrice), markPrice: numberOrNull(row.markPrice), unrealizedPnl: numberOrNull(row.unrealisedPnl), leverage: numberOrNull(row.leverage), liquidationPrice: numberOrNull(row.liqPrice), marginMode: Number(row.tradeMode) === 1 ? 'isolated' : 'cross', margin: numberOrNull(row.positionIM) })).filter((row) => row.symbol && nonZero(row.size))
  const bybitOrders = (result, marketType) => result.status === 'fulfilled' ? (result.value?.result?.list ?? []).map((row) => ({
    exchange: 'bybit', id: String(row.orderId ?? ''), clientOrderId: String(row.orderLinkId ?? ''), symbol: String(row.symbol ?? ''), marketType, side: String(row.side ?? '').toLowerCase(), positionSide: '', orderType: String(row.orderType ?? '').toLowerCase(), size: numberOrNull(row.qty), filledSize: numberOrNull(row.cumExecQty), price: numberOrNull(row.price), averageFillPrice: numberOrNull(row.avgPrice), reduceOnly: row.reduceOnly === true, status: String(row.orderStatus ?? 'open').toLowerCase(), createdAt: numberOrNull(row.createdTime), updatedAt: numberOrNull(row.updatedTime),
  })).filter((row) => row.symbol && (row.id || row.clientOrderId)) : []
  const orders = [...bybitOrders(spotOrdersResult, 'spot'), ...bybitOrders(linearOrdersResult, 'linear'), ...bybitOrders(inverseOrdersResult, 'inverse')]
  const permission = permissionResult.status === 'fulfilled' ? permissionResult.value?.result : null
  const permissionText = JSON.stringify(permission?.permissions ?? {}).toLowerCase()
  const highRisk = /withdraw|transfer/.test(permissionText)
  return {
    ...combine([{ scope: 'wallet', result: walletResult }, { scope: 'linear-usdt', result: usdtResult }, { scope: 'linear-usdc', result: usdcResult }, { scope: 'inverse-btc', result: inverseResult }, { scope: 'permissions', result: permissionResult }, { scope: 'spot-open-orders', result: spotOrdersResult }, { scope: 'linear-open-orders', result: linearOrdersResult }, { scope: 'inverse-open-orders', result: inverseOrdersResult }]),
    totalEquityUsd: numberOrNull(wallet?.totalEquity), balances, positions, orders, openOrderCount: orders.length,
    security: { permissions: [], canTrade: permission ? Number(permission.readOnly) === 0 : null, highRisk, highRiskReason: highRisk ? 'API Key 含资金划转权限' : null },
    environment: credentials.testnet === true ? 'testnet' : 'live', readAt: Date.now(),
  }
}

async function hyperInfo(body, fetchImpl = fetch) {
  const payload = await jsonRequest('hyperliquid', new URL('/info', 'https://api.hyperliquid.xyz'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }, fetchImpl)
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && payload.error) throw new AccountApiError('hyperliquid', 'EXCHANGE_REJECTED', 200)
  return payload
}

async function readHyperliquid(credentials, { fetchImpl = fetch } = {}) {
  const user = credentials.accountAddress
  const [perpsResult, spotResult, ordersResult] = await Promise.allSettled([
    hyperInfo({ type: 'clearinghouseState', user }, fetchImpl),
    hyperInfo({ type: 'spotClearinghouseState', user }, fetchImpl),
    hyperInfo({ type: 'openOrders', user }, fetchImpl),
  ])
  const perps = perpsResult.status === 'fulfilled' ? perpsResult.value : null
  const spot = spotResult.status === 'fulfilled' ? spotResult.value : null
  const balances = (spot?.balances ?? []).map((row) => ({ asset: String(row.coin ?? ''), total: numberOrNull(row.total), available: (numberOrNull(row.total) ?? 0) - (numberOrNull(row.hold) ?? 0), locked: numberOrNull(row.hold), usdValue: null, accountType: 'spot' })).filter((row) => row.asset && nonZero(row.total))
  const positions = (perps?.assetPositions ?? []).map((item) => item?.position ?? {}).map((row) => ({ symbol: String(row.coin ?? ''), marketType: 'perpetual', side: Number(row.szi) >= 0 ? 'long' : 'short', size: numberOrNull(row.szi), entryPrice: numberOrNull(row.entryPx), markPrice: null, unrealizedPnl: numberOrNull(row.unrealizedPnl), leverage: numberOrNull(row.leverage?.value), liquidationPrice: numberOrNull(row.liquidationPx), marginMode: String(row.leverage?.type ?? ''), margin: numberOrNull(row.marginUsed) })).filter((row) => row.symbol && nonZero(row.size))
  const orders = (ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value) ? ordersResult.value : []).map((row) => ({
    exchange: 'hyperliquid', id: String(row.oid ?? ''), clientOrderId: String(row.cloid ?? ''), symbol: String(row.coin ?? ''), marketType: 'perpetual', side: String(row.side ?? '').toUpperCase() === 'B' ? 'buy' : 'sell', positionSide: '', orderType: String(row.orderType ?? row.orderTypeName ?? 'limit').toLowerCase(), size: numberOrNull(row.sz), filledSize: null, price: numberOrNull(row.limitPx), averageFillPrice: null, reduceOnly: row.reduceOnly === true, status: 'open', createdAt: numberOrNull(row.timestamp), updatedAt: null,
  })).filter((row) => row.symbol && row.id)
  return { ...combine([{ scope: 'perpetual', result: perpsResult }, { scope: 'spot', result: spotResult }, { scope: 'open-orders', result: ordersResult }]), totalEquityUsd: numberOrNull(perps?.marginSummary?.accountValue), balances, positions, orders, openOrderCount: orders.length, signerConfigured: Boolean(credentials.privateKey), environment: 'live', readAt: Date.now() }
}

export async function readExchangeAccount(exchange, credentials, options = {}) {
  if (!credentials || typeof credentials !== 'object') throw new AccountApiError(exchange, 'CREDENTIALS_MISSING', null)
  if (exchange === 'okx') return readOkx(credentials, options)
  if (exchange === 'binance') return readBinance(credentials, options)
  if (exchange === 'bybit') return readBybit(credentials, options)
  if (exchange === 'hyperliquid') return readHyperliquid(credentials, options)
  throw new AccountApiError(exchange, 'UNSUPPORTED_EXCHANGE', null)
}
