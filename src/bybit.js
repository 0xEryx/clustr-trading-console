const DEFAULT_BASE_URL = 'https://api.bybit.com'
const USER_AGENT = 'Clustr-Trading-Console/0.2'
const CATEGORIES = new Set(['spot', 'linear', 'inverse'])
const INTERVALS = new Map([
  ['1', '1'], ['1m', '1'],
  ['3', '3'], ['3m', '3'],
  ['5', '5'], ['5m', '5'],
  ['15', '15'], ['15m', '15'],
  ['30', '30'], ['30m', '30'],
  ['60', '60'], ['1h', '60'],
  ['120', '120'], ['2h', '120'],
  ['240', '240'], ['4h', '240'],
  ['360', '360'], ['6h', '360'],
  ['720', '720'], ['12h', '720'],
  ['d', 'D'], ['1d', 'D'], ['D', 'D'],
  ['w', 'W'], ['1w', 'W'], ['W', 'W'],
  ['M', 'M'], ['1M', 'M'],
])

const INTERVAL_MS = new Map([
  ['1', 60_000], ['3', 180_000], ['5', 300_000], ['15', 900_000],
  ['30', 1_800_000], ['60', 3_600_000], ['120', 7_200_000],
  ['240', 14_400_000], ['360', 21_600_000], ['720', 43_200_000],
  ['D', 86_400_000], ['W', 604_800_000],
])

function clampInteger(value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(Math.max(Math.trunc(number), min), max)
}

function numberOrNull(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function normalizeCategory(value) {
  const category = String(value ?? 'linear').trim().toLowerCase()
  if (!CATEGORIES.has(category)) throw new TypeError('Bybit 市场类型必须是 spot、linear 或 inverse')
  return category
}

function normalizeSymbol(value) {
  const supplied = String(value ?? '').trim().toUpperCase()
  if (!supplied) throw new TypeError('请选择 Bybit 交易标的')
  const symbol = supplied.replace(/-SWAP$/, '').replace(/[-/_]/g, '')
  if (!/^[A-Z0-9]{2,32}$/.test(symbol)) throw new TypeError('Bybit 交易标的格式不正确')
  return symbol
}

function normalizeInterval(value) {
  const supplied = String(value ?? '15m').trim()
  const interval = INTERVALS.get(supplied) ?? INTERVALS.get(supplied.toLowerCase())
  if (!interval) throw new TypeError('Bybit K 线周期不受支持')
  return interval
}

function normalizeOptionalTimestamp(value, name) {
  if (value == null || value === '') return null
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 0) throw new TypeError(`${name} 必须是毫秒时间戳`)
  return number
}

