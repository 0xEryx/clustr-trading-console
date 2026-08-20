const DEFAULT_BASE_URL = 'https://api.hyperliquid.xyz'
const USER_AGENT = 'Clustr-Trading-Console/0.2'
const INTERVAL_MS = new Map([
  ['1m', 60_000], ['3m', 180_000], ['5m', 300_000], ['15m', 900_000],
  ['30m', 1_800_000], ['1h', 3_600_000], ['2h', 7_200_000],
  ['4h', 14_400_000], ['8h', 28_800_000], ['12h', 43_200_000],
  ['1d', 86_400_000], ['3d', 259_200_000], ['1w', 604_800_000],
  ['1M', 2_678_400_000],
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

function normalizeCoin(value) {
  let coin = String(value ?? '').trim()
  if (!coin) throw new TypeError('请选择 Hyperliquid 交易标的')
  if (/^[A-Za-z0-9]+:[A-Za-z0-9._-]+$/.test(coin)) return coin
  if (/^@[0-9]+$/.test(coin)) return coin
  if (/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(coin)) return coin.toUpperCase()
  coin = coin.toUpperCase().replace(/-SWAP$/, '').replace(/[-_/]?(USDT|USDC|USD)$/, '')
  if (!/^[A-Z0-9._-]{1,32}$/.test(coin)) throw new TypeError('Hyperliquid 交易标的格式不正确')
  return coin
}

function normalizeInterval(value) {
  const supplied = String(value ?? '15m').trim()
  const interval = supplied === '1M' ? '1M' : supplied.toLowerCase()
  if (!INTERVAL_MS.has(interval)) throw new TypeError('Hyperliquid K 线周期不受支持')
  return interval
}

function normalizeTimestamp(value, fallback, name) {
  if (value == null || value === '') return fallback
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < 0) throw new TypeError(`${name} 必须是毫秒时间戳`)
  return number
}

function normalizeDex(value) {
  const dex = String(value ?? '').trim()
  if (dex && !/^[A-Za-z0-9._-]{1,32}$/.test(dex)) throw new TypeError('Hyperliquid DEX 名称格式不正确')
  return dex
}

export class HyperliquidPublicApiError extends Error {
  constructor(message, { status = null, retryable = false, cause } = {}) {
    super(message, { cause })
    this.name = 'HyperliquidPublicApiError'
    this.exchange = 'hyperliquid'
    this.status = status
    this.code = null
    this.retryable = retryable
  }
}

export class HyperliquidPublicAdapter {
  constructor({ baseUrl = DEFAULT_BASE_URL, timeoutMs = 12_000, fetchImpl = globalThis.fetch } = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('缺少网络请求实现')
    this.baseUrl = new URL(baseUrl).origin
    this.timeoutMs = clampInteger(timeoutMs, 12_000, 1_000, 30_000)
    this.fetchImpl = fetchImpl
    this.health = 'unknown'
    this.lastError = null
    this.lastSuccessAt = null
    this.lastLatencyMs = null
    this.consecutiveFailures = 0
  }

  healthStatus() {
    return {
      exchange: 'hyperliquid',
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

  async request(body) {
    const startedAt = Date.now()
    try {
      const response = await this.fetchImpl(new URL('/info', this.baseUrl), {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'user-agent': USER_AGENT,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      })
      const text = await response.text()
      let payload
      try { payload = text ? JSON.parse(text) : null }
      catch (cause) {
        throw new HyperliquidPublicApiError('Hyperliquid 接口返回了无法识别的数据', {
          status: response.status,
          retryable: response.status >= 500,
          cause,
        })
      }
      if (!response.ok) {
        const detail = String(payload?.error ?? payload?.message ?? text ?? '').slice(0, 240)
        throw new HyperliquidPublicApiError(`Hyperliquid 接口返回 HTTP ${response.status}${detail ? `：${detail}` : ''}`, {
          status: response.status,
          retryable: response.status === 429 || response.status >= 500,
        })
      }
      if (payload == null || (typeof payload === 'object' && !Array.isArray(payload) && typeof payload.error === 'string')) {
        throw new HyperliquidPublicApiError(`Hyperliquid 请求被拒绝：${payload?.error || '交易所没有返回数据'}`, {
          status: response.status,
          retryable: false,
        })
      }
      this.markSuccess(startedAt)
      return payload
    } catch (cause) {
      const error = cause instanceof HyperliquidPublicApiError
        ? cause
        : new HyperliquidPublicApiError(
            cause?.name === 'TimeoutError' ? `Hyperliquid 账户接口在 ${this.timeoutMs} 毫秒后超时` : 'Hyperliquid 账户连接异常',
            { retryable: true, cause },
          )
      this.markFailure(error, startedAt)
      throw error
    }
  }

  async mids(options = {}) {
    if (options == null) options = {}
    if (typeof options === 'string') options = { dex: options }
    if (typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Hyperliquid 行情选项格式不正确')
    const dex = normalizeDex(options.dex)
    const payload = await this.request({ type: 'allMids', ...(dex ? { dex } : {}) })
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new HyperliquidPublicApiError('Hyperliquid 中间价数据格式不正确', { retryable: false })
    }
    const mids = Object.fromEntries(Object.entries(payload).map(([coin, price]) => [coin, numberOrNull(price)]).filter(([, price]) => price != null))
    return {
      exchange: 'hyperliquid',
      marketType: dex ? 'hip3-perpetual' : 'perpetual-and-spot',
      dex,
      timestamp: Date.now(),
      mids,
    }
  }

  async ticker(coin, options = {}) {
    const normalizedCoin = normalizeCoin(coin)
    const snapshot = await this.mids(options)
    const direct = snapshot.mids[normalizedCoin]
    const caseInsensitiveKey = direct == null
      ? Object.keys(snapshot.mids).find((key) => key.toUpperCase() === normalizedCoin.toUpperCase())
      : null
    const price = direct ?? (caseInsensitiveKey ? snapshot.mids[caseInsensitiveKey] : null)
    if (price == null) throw new HyperliquidPublicApiError(`Hyperliquid 没有返回 ${normalizedCoin} 的中间价`, { retryable: false })
    return {
      exchange: 'hyperliquid',
      symbol: caseInsensitiveKey ?? normalizedCoin,
      marketType: snapshot.dex
        ? 'hip3-perpetual'
        : normalizedCoin.includes('/') || normalizedCoin.startsWith('@') ? 'spot' : 'perpetual',
      timestamp: snapshot.timestamp,
      price,
      bid: null,
      bidSize: null,
      ask: null,
      askSize: null,
      open24h: null,
      price24hAgo: null,
      high24h: null,
      low24h: null,
      volume24h: null,
      quoteVolume24h: null,
      exchangeVolume24h: null,
      exchangeTurnover24h: null,
      priceChange24h: null,
      priceChangeFraction24h: null,
      priceChangePercent24h: null,
      indexPrice: null,
      markPrice: null,
      openInterest: null,
      fundingRate: null,
      nextFundingTime: null,
    }
  }

  async instruments() {
    const [perpetuals, spot] = await Promise.all([
      this.request({ type: 'meta' }),
      this.request({ type: 'spotMeta' }),
    ])
    const perpetualRows = (perpetuals?.universe ?? []).map((row) => ({
      exchange: 'hyperliquid',
      symbol: String(row.name ?? ''),
      displaySymbol: `${row.name ?? ''}/USDC`,
      baseAsset: String(row.name ?? ''),
      quoteAsset: 'USDC',
      marketType: 'perpetual',
      state: row.isDelisted ? 'inactive' : 'live',
    })).filter((row) => row.symbol && row.state === 'live')
    const tokens = new Map((spot?.tokens ?? []).map((row) => [Number(row.index), String(row.name ?? '')]))
    const spotRows = (spot?.universe ?? []).map((row) => {
      const baseAsset = tokens.get(Number(row.tokens?.[0])) ?? ''
      const quoteAsset = tokens.get(Number(row.tokens?.[1])) ?? 'USDC'
      return {
        exchange: 'hyperliquid',
        symbol: `@${row.index}`,
        displaySymbol: String(row.name ?? `${baseAsset}/${quoteAsset}`),
        baseAsset,
        quoteAsset,
        marketType: 'spot',
        state: row.isCanonical === false ? 'listed' : 'live',
      }
    }).filter((row) => row.symbol && row.baseAsset)
    return [...perpetualRows, ...spotRows]
  }

  async klines(coin, interval = '15m', limit = 200, options = {}) {
    const normalizedCoin = normalizeCoin(coin)
    const normalizedInterval = normalizeInterval(interval)
    const requestedLimit = clampInteger(limit, 200, 1, 500)
    if (options == null) options = {}
    if (typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Hyperliquid K 线选项格式不正确')
    const endTime = normalizeTimestamp(options.endTime ?? options.end, Date.now(), 'endTime')
    const defaultStart = Math.max(0, endTime - INTERVAL_MS.get(normalizedInterval) * (requestedLimit + 1))
    const startTime = normalizeTimestamp(options.startTime ?? options.start, defaultStart, 'startTime')
    if (startTime > endTime) throw new TypeError('Hyperliquid K 线开始时间不能晚于结束时间')
    const payload = await this.request({
      type: 'candleSnapshot',
      req: { coin: normalizedCoin, interval: normalizedInterval, startTime, endTime },
    })
    if (!Array.isArray(payload)) throw new HyperliquidPublicApiError('Hyperliquid K 线数据格式不正确', { retryable: false })
    const candles = payload.map((row) => ({
      timestamp: numberOrNull(row?.t),
      endTimestamp: numberOrNull(row?.T),
      open: numberOrNull(row?.o),
      high: numberOrNull(row?.h),
      low: numberOrNull(row?.l),
      close: numberOrNull(row?.c),
      volume: numberOrNull(row?.v),
      quoteVolume: null,
      exchangeVolume: numberOrNull(row?.v),
      exchangeTurnover: null,
      tradeCount: numberOrNull(row?.n),
      confirmed: numberOrNull(row?.T) != null ? Number(row.T) < Date.now() : null,
    })).filter((row) => row.timestamp != null).sort((a, b) => a.timestamp - b.timestamp).slice(-requestedLimit)
    return {
      exchange: 'hyperliquid',
      symbol: normalizedCoin,
      marketType: normalizedCoin.includes('/') || normalizedCoin.startsWith('@') ? 'spot' : 'perpetual',
      interval: normalizedInterval,
      timestamp: Date.now(),
      candles,
    }
  }

  async l2Book(coin, options = {}) {
    const normalizedCoin = normalizeCoin(coin)
    if (typeof options === 'number') options = { limit: options }
    if (options == null) options = {}
    if (typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Hyperliquid 订单簿选项格式不正确')
    const limit = clampInteger(options.limit, 20, 1, 20)
    const body = { type: 'l2Book', coin: normalizedCoin }
    if (options.nSigFigs != null) {
      const nSigFigs = Number(options.nSigFigs)
      if (![2, 3, 4, 5].includes(nSigFigs)) throw new TypeError('Hyperliquid nSigFigs 必须是 2、3、4 或 5')
      body.nSigFigs = nSigFigs
      if (options.mantissa != null) {
        const mantissa = Number(options.mantissa)
        if (nSigFigs !== 5 || ![1, 2, 5].includes(mantissa)) throw new TypeError('Hyperliquid mantissa 只能在 nSigFigs 为 5 时使用 1、2 或 5')
        body.mantissa = mantissa
      }
    } else if (options.mantissa != null) {
      throw new TypeError('Hyperliquid mantissa 要求 nSigFigs 为 5')
    }
    const payload = await this.request(body)
    if (!payload || !Array.isArray(payload.levels) || payload.levels.length < 2) {
      throw new HyperliquidPublicApiError('Hyperliquid 订单簿数据格式不正确', { retryable: false })
    }
    const levels = (rows) => (rows ?? []).slice(0, limit).map((row) => ({
      price: numberOrNull(row?.px),
      size: numberOrNull(row?.sz),
      orders: numberOrNull(row?.n),
    })).filter((row) => row.price != null && row.size != null)
    return {
      exchange: 'hyperliquid',
      symbol: payload?.coin ?? normalizedCoin,
      marketType: normalizedCoin.includes('/') || normalizedCoin.startsWith('@') ? 'spot' : 'perpetual',
      timestamp: numberOrNull(payload?.time) ?? Date.now(),
      sourceTimestamp: numberOrNull(payload?.time),
      updateId: null,
      sequence: null,
      bids: levels(payload?.levels?.[0]),
      asks: levels(payload?.levels?.[1]),
    }
  }

  book(coin, limit = 20, options = {}) {
    if (options == null) options = {}
    if (typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Hyperliquid 订单簿选项格式不正确')
    return this.l2Book(coin, { ...options, limit })
  }

  orderBook(coin, limit = 20, options = {}) {
    return this.book(coin, limit, options)
  }
}
