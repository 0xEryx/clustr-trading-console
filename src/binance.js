const PUBLIC_BASE = 'https://data-api.binance.vision'
const FUTURES_BASE = 'https://fapi.binance.com'

async function request(fetchImpl, path, params = {}, base = PUBLIC_BASE) {
  const url = new URL(path, base)
  for (const [key, value] of Object.entries(params)) if (value != null && value !== '') url.searchParams.set(key, String(value))
  const response = await fetchImpl(url, { headers: { accept: 'application/json', 'user-agent': 'Clustr-Trading-Console/0.2' }, signal: AbortSignal.timeout(12000) })
  if (!response.ok) throw new Error(`Binance 行情接口返回 HTTP ${response.status}`)
  return response.json()
}

export class BinancePublicAdapter {
  constructor({ fetchImpl = fetch } = {}) { this.fetchImpl = fetchImpl; this.health = 'unknown'; this.lastError = null; this.lastSuccessAt = null; this.lastLatencyMs = null; this.consecutiveFailures = 0 }

  healthStatus() { return { exchange: 'binance', status: this.health, lastError: this.lastError, lastSuccessAt: this.lastSuccessAt, lastLatencyMs: this.lastLatencyMs, consecutiveFailures: this.consecutiveFailures } }

  async call(operation) {
    const startedAt = Date.now()
    try {
      const value = await operation()
      this.health = 'ready'; this.lastError = null; this.lastSuccessAt = new Date().toISOString(); this.lastLatencyMs = Date.now() - startedAt; this.consecutiveFailures = 0
      return value
    } catch (error) {
      this.health = 'degraded'; this.lastError = String(error?.message ?? error).slice(0, 240); this.lastLatencyMs = Date.now() - startedAt; this.consecutiveFailures += 1
      throw error
    }
  }

  async ticker(symbol, options = {}) {
    const futures = options?.marketType === 'usd-m-futures'
    return this.call(() => request(this.fetchImpl, futures ? '/fapi/v1/ticker/24hr' : '/api/v3/ticker/24hr', { symbol }, futures ? FUTURES_BASE : PUBLIC_BASE))
  }

  async klines(symbol, interval = '15m', limit = 200, options = {}) {
    const futures = options?.marketType === 'usd-m-futures'
    return this.call(() => request(this.fetchImpl, futures ? '/fapi/v1/klines' : '/api/v3/klines', { symbol, interval, limit: Math.min(Math.max(Number(limit) || 200, 1), 1000) }, futures ? FUTURES_BASE : PUBLIC_BASE))
  }

  async book(symbol, limit = 20, options = {}) {
    const futures = options?.marketType === 'usd-m-futures'
    return this.call(() => request(this.fetchImpl, futures ? '/fapi/v1/depth' : '/api/v3/depth', { symbol, limit: Math.min(Math.max(Number(limit) || 20, 5), 100) }, futures ? FUTURES_BASE : PUBLIC_BASE))
  }

  async trades(symbol, limit = 50) {
    return this.call(() => request(this.fetchImpl, '/api/v3/trades', { symbol, limit: Math.min(Math.max(Number(limit) || 50, 1), 1000) }))
  }

  async instruments(marketType = 'all') {
    const includeSpot = marketType === 'all' || marketType === 'spot'
    const includeFutures = marketType === 'all' || marketType === 'usd-m-futures'
    const [spotResult, futuresResult] = await this.call(() => Promise.allSettled([
      includeSpot ? request(this.fetchImpl, '/api/v3/exchangeInfo') : Promise.resolve(null),
      includeFutures ? request(this.fetchImpl, '/fapi/v1/exchangeInfo', {}, FUTURES_BASE) : Promise.resolve(null),
    ]))
    if ((!includeSpot || spotResult.status === 'rejected') && (!includeFutures || futuresResult.status === 'rejected')) throw (spotResult.status === 'rejected' ? spotResult.reason : futuresResult.reason)
    const spot = spotResult.status === 'fulfilled' ? spotResult.value : null
    const futures = futuresResult.status === 'fulfilled' ? futuresResult.value : null
    const spotRows = (spot?.symbols ?? []).filter((row) => row?.status === 'TRADING').map((row) => ({
      exchange: 'binance',
      symbol: String(row.symbol ?? ''),
      displaySymbol: `${row.baseAsset}/${row.quoteAsset}`,
      baseAsset: String(row.baseAsset ?? ''),
      quoteAsset: String(row.quoteAsset ?? ''),
      marketType: 'spot',
      state: 'live',
    })).filter((row) => row.symbol && row.baseAsset && row.quoteAsset)
    const futuresRows = (futures?.symbols ?? []).filter((row) => row?.status === 'TRADING' && row?.contractType === 'PERPETUAL').map((row) => ({
      exchange: 'binance',
      symbol: String(row.symbol ?? ''),
      displaySymbol: `${row.baseAsset}/${row.quoteAsset} 永续`,
      baseAsset: String(row.baseAsset ?? ''),
      quoteAsset: String(row.quoteAsset ?? ''),
      settleAsset: String(row.marginAsset ?? ''),
      marketType: 'usd-m-futures',
      state: 'live',
    })).filter((row) => row.symbol && row.baseAsset && row.quoteAsset)
    return [...spotRows, ...futuresRows]
  }
}