function normalizeOptions(options, defaultCategory) {
  if (typeof options === 'string') return { category: normalizeCategory(options) }
  if (options == null) return { category: normalizeCategory(defaultCategory) }
  if (typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Bybit 请求选项格式不正确')
  return { ...options, category: normalizeCategory(options.category ?? defaultCategory) }
}

export class BybitPublicApiError extends Error {
  constructor(message, { status = null, code = null, retryable = false, cause } = {}) {
    super(message, { cause })
    this.name = 'BybitPublicApiError'
    this.exchange = 'bybit'
    this.status = status
    this.code = code
    this.retryable = retryable
  }
}

export class BybitPublicAdapter {
  constructor({ baseUrl = DEFAULT_BASE_URL, timeoutMs = 12_000, defaultCategory = 'linear', fetchImpl = globalThis.fetch } = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('缺少网络请求实现')
    this.baseUrl = new URL(baseUrl).origin
    this.timeoutMs = clampInteger(timeoutMs, 12_000, 1_000, 30_000)
    this.defaultCategory = normalizeCategory(defaultCategory)
    this.fetchImpl = fetchImpl
    this.health = 'unknown'
    this.lastError = null
    this.lastSuccessAt = null
    this.lastLatencyMs = null
    this.consecutiveFailures = 0
  }

  healthStatus() {
    return {
      exchange: 'bybit',
      status: this.health,
      lastSuccessAt: this.lastSuccessAt,
      lastLatencyMs: this.lastLatencyMs,
      consecutiveFailures: this.consecutiveFailures,
      lastError: this.lastError,
    }
  }

  markSuccess(startedAt) {
    this.health = 'ready'
    this.lastError = null
    this.lastSuccessAt = new Date().toISOString()
    this.lastLatencyMs = Date.now() - startedAt
    this.consecutiveFailures = 0
  }

  markFailure(error, startedAt) {
    this.health = 'degraded'
    this.lastError = String(error?.message ?? error)
    this.lastLatencyMs = Date.now() - startedAt
    this.consecutiveFailures += 1
  }

  async request(path, params) {
    const url = new URL(path, this.baseUrl)
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value != null && value !== '') url.searchParams.set(key, String(value))
    }
    const startedAt = Date.now()
    let response
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        headers: { accept: 'application/json', 'user-agent': USER_AGENT },
        signal: AbortSignal.timeout(this.timeoutMs),
      })
      const body = await response.text()
      let payload
      try { payload = body ? JSON.parse(body) : null }
      catch (cause) {
        if (!response.ok) throw new BybitPublicApiError(`Bybit 行情接口返回 HTTP ${response.status}，可能受到地区或网络策略限制`, {
          status: response.status,
          retryable: response.status === 429 || response.status >= 500,
          cause,
        })
        throw new BybitPublicApiError('Bybit 行情接口返回了无法识别的数据', {
          status: response.status,
          retryable: response.status >= 500,
          cause,
        })
      }
      if (!response.ok) {
        const detail = String(payload?.retMsg ?? payload?.message ?? body ?? '').slice(0, 240)
        throw new BybitPublicApiError(`Bybit 行情接口返回 HTTP ${response.status}${detail ? `：${detail}` : ''}`, {
          status: response.status,
          code: payload?.retCode ?? null,
          retryable: response.status === 429 || response.status >= 500,
        })
      }
      if (!payload || payload.retCode !== 0) {
        throw new BybitPublicApiError(`Bybit 行情请求被拒绝：${payload?.retMsg || '交易所未提供原因'}`, {
          status: response.status,
          code: payload?.retCode ?? null,
          retryable: false,
        })
      }
      this.markSuccess(startedAt)
      return payload
    } catch (cause) {
      const error = cause instanceof BybitPublicApiError
        ? cause
        : new BybitPublicApiError(
            cause?.name === 'TimeoutError' ? `Bybit 行情连接在 ${this.timeoutMs} 毫秒后超时` : 'Bybit 行情连接异常',
            { retryable: true, cause },
          )
      this.markFailure(error, startedAt)
      throw error
    }
  }

  async ticker(symbol, options = {}) {
    const normalizedSymbol = normalizeSymbol(symbol)
    const { category } = normalizeOptions(options, this.defaultCategory)
    const payload = await this.request('/v5/market/tickers', { category, symbol: normalizedSymbol })
    const row = payload.result?.list?.[0]
    if (!row) throw new BybitPublicApiError(`Bybit 没有返回 ${normalizedSymbol} 的行情`, { retryable: false })
    const last = numberOrNull(row.lastPrice)
    const previous = numberOrNull(row.prevPrice24h)
    const changeFraction = numberOrNull(row.price24hPcnt)
    const exchangeVolume = numberOrNull(row.volume24h)
    const exchangeTurnover = numberOrNull(row.turnover24h)
    const baseVolume = category === 'inverse' ? exchangeTurnover : exchangeVolume
    const quoteVolume = category === 'inverse' ? exchangeVolume : exchangeTurnover
    return {
      exchange: 'bybit',
      symbol: row.symbol ?? normalizedSymbol,
      marketType: payload.result?.category ?? category,
      timestamp: numberOrNull(payload.time) ?? Date.now(),
      price: last,
      bid: numberOrNull(row.bid1Price),
      bidSize: numberOrNull(row.bid1Size),
      ask: numberOrNull(row.ask1Price),
      askSize: numberOrNull(row.ask1Size),
      open24h: numberOrNull(row.prevPrice24h),
      price24hAgo: numberOrNull(row.prevPrice24h),
      high24h: numberOrNull(row.highPrice24h),
      low24h: numberOrNull(row.lowPrice24h),
      volume24h: baseVolume,
      quoteVolume24h: quoteVolume,
      exchangeVolume24h: exchangeVolume,
      exchangeTurnover24h: exchangeTurnover,
      priceChange24h: last != null && previous != null ? last - previous : null,
      priceChangeFraction24h: changeFraction,
      priceChangePercent24h: changeFraction == null ? null : changeFraction * 100,
      indexPrice: numberOrNull(row.indexPrice),
      markPrice: numberOrNull(row.markPrice),
      openInterest: numberOrNull(row.openInterest),
      fundingRate: numberOrNull(row.fundingRate),
      nextFundingTime: numberOrNull(row.nextFundingTime),
    }
  }

  async instruments(category = 'spot') {
    const normalizedCategory = normalizeCategory(category)
    const rows = []
    let cursor = ''
    for (let page = 0; page < 12; page += 1) {
      const payload = await this.request('/v5/market/instruments-info', { category: normalizedCategory, limit: 1000, cursor })
      rows.push(...(payload.result?.list ?? []))
      cursor = String(payload.result?.nextPageCursor ?? '')
      if (!cursor) break
    }
    return rows.filter((row) => !row.status || row.status === 'Trading').map((row) => ({
      exchange: 'bybit',
      symbol: String(row.symbol ?? ''),
      displaySymbol: `${row.baseCoin ?? ''}/${row.quoteCoin ?? row.settleCoin ?? ''}`.replace(/\/$/, ''),
      baseAsset: String(row.baseCoin ?? ''),
      quoteAsset: String(row.quoteCoin ?? row.settleCoin ?? ''),
      settleAsset: String(row.settleCoin ?? ''),
      marketType: normalizedCategory,
      state: 'live',
    })).filter((row) => row.symbol)
  }

  async klines(symbol, interval = '15m', limit = 200, options = {}) {
    const normalizedSymbol = normalizeSymbol(symbol)
    const normalizedInterval = normalizeInterval(interval)
    const requestedLimit = clampInteger(limit, 200, 1, 1000)
    const normalizedOptions = normalizeOptions(options, this.defaultCategory)
    const start = normalizeOptionalTimestamp(normalizedOptions.start, 'start')
    const end = normalizeOptionalTimestamp(normalizedOptions.end, 'end')
    if (start != null && end != null && start > end) throw new TypeError('Bybit K 线开始时间不能晚于结束时间')
    const payload = await this.request('/v5/market/kline', {
      category: normalizedOptions.category,
      symbol: normalizedSymbol,
      interval: normalizedInterval,
      limit: requestedLimit,
      start,
      end,
    })
    const intervalMs = INTERVAL_MS.get(normalizedInterval) ?? null
    const candles = (payload.result?.list ?? []).map((row) => {
      const timestamp = numberOrNull(row?.[0])
      const exchangeVolume = numberOrNull(row?.[5])
      const exchangeTurnover = numberOrNull(row?.[6])
      return {
        timestamp,
        endTimestamp: timestamp != null && intervalMs != null ? timestamp + intervalMs - 1 : null,
        open: numberOrNull(row?.[1]),
        high: numberOrNull(row?.[2]),
        low: numberOrNull(row?.[3]),
        close: numberOrNull(row?.[4]),
        volume: normalizedOptions.category === 'inverse' ? exchangeTurnover : exchangeVolume,
        quoteVolume: normalizedOptions.category === 'inverse' ? exchangeVolume : exchangeTurnover,
        exchangeVolume,
        exchangeTurnover,
        tradeCount: null,
        confirmed: null,
      }
    }).filter((row) => row.timestamp != null).sort((a, b) => a.timestamp - b.timestamp)
    return {
      exchange: 'bybit',
      symbol: payload.result?.symbol ?? normalizedSymbol,
      marketType: payload.result?.category ?? normalizedOptions.category,
      interval: normalizedInterval,
      timestamp: numberOrNull(payload.time) ?? Date.now(),
      candles,
    }
  }

  async book(symbol, limit = 20, options = {}) {
    const normalizedSymbol = normalizeSymbol(symbol)
    const normalizedOptions = normalizeOptions(options, this.defaultCategory)
    const max = normalizedOptions.category === 'option' ? 25 : 1000
    const requestedLimit = clampInteger(limit, 20, 1, max)
    const payload = await this.request('/v5/market/orderbook', {
      category: normalizedOptions.category,
      symbol: normalizedSymbol,
      limit: requestedLimit,
    })
    const result = payload.result ?? {}
    const levels = (rows) => (rows ?? []).map((row) => ({
      price: numberOrNull(row?.[0]),
      size: numberOrNull(row?.[1]),
      orders: null,
    })).filter((row) => row.price != null && row.size != null)
    return {
      exchange: 'bybit',
      symbol: result.s ?? normalizedSymbol,
      marketType: normalizedOptions.category,
      timestamp: numberOrNull(result.cts) ?? numberOrNull(result.ts) ?? numberOrNull(payload.time) ?? Date.now(),
      sourceTimestamp: numberOrNull(result.ts),
      updateId: numberOrNull(result.u),
      sequence: numberOrNull(result.seq),
      bids: levels(result.b),
      asks: levels(result.a),
    }
  }

  orderBook(symbol, limit = 20, options = {}) {
    return this.book(symbol, limit, options)
  }
}
