import { createHash } from 'node:crypto'

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function round(value, digits = 6) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : null
}

function candleRows(value) {
  const rows = Array.isArray(value?.candles) ? value.candles : []
  return rows.map((row) => ({
    timestamp: number(row?.timestamp ?? row?.ts),
    open: number(row?.open ?? row?.o),
    high: number(row?.high ?? row?.h),
    low: number(row?.low ?? row?.l),
    close: number(row?.close ?? row?.c),
    volume: number(row?.volume ?? row?.vol),
  })).filter((row) => [row.open, row.high, row.low, row.close].every(Number.isFinite))
}

function levelRows(book, side) {
  const nested = Array.isArray(book?.data?.data) ? book.data.data[0]
    : Array.isArray(book?.data) ? book.data[0]
      : book?.data && typeof book.data === 'object' ? book.data
        : book
  const rows = Array.isArray(nested?.[side]) ? nested[side] : []
  return rows.map((row) => Array.isArray(row)
    ? { price: number(row[0]), size: number(row[1]) }
    : { price: number(row?.price), size: number(row?.size) })
    .filter((row) => Number.isFinite(row.price) && Number.isFinite(row.size) && row.size >= 0)
}

function standardDeviation(values) {
  if (values.length < 2) return null
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function linearSlope(values) {
  if (values.length < 2) return null
  const xMean = (values.length - 1) / 2
  const yMean = values.reduce((sum, value) => sum + value, 0) / values.length
  let numerator = 0
  let denominator = 0
  for (let index = 0; index < values.length; index += 1) {
    numerator += (index - xMean) * (values[index] - yMean)
    denominator += (index - xMean) ** 2
  }
  return denominator && yMean ? numerator / denominator / yMean * 10_000 : null
}

function trueRange(rows, index) {
  const row = rows[index]
  if (index === 0) return row.high - row.low
  const previous = rows[index - 1].close
  return Math.max(row.high - row.low, Math.abs(row.high - previous), Math.abs(row.low - previous))
}

export function compileMarketPacket({ exchange, instId, marketType, bar, ticker, klines, book, receivedAt = Date.now(), errors = [] }) {
  const rows = candleRows(klines)
  const closes = rows.map((row) => row.close)
  const recent = rows.slice(-20)
  const price = number(ticker?.price ?? ticker?.last ?? closes.at(-1))
  const returns = closes.slice(1).map((value, index) => closes[index] > 0 && value > 0 ? Math.log(value / closes[index]) : null).filter(Number.isFinite)
  const ranges = rows.map((_row, index) => trueRange(rows, index)).slice(-14)
  const atr = ranges.length ? ranges.reduce((sum, value) => sum + value, 0) / ranges.length : null
  const volumes = rows.map((row) => row.volume).filter(Number.isFinite)
  const volumeWindow = volumes.slice(-20)
  const volumeMean = volumeWindow.length ? volumeWindow.reduce((sum, value) => sum + value, 0) / volumeWindow.length : null
  const volumeStd = standardDeviation(volumeWindow)
  const latestVolume = volumes.at(-1)
  const bids = levelRows(book, 'bids')
  const asks = levelRows(book, 'asks')
  const bestBid = number(ticker?.bid ?? bids[0]?.price)
  const bestAsk = number(ticker?.ask ?? asks[0]?.price)
  const midpoint = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : price
  const bidDepth = bids.reduce((sum, row) => sum + row.size * row.price, 0)
  const askDepth = asks.reduce((sum, row) => sum + row.size * row.price, 0)
  const totalDepth = bidDepth + askDepth
  const sourceTimestamp = number(ticker?.timestamp)
  const dataAgeMs = sourceTimestamp == null ? null : Math.max(0, receivedAt - sourceTimestamp)
  const warnings = [...errors.map((value) => String(value).slice(0, 160))]
  if (!Number.isFinite(price)) warnings.push('当前价格不可用')
  if (rows.length < 20) warnings.push('K 线覆盖不足 20 根')
  if (!bids.length || !asks.length) warnings.push('订单簿深度不可用')
  if (dataAgeMs != null && dataAgeMs > 30_000) warnings.push('行情数据已经过期')
  const state = Number.isFinite(price) && rows.length >= 20 ? warnings.length ? 'degraded' : 'ready' : 'unavailable'
  const snapshotId = createHash('sha256').update(JSON.stringify({ exchange, instId, bar, price, sourceTimestamp, lastCandle: rows.at(-1)?.timestamp })).digest('hex').slice(0, 20)
  return {
    snapshotId, state, exchange: String(exchange ?? '').toLowerCase(), symbol: String(instId ?? '').toUpperCase(), marketType: marketType ?? null, interval: bar ?? null,
    receivedAt, sourceTimestamp, dataAgeMs, price, candleCount: rows.length,
    window: rows.length ? { from: rows[0].timestamp, to: rows.at(-1).timestamp } : null,
    features: {
      changePercent: closes.length > 1 && closes[0] ? round((closes.at(-1) / closes[0] - 1) * 100, 4) : null,
      atr: round(atr), atrPercent: atr != null && price ? round(atr / price * 100, 4) : null,
      realizedVolatilityPercent: round((standardDeviation(returns) ?? 0) * 100, 4),
      trendSlopeBpsPerBar: round(linearSlope(closes.slice(-25)), 3),
      support: recent.length ? Math.min(...recent.map((row) => row.low)) : null,
      resistance: recent.length ? Math.max(...recent.map((row) => row.high)) : null,
      volumeAnomalyZ: volumeStd && latestVolume != null && volumeMean != null ? round((latestVolume - volumeMean) / volumeStd, 3) : null,
    },
    liquidity: {
      bestBid, bestAsk,
      spreadBps: bestBid != null && bestAsk != null && midpoint ? round((bestAsk - bestBid) / midpoint * 10_000, 3) : null,
      bidDepthQuote: round(bidDepth, 2), askDepthQuote: round(askDepth, 2),
      imbalance: totalDepth ? round((bidDepth - askDepth) / totalDepth, 4) : null,
      levels: { bids: bids.length, asks: asks.length },
    },
    warnings: [...new Set(warnings)],
  }
}
