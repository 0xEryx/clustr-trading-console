const ENGINE_VERSION = 'clustr-analysis-2.0.0'

const REFERENCES = Object.freeze({
  talib: { title: 'TA-Lib', url: 'https://ta-lib.org/', license: 'BSD' },
  ta4j: { title: 'ta4j', url: 'https://github.com/ta4j/ta4j', license: 'MIT' },
  pandasTa: { title: 'Pandas TA Classic', url: 'https://github.com/xgboosted/pandas-ta-classic', license: 'MIT' },
  marketProfile: { title: 'py-market-profile', url: 'https://github.com/bfolkens/py-market-profile', license: 'BSD' },
  smc: { title: 'SM Radar Pine', url: 'https://github.com/CedInvest/sm-radar-pine', license: 'MPL-2.0' },
  harmonic: { title: 'HarmonicPatterns', url: 'https://github.com/djoffrey/HarmonicPatterns', license: 'reference-only' },
  gann: { title: 'B. Gann Indicators', url: 'https://github.com/rajatjpatel/B-Gann-and-Financial-Astrology-Indicators', license: 'reference-only' },
})

export const ANALYSIS_METHODS = Object.freeze([
  { id: 'wyckoff', label: '威科夫市场结构', category: '市场结构', minCandles: 40, summary: '识别交易区间、Spring、UT、SOS 与 SOW 候选事件。', inputs: ['OHLCV'], references: [REFERENCES.ta4j] },
  { id: 'elliott-wave', label: '艾略特波浪候选', category: '波浪与周期', minCandles: 80, summary: '以确认摆动点检查五浪推进与三浪修正的几何约束。', inputs: ['OHLCV'], references: [REFERENCES.ta4j, REFERENCES.harmonic] },
  { id: 'gann-angle', label: '江恩角度（ATR 标准化）', category: '波浪与周期', minCandles: 60, summary: '用 ATR 标准化价格/时间尺度，观察主要摆动与 1×1、1×2、2×1 角度关系。', inputs: ['OHLCV'], references: [REFERENCES.gann] },
  { id: 'dow-theory', label: '道氏趋势结构', category: '市场结构', minCandles: 50, summary: '比较已确认摆动高低点，并用成交量方向验证趋势。', inputs: ['OHLCV'], references: [REFERENCES.ta4j] },
  { id: 'ichimoku', label: '一目均衡表', category: '趋势系统', minCandles: 60, summary: '联合云层、转换线、基准线判断趋势方向与均衡区域。', inputs: ['OHLCV'], references: [REFERENCES.ta4j, REFERENCES.pandasTa] },
  { id: 'fibonacci', label: '斐波那契回撤共振', category: '价格与成交量', minCandles: 50, summary: '在主导摆动上计算回撤区，并识别当前价格最接近的结构位。', inputs: ['OHLCV'], references: [REFERENCES.harmonic] },
  { id: 'volume-profile', label: '成交量分布 / Market Profile', category: '价格与成交量', minCandles: 60, summary: '估算 POC、VAH、VAL 与高成交量接受区。', inputs: ['OHLCV'], references: [REFERENCES.marketProfile, REFERENCES.pandasTa] },
  { id: 'smart-money', label: 'SMC 市场结构', category: '市场结构', minCandles: 60, summary: '识别 BOS、CHoCH、流动性扫单与公平价值缺口候选。', inputs: ['OHLCV'], references: [REFERENCES.smc] },
  { id: 'turtle-breakout', label: '海龟 / Donchian 突破', category: '趋势系统', minCandles: 60, summary: '联合 20/55 周期通道与 ATR 判断趋势突破和退出边界。', inputs: ['OHLCV'], references: [REFERENCES.ta4j, REFERENCES.pandasTa] },
  { id: 'bollinger-rsi-macd', label: '布林带 + RSI + MACD', category: '指标组合', minCandles: 60, summary: '区分趋势延续、超买超卖回归与波动收缩。', inputs: ['OHLCV'], references: [REFERENCES.talib, REFERENCES.pandasTa] },
  { id: 'supertrend-adx', label: 'SuperTrend + ADX/ATR', category: '指标组合', minCandles: 70, summary: '用 ATR 跟踪带确认方向，再用 ADX 过滤弱趋势。', inputs: ['OHLCV'], references: [REFERENCES.ta4j, REFERENCES.pandasTa] },
  { id: 'vwap-volume-flow', label: 'VWAP + OBV + MFI', category: '价格与成交量', minCandles: 40, summary: '联合样本锚定 VWAP、量价累积与资金流强度。', inputs: ['OHLCV'], references: [REFERENCES.talib, REFERENCES.pandasTa] },
])

const METHODS = new Map(ANALYSIS_METHODS.map((method) => [method.id, method]))

function finite(value) { if (value == null || value === '') return null; const number = Number(value); return Number.isFinite(number) ? number : null }
function clamp(value, min = 0, max = 1) { return Math.min(max, Math.max(min, Number(value) || 0)) }
function average(values) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0 }
function sum(values) { return values.reduce((total, value) => total + value, 0) }
function round(value, digits = 4) { return Number.isFinite(value) ? Number(value.toFixed(digits)) : null }

export function normalizeCandleRows(raw) {
  const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.candles) ? raw.candles : Array.isArray(raw) ? raw : []
  const byTimestamp = new Map()
  for (const item of rows) {
    const candle = Array.isArray(item)
      ? { ts: finite(item[0]), o: finite(item[1]), h: finite(item[2]), l: finite(item[3]), c: finite(item[4]), vol: finite(item[5]), confirmed: item[8] == null ? true : String(item[8]) === '1' }
      : item && typeof item === 'object'
        ? { ts: finite(item.ts ?? item.timestamp), o: finite(item.o ?? item.open), h: finite(item.h ?? item.high), l: finite(item.l ?? item.low), c: finite(item.c ?? item.close), vol: finite(item.vol ?? item.volume), confirmed: item.confirmed ?? (item.confirm == null ? true : String(item.confirm) === '1') }
        : null
    if (candle?.ts != null && [candle.o, candle.h, candle.l, candle.c].every((value) => value != null) && candle.h >= candle.l) byTimestamp.set(candle.ts, candle)
  }
  return [...byTimestamp.values()].sort((a, b) => a.ts - b.ts)
}

export function analysisCatalog() {
  return { engineVersion: ENGINE_VERSION, methods: ANALYSIS_METHODS.map((method) => structuredClone(method)), policy: 'user-activated', scoreMeaning: '结构匹配度是确定性规则分数，不是概率、收益预测或交易许可。' }
}

function regressionChange(candles) {
  const meanX = (candles.length - 1) / 2
  const meanY = average(candles.map((candle) => candle.c))
  let numerator = 0
  let denominator = 0
  for (let index = 0; index < candles.length; index += 1) {
    numerator += (index - meanX) * (candles[index].c - meanY)
    denominator += (index - meanX) ** 2
  }
  return meanY > 0 && denominator > 0 ? ((numerator / denominator) * candles.length / meanY) * 100 : 0
}

function trueRanges(candles) {
  return candles.map((candle, index) => index === 0 ? candle.h - candle.l : Math.max(candle.h - candle.l, Math.abs(candle.h - candles[index - 1].c), Math.abs(candle.l - candles[index - 1].c)))
}

function atr(candles, period = 14) {
  const values = trueRanges(candles)
  if (values.length < period) return null
  let value = average(values.slice(0, period))
  for (let index = period; index < values.length; index += 1) value = ((value * (period - 1)) + values[index]) / period
  return value
}

function emaSeries(values, period) {
  const output = Array(values.length).fill(null)
  if (values.length < period) return output
  let value = average(values.slice(0, period))
  output[period - 1] = value
  const alpha = 2 / (period + 1)
  for (let index = period; index < values.length; index += 1) {
    value = values[index] * alpha + value * (1 - alpha)
    output[index] = value
  }
  return output
}

function emaLast(values, period) { return emaSeries(values, period).filter((value) => value != null).at(-1) ?? null }

function rsiValue(values, period = 14) {
  if (values.length <= period) return null
  let gains = 0
  let losses = 0
  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1]
    gains += Math.max(change, 0)
    losses += Math.max(-change, 0)
  }
  let gain = gains / period
  let loss = losses / period
  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1]
    gain = ((gain * (period - 1)) + Math.max(change, 0)) / period
    loss = ((loss * (period - 1)) + Math.max(-change, 0)) / period
  }
  return loss === 0 ? 100 : 100 - (100 / (1 + gain / loss))
}

function macdValue(values) {
  const fast = emaSeries(values, 12)
  const slow = emaSeries(values, 26)
  const line = values.map((_, index) => fast[index] != null && slow[index] != null ? fast[index] - slow[index] : null).filter((value) => value != null)
  if (line.length < 9) return null
  const signal = emaLast(line, 9)
  const current = line.at(-1)
  return { line: current, signal, histogram: current - signal }
}

function adxValue(candles, period = 14) {
  if (candles.length < period * 2 + 1) return null
  const tr = trueRanges(candles)
  const plus = [0]
  const minus = [0]
  for (let index = 1; index < candles.length; index += 1) {
    const up = candles[index].h - candles[index - 1].h
    const down = candles[index - 1].l - candles[index].l
    plus.push(up > down && up > 0 ? up : 0)
    minus.push(down > up && down > 0 ? down : 0)
  }
  const dx = []
  let smoothTr = sum(tr.slice(1, period + 1))
  let smoothPlus = sum(plus.slice(1, period + 1))
  let smoothMinus = sum(minus.slice(1, period + 1))
  for (let index = period + 1; index < candles.length; index += 1) {
    smoothTr = smoothTr - smoothTr / period + tr[index]
    smoothPlus = smoothPlus - smoothPlus / period + plus[index]
    smoothMinus = smoothMinus - smoothMinus / period + minus[index]
    const plusDi = smoothTr ? 100 * smoothPlus / smoothTr : 0
    const minusDi = smoothTr ? 100 * smoothMinus / smoothTr : 0
    dx.push(plusDi + minusDi ? 100 * Math.abs(plusDi - minusDi) / (plusDi + minusDi) : 0)
  }
  return { adx: average(dx.slice(-period)), plusDi: smoothTr ? 100 * smoothPlus / smoothTr : 0, minusDi: smoothTr ? 100 * smoothMinus / smoothTr : 0 }
}

function midpoint(candles, period) {
  const rows = candles.slice(-period)
  if (rows.length < period) return null
  return (Math.max(...rows.map((item) => item.h)) + Math.min(...rows.map((item) => item.l))) / 2
}

function swingPivots(candles, radius = 2) {
  const candidates = []
  for (let index = radius; index < candles.length - radius; index += 1) {
    const window = candles.slice(index - radius, index + radius + 1)
    const candle = candles[index]
    if (candle.h === Math.max(...window.map((item) => item.h))) candidates.push({ type: 'high', price: candle.h, ts: candle.ts, index })
    if (candle.l === Math.min(...window.map((item) => item.l))) candidates.push({ type: 'low', price: candle.l, ts: candle.ts, index })
  }
  const reduced = []
  for (const pivot of candidates.sort((a, b) => a.index - b.index || (a.type === 'low' ? -1 : 1))) {
    const last = reduced.at(-1)
    if (!last || last.type !== pivot.type) reduced.push(pivot)
    else if ((pivot.type === 'high' && pivot.price >= last.price) || (pivot.type === 'low' && pivot.price <= last.price)) reduced[reduced.length - 1] = pivot
  }
  return reduced
}

function event(type, label, candleOrPivot, reason) { return { type, label, ts: candleOrPivot.ts, price: candleOrPivot.price ?? candleOrPivot.c, reason } }
function level(label, price, type = 'reference') { return { label, price: round(price, 8), type } }

function baseResult(methodId, candles, input, result = {}) {
  const method = METHODS.get(methodId)
  const score = clamp(result.structureMatchScore ?? 0, 0, 0.92)
  return {
    ok: true,
    method: method.id,
    methodLabel: method.label,
    category: method.category,
    summary: method.summary,
    methodology: `${ENGINE_VERSION}:${method.id}`,
    instId: input.instId ?? '',
    bar: input.bar ?? '15m',
    candleCount: candles.length,
    dataWindow: { from: candles[0]?.ts ?? null, to: candles.at(-1)?.ts ?? null },
    signal: result.signal ?? 'neutral',
    signalLabel: result.signalLabel ?? '证据不足 / 等待确认',
    structureMatchScore: score,
    scoreLabel: '结构匹配度',
    evidence: result.evidence ?? [],
    counterEvidence: result.counterEvidence ?? [],
    invalidation: result.invalidation ?? '新价格破坏当前结构后重新计算',
    levels: result.levels ?? [],
    events: result.events ?? [],
    metrics: result.metrics ?? {},
    references: method.references,
    disclaimer: result.disclaimer ?? '结构匹配度是确定性启发式规则分数，不是经过校准的概率、收益保证、投资建议或交易许可。',
  }
}

function insufficient(methodId, candles, input, reason) {
  const method = METHODS.get(methodId)
  return { ok: false, method: method.id, methodLabel: method.label, category: method.category, instId: input.instId ?? '', bar: input.bar ?? '15m', reason: reason ?? `至少需要 ${method.minCandles} 根有效 K 线。`, candleCount: candles.length, evidence: [], counterEvidence: [], events: [], levels: [], references: method.references }
}

function prepared(raw, methodId, input) {
  const all = normalizeCandleRows(raw)
  const sample = all.slice(-Math.min(300, all.length))
  const completed = sample.filter((candle) => candle.confirmed)
  const candles = completed.length >= METHODS.get(methodId).minCandles ? completed : sample
  return candles.length < METHODS.get(methodId).minCandles ? { error: insufficient(methodId, candles, input), candles } : { candles }
}

function analyzeWyckoffInternal(candles, input) {
  const work = candles.slice(-200)
  const rangeHigh = Math.max(...work.map((candle) => candle.h))
  const rangeLow = Math.min(...work.map((candle) => candle.l))
  const last = work.at(-1)
  const pricePosition = rangeHigh > rangeLow ? (last.c - rangeLow) / (rangeHigh - rangeLow) : 0.5
  const trendPct = regressionChange(work)
  const recent = work.slice(-20)
  const compression = rangeHigh > rangeLow ? (Math.max(...recent.map((candle) => candle.h)) - Math.min(...recent.map((candle) => candle.l))) / (rangeHigh - rangeLow) : 1
  const positiveVolumes = work.map((candle) => candle.vol ?? 0).filter((value) => value > 0)
  const averageVolume = average(positiveVolumes)
  const recentVolumeRatio = average(recent.map((candle) => candle.vol ?? 0)) / (averageVolume || 1)
  const events = []
  for (let index = Math.max(20, work.length - 80); index < work.length; index += 1) {
    const candle = work[index]
    const prior = work.slice(index - 20, index)
    const priorLow = Math.min(...prior.map((item) => item.l))
    const priorHigh = Math.max(...prior.map((item) => item.h))
    const volumeRatio = (candle.vol ?? 0) / (average(prior.map((item) => item.vol ?? 0)) || 1)
    if (candle.l < priorLow * 0.998 && candle.c > priorLow && candle.c > candle.o) events.push(event('spring', 'Spring 候选', candle, '刺破区间下沿后收回'))
    else if (candle.h > priorHigh * 1.002 && candle.c < priorHigh && candle.c < candle.o) events.push(event('upthrust', 'UT/UTAD 候选', candle, '刺破区间上沿后跌回'))
    else if (candle.c > priorHigh && volumeRatio >= 1.25) events.push(event('sos', 'SOS 候选', candle, `放量突破，量比 ${volumeRatio.toFixed(2)}`))
    else if (candle.c < priorLow && volumeRatio >= 1.25) events.push(event('sow', 'SOW 候选', candle, `放量跌破，量比 ${volumeRatio.toFixed(2)}`))
  }
  const recentEvents = events.slice(-8)
  const bullishEvent = recentEvents.some((item) => item.type === 'spring' || item.type === 'sos')
  const bearishEvent = recentEvents.some((item) => item.type === 'upthrust' || item.type === 'sow')
  let signal = 'neutral'
  let signalLabel = '交易区间 / 等待确认'
  const evidence = []
  const counterEvidence = []
  if (trendPct >= 4 && pricePosition >= 0.62) { signal = 'bullish'; signalLabel = 'Markup 上涨阶段候选'; evidence.push(`回归趋势约 +${trendPct.toFixed(1)}%，价格位于区间上部`) }
  else if (trendPct <= -4 && pricePosition <= 0.38) { signal = 'bearish'; signalLabel = 'Markdown 下跌阶段候选'; evidence.push(`回归趋势约 ${trendPct.toFixed(1)}%，价格位于区间下部`) }
  else if (pricePosition <= 0.48 && compression <= 0.65 && bullishEvent) { signal = 'bullish'; signalLabel = 'Accumulation 吸筹区候选'; evidence.push('区间下部出现向上确认事件') }
  else if (pricePosition >= 0.52 && compression <= 0.65 && bearishEvent) { signal = 'bearish'; signalLabel = 'Distribution 派发区候选'; evidence.push('区间上部出现向下确认事件') }
  if (compression <= 0.55) evidence.push(`近 20 根波动压缩至样本区间的 ${(compression * 100).toFixed(0)}%`)
  else counterEvidence.push('近期方向波动较大，交易区间边界不稳定')
  if (recentVolumeRatio >= 1.15) evidence.push(`近期量能为样本均量的 ${recentVolumeRatio.toFixed(2)} 倍`)
  else counterEvidence.push('近期量能没有明显扩张')
  if (recentEvents.length) evidence.push(`识别到 ${recentEvents.length} 个候选事件，仍需后续确认`)
  else counterEvidence.push('没有清晰的 Spring、UT、SOS 或 SOW 候选')
  return baseResult('wyckoff', work, input, {
    signal, signalLabel, structureMatchScore: signal === 'neutral' ? 0.28 + evidence.length * 0.06 : 0.48 + evidence.length * 0.08,
    evidence, counterEvidence, events: recentEvents, levels: [level('区间下沿', rangeLow, 'support'), level('区间上沿', rangeHigh, 'resistance')],
    invalidation: signal === 'bullish' ? `有效跌破 ${round(rangeLow, 8)}` : signal === 'bearish' ? `有效突破 ${round(rangeHigh, 8)}` : '出现新的放量突破、跌破或假突破事件时重新评估',
    metrics: { pricePosition: round(pricePosition), trendPercent: round(trendPct), compression: round(compression), recentVolumeRatio: round(recentVolumeRatio) },
  })
}

function analyzeElliott(candles, input) {
  const pivots = swingPivots(candles.slice(-180), 3).slice(-8)
  const sequence = pivots.slice(-6)
  if (sequence.length < 6) return baseResult('elliott-wave', candles, input, { signalLabel: '摆动点不足，无法形成波浪候选', counterEvidence: ['最近样本没有六个交替确认摆动点'], invalidation: '等待新的确认摆动点', structureMatchScore: 0.12 })
  const prices = sequence.map((item) => item.price)
  const bullishTypes = sequence.map((item) => item.type).join(',') === 'low,high,low,high,low,high'
  const bearishTypes = sequence.map((item) => item.type).join(',') === 'high,low,high,low,high,low'
  const bullishChecks = bullishTypes ? [prices[2] > prices[0], prices[3] > prices[1], prices[4] > prices[2], prices[5] > prices[3]] : []
  const bearishChecks = bearishTypes ? [prices[2] < prices[0], prices[3] < prices[1], prices[4] < prices[2], prices[5] < prices[3]] : []
  const direction = bullishChecks.filter(Boolean).length >= 3 ? 'bullish' : bearishChecks.filter(Boolean).length >= 3 ? 'bearish' : 'neutral'
  const checks = direction === 'bullish' ? bullishChecks : direction === 'bearish' ? bearishChecks : [...bullishChecks, ...bearishChecks]
  const passed = checks.filter(Boolean).length
  const wave1 = Math.abs(prices[1] - prices[0])
  const wave3 = Math.abs(prices[3] - prices[2])
  const evidence = direction === 'neutral' ? [] : [`六个摆动点满足 ${passed}/4 项推进浪几何约束`, `第三段/第一段幅度比 ${wave1 ? (wave3 / wave1).toFixed(2) : '—'}`]
  const counterEvidence = direction === 'neutral' ? ['摆动高低点没有形成稳定的推进浪序列'] : checks.map((ok, index) => ok ? null : `第 ${index + 1} 项波浪约束不成立`).filter(Boolean)
  return baseResult('elliott-wave', candles, input, {
    signal: direction,
    signalLabel: direction === 'bullish' ? '上行五浪推进候选' : direction === 'bearish' ? '下行五浪推进候选' : '波浪计数不确定',
    structureMatchScore: direction === 'neutral' ? 0.2 : 0.42 + passed * 0.1,
    evidence, counterEvidence,
    events: sequence.map((pivot, index) => event(`wave-${index}`, `W${index}`, pivot, '确认摆动点')),
    levels: [level('波浪起点', prices[0], direction === 'bullish' ? 'support' : 'resistance'), level('最近摆动', prices.at(-1))],
    invalidation: direction === 'bullish' ? `跌破波浪起点 ${round(prices[0], 8)}` : direction === 'bearish' ? `突破波浪起点 ${round(prices[0], 8)}` : '新的摆动点会改变现有计数',
    metrics: { confirmedPivots: sequence.length, constraintPasses: passed, wave3ToWave1: round(wave1 ? wave3 / wave1 : null) },
  })
}

function analyzeGann(candles, input) {
  const work = candles.slice(-120)
  const volatility = atr(work, 14)
  if (!volatility || volatility <= 0) return insufficient('gann-angle', work, input, 'ATR 无法计算，江恩角度的价格尺度不能标准化。')
  const trend = regressionChange(work)
  const upward = trend >= 0
  const extreme = upward ? Math.min(...work.map((item) => item.l)) : Math.max(...work.map((item) => item.h))
  const anchorIndex = work.findIndex((item) => upward ? item.l === extreme : item.h === extreme)
  const bars = Math.max(1, work.length - 1 - anchorIndex)
  const signedSlope = (work.at(-1).c - extreme) / volatility / bars
  const magnitude = Math.abs(signedSlope)
  const ratios = [0.25, 0.5, 1, 2, 4]
  const nearest = ratios.reduce((best, ratio) => Math.abs(ratio - magnitude) < Math.abs(best - magnitude) ? ratio : best, 1)
  const closeness = clamp(1 - Math.abs(magnitude - nearest) / nearest)
  const levels = [0.5, 1, 2].map((ratio) => level(`${upward ? '上行' : '下行'} ${ratio === 1 ? '1×1' : ratio < 1 ? '1×2' : '2×1'}`, extreme + (upward ? 1 : -1) * volatility * bars * ratio))
  return baseResult('gann-angle', work, input, {
    signal: upward ? 'bullish' : 'bearish',
    signalLabel: `${upward ? '上行' : '下行'}角度接近 ${nearest === 1 ? '1×1' : nearest < 1 ? '1×2' : nearest === 2 ? '2×1' : `${nearest}×1`}`,
    structureMatchScore: 0.3 + closeness * 0.45,
    evidence: [`价格/时间斜率为每根 ${magnitude.toFixed(2)} ATR`, `与标准化角度 ${nearest} 最接近`],
    counterEvidence: ['江恩角度依赖价格尺度；Clustr 使用 ATR 标准化，不能等同手工图表的固定几何角度'],
    levels,
    events: [event('anchor', '角度锚点', { ts: work[anchorIndex].ts, price: extreme }, '最近样本主导极值')],
    invalidation: `${upward ? '跌破' : '突破'}锚点 ${round(extreme, 8)}，或 ATR regime 显著改变`,
    metrics: { atr: round(volatility, 8), normalizedSlope: round(signedSlope), nearestAngle: nearest, barsFromAnchor: bars },
  })
}

function analyzeDow(candles, input) {
  const work = candles.slice(-160)
  const pivots = swingPivots(work, 3)
  const highs = pivots.filter((item) => item.type === 'high').slice(-2)
  const lows = pivots.filter((item) => item.type === 'low').slice(-2)
  if (highs.length < 2 || lows.length < 2) return baseResult('dow-theory', work, input, { signalLabel: '确认摆动点不足', counterEvidence: ['至少需要两个摆动高点和两个摆动低点'], structureMatchScore: 0.15 })
  const higherHigh = highs[1].price > highs[0].price
  const higherLow = lows[1].price > lows[0].price
  const lowerHigh = highs[1].price < highs[0].price
  const lowerLow = lows[1].price < lows[0].price
  const signal = higherHigh && higherLow ? 'bullish' : lowerHigh && lowerLow ? 'bearish' : 'neutral'
  const upVolume = sum(work.filter((item) => item.c >= item.o).map((item) => item.vol ?? 0))
  const downVolume = sum(work.filter((item) => item.c < item.o).map((item) => item.vol ?? 0))
  const volumeConfirms = signal === 'bullish' ? upVolume > downVolume : signal === 'bearish' ? downVolume > upVolume : false
  return baseResult('dow-theory', work, input, {
    signal,
    signalLabel: signal === 'bullish' ? '更高高点 + 更高低点' : signal === 'bearish' ? '更低高点 + 更低低点' : '摆动结构分歧',
    structureMatchScore: signal === 'neutral' ? 0.28 : volumeConfirms ? 0.78 : 0.58,
    evidence: [signal === 'bullish' ? '最近两个高点与低点同步抬高' : signal === 'bearish' ? '最近两个高点与低点同步降低' : '趋势结构尚未同步', ...(volumeConfirms ? ['成交量方向与趋势一致'] : [])],
    counterEvidence: volumeConfirms ? [] : ['成交量方向没有确认当前价格结构'],
    levels: [level('最近摆动低点', lows[1].price, 'support'), level('最近摆动高点', highs[1].price, 'resistance')],
    events: [event('swing-low', '摆动低点', lows[1], '道氏结构'), event('swing-high', '摆动高点', highs[1], '道氏结构')],
    invalidation: signal === 'bullish' ? `跌破最近摆动低点 ${round(lows[1].price, 8)}` : signal === 'bearish' ? `突破最近摆动高点 ${round(highs[1].price, 8)}` : '高低点同步形成同向序列后重新判断',
    metrics: { higherHigh, higherLow, lowerHigh, lowerLow, upDownVolumeRatio: round(downVolume ? upVolume / downVolume : null) },
  })
}

function analyzeIchimoku(candles, input) {
  const work = candles.slice(-160)
  const close = work.at(-1).c
  const tenkan = midpoint(work, 9)
  const kijun = midpoint(work, 26)
  const spanA = (tenkan + kijun) / 2
  const spanB = midpoint(work, 52)
  const cloudLow = Math.min(spanA, spanB)
  const cloudHigh = Math.max(spanA, spanB)
  const bullish = close > cloudHigh && tenkan > kijun
  const bearish = close < cloudLow && tenkan < kijun
  const signal = bullish ? 'bullish' : bearish ? 'bearish' : 'neutral'
  const checks = signal === 'bullish' ? [close > cloudHigh, tenkan > kijun, spanA > spanB] : signal === 'bearish' ? [close < cloudLow, tenkan < kijun, spanA < spanB] : []
  const cloudConfirms = bullish ? spanA > spanB : bearish ? spanA < spanB : false
  return baseResult('ichimoku', work, input, {
    signal, signalLabel: bullish ? '价格位于云层上方，转换线领先' : bearish ? '价格位于云层下方，转换线落后' : '价格处于云层/均衡区',
    structureMatchScore: signal === 'neutral' ? 0.35 : 0.44 + checks.filter(Boolean).length * 0.12,
    evidence: [close > cloudHigh ? '价格在云层上方' : close < cloudLow ? '价格在云层下方' : '价格位于云层内部', tenkan > kijun ? '转换线高于基准线' : tenkan < kijun ? '转换线低于基准线' : '转换线与基准线重合'],
    counterEvidence: signal !== 'neutral' && !cloudConfirms ? ['云层方向与短期方向不一致'] : signal === 'neutral' ? ['方向条件没有同时成立'] : [],
    levels: [level('转换线', tenkan), level('基准线', kijun), level('云层下沿', cloudLow, 'support'), level('云层上沿', cloudHigh, 'resistance')],
    invalidation: bullish ? `收盘重新进入云层下方 ${round(cloudHigh, 8)}` : bearish ? `收盘重新进入云层上方 ${round(cloudLow, 8)}` : '有效离开云层并由转换线/基准线确认',
    metrics: { tenkan: round(tenkan, 8), kijun: round(kijun, 8), spanA: round(spanA, 8), spanB: round(spanB, 8) },
  })
}

function dominantSwing(candles) {
  const work = candles.slice(-140)
  let low = { index: 0, price: work[0].l, ts: work[0].ts }
  let high = { index: 0, price: work[0].h, ts: work[0].ts }
  work.forEach((item, index) => {
    if (item.l < low.price) low = { index, price: item.l, ts: item.ts }
    if (item.h > high.price) high = { index, price: item.h, ts: item.ts }
  })
  return { work, low, high, direction: low.index < high.index ? 'up' : 'down' }
}

function analyzeFibonacci(candles, input) {
  const { work, low, high, direction } = dominantSwing(candles)
  const range = high.price - low.price
  if (!(range > 0)) return insufficient('fibonacci', work, input, '样本区间没有有效价格摆动。')
  const ratios = [0.236, 0.382, 0.5, 0.618, 0.786]
  const values = ratios.map((ratio) => ({ ratio, price: direction === 'up' ? high.price - range * ratio : low.price + range * ratio }))
  const close = work.at(-1).c
  const nearest = values.reduce((best, item) => Math.abs(item.price - close) < Math.abs(best.price - close) ? item : best)
  const volatility = atr(work, 14) || range
  const proximity = clamp(1 - Math.abs(close - nearest.price) / volatility)
  const inGoldenZone = nearest.ratio >= 0.5 && nearest.ratio <= 0.618 && proximity > 0.35
  const signal = inGoldenZone ? (direction === 'up' ? 'bullish' : 'bearish') : 'neutral'
  return baseResult('fibonacci', work, input, {
    signal,
    signalLabel: inGoldenZone ? `${direction === 'up' ? '上行' : '下行'}摆动的黄金回撤区候选` : `最接近 ${(nearest.ratio * 100).toFixed(1)}% 回撤位`,
    structureMatchScore: 0.28 + proximity * 0.48 + (inGoldenZone ? 0.1 : 0),
    evidence: [`主导摆动方向：${direction === 'up' ? '由低到高' : '由高到低'}`, `现价距离 ${(nearest.ratio * 100).toFixed(1)}% 回撤位 ${(Math.abs(close - nearest.price) / close * 100).toFixed(2)}%`],
    counterEvidence: inGoldenZone ? [] : ['当前价格未形成 50%–61.8% 黄金回撤区共振'],
    levels: values.map((item) => level(`${(item.ratio * 100).toFixed(1)}%`, item.price)),
    events: [event('swing-start', '主摆动起点', direction === 'up' ? low : high, '样本极值'), event('swing-end', '主摆动终点', direction === 'up' ? high : low, '样本极值')],
    invalidation: direction === 'up' ? `有效跌破摆动低点 ${round(low.price, 8)}` : `有效突破摆动高点 ${round(high.price, 8)}`,
    metrics: { direction, swingLow: round(low.price, 8), swingHigh: round(high.price, 8), nearestRatio: nearest.ratio },
  })
}

function analyzeVolumeProfile(candles, input) {
  const work = candles.slice(-200)
  const low = Math.min(...work.map((item) => item.l))
  const high = Math.max(...work.map((item) => item.h))
  const totalVolume = sum(work.map((item) => Math.max(0, item.vol ?? 0)))
  if (!(high > low) || totalVolume <= 0) return insufficient('volume-profile', work, input, '成交量或价格区间不足，无法构造成交量分布。')
  const bins = Array(24).fill(0)
  const width = (high - low) / bins.length
  for (const candle of work) {
    const typical = (candle.h + candle.l + candle.c) / 3
    const index = Math.min(bins.length - 1, Math.max(0, Math.floor((typical - low) / width)))
    bins[index] += Math.max(0, candle.vol ?? 0)
  }
  const pocIndex = bins.indexOf(Math.max(...bins))
  let left = pocIndex
  let right = pocIndex
  let areaVolume = bins[pocIndex]
  while (areaVolume < totalVolume * 0.7 && (left > 0 || right < bins.length - 1)) {
    const nextLeft = left > 0 ? bins[left - 1] : -1
    const nextRight = right < bins.length - 1 ? bins[right + 1] : -1
    if (nextLeft >= nextRight) { left -= 1; areaVolume += bins[left] } else { right += 1; areaVolume += bins[right] }
  }
  const poc = low + (pocIndex + 0.5) * width
  const val = low + left * width
  const vah = low + (right + 1) * width
  const close = work.at(-1).c
  const signal = close > vah ? 'bullish' : close < val ? 'bearish' : 'neutral'
  return baseResult('volume-profile', work, input, {
    signal,
    signalLabel: close > vah ? '价格高于价值区' : close < val ? '价格低于价值区' : '价格处于价值接受区',
    structureMatchScore: signal === 'neutral' ? 0.58 : 0.62,
    evidence: [`70% 成交量价值区：${round(val, 8)} – ${round(vah, 8)}`, `最大成交量价格 POC：${round(poc, 8)}`],
    counterEvidence: ['OHLCV 只能按每根 K 线典型价近似分配成交量，不等同逐笔成交的精确 Volume Profile'],
    levels: [level('VAL', val, 'support'), level('POC', poc), level('VAH', vah, 'resistance')],
    invalidation: '价格重新穿越 POC 或样本窗口发生显著变化',
    metrics: { poc: round(poc, 8), valueAreaLow: round(val, 8), valueAreaHigh: round(vah, 8), valueAreaVolumePercent: round(areaVolume / totalVolume * 100, 2), bins: bins.length },
  })
}

function analyzeSmartMoney(candles, input) {
  const work = candles.slice(-180)
  const pivots = swingPivots(work, 3)
  const lastHigh = pivots.filter((item) => item.type === 'high').at(-1)
  const lastLow = pivots.filter((item) => item.type === 'low').at(-1)
  const last = work.at(-1)
  const prior = work.slice(-21, -1)
  const priorHigh = Math.max(...prior.map((item) => item.h))
  const priorLow = Math.min(...prior.map((item) => item.l))
  const bullishBreak = last.c > priorHigh
  const bearishBreak = last.c < priorLow
  const bullishSweep = last.l < priorLow && last.c > priorLow
  const bearishSweep = last.h > priorHigh && last.c < priorHigh
  const gaps = []
  for (let index = Math.max(2, work.length - 40); index < work.length; index += 1) {
    if (work[index].l > work[index - 2].h) gaps.push({ type: 'bullish-fvg', low: work[index - 2].h, high: work[index].l, candle: work[index] })
    else if (work[index].h < work[index - 2].l) gaps.push({ type: 'bearish-fvg', low: work[index].h, high: work[index - 2].l, candle: work[index] })
  }
  const latestGap = gaps.at(-1)
  const signal = bullishBreak || bullishSweep ? 'bullish' : bearishBreak || bearishSweep ? 'bearish' : 'neutral'
  const evidence = []
  if (bullishBreak) evidence.push('收盘突破近 20 根高点，形成向上 BOS 候选')
  if (bearishBreak) evidence.push('收盘跌破近 20 根低点，形成向下 BOS 候选')
  if (bullishSweep) evidence.push('扫过下方流动性后收回')
  if (bearishSweep) evidence.push('扫过上方流动性后跌回')
  if (latestGap) evidence.push(`最近存在${latestGap.type === 'bullish-fvg' ? '向上' : '向下'} FVG 候选`)
  return baseResult('smart-money', work, input, {
    signal,
    signalLabel: bullishBreak ? '向上 BOS 候选' : bearishBreak ? '向下 BOS 候选' : bullishSweep ? '下方流动性扫单候选' : bearishSweep ? '上方流动性扫单候选' : '等待 BOS / 扫单确认',
    structureMatchScore: signal === 'neutral' ? 0.3 : 0.55 + (latestGap ? 0.12 : 0),
    evidence,
    counterEvidence: evidence.length ? ['Order Block 与机构意图不能仅由 OHLCV 得到确认'] : ['没有识别到近期结构突破、扫单或 FVG 候选'],
    levels: [lastLow ? level('最近结构低点', lastLow.price, 'support') : null, lastHigh ? level('最近结构高点', lastHigh.price, 'resistance') : null, latestGap ? level('FVG 中位', (latestGap.low + latestGap.high) / 2) : null].filter(Boolean),
    events: [bullishSweep ? event('liquidity-sweep', '下方扫单', last, '跌破后收回') : null, bearishSweep ? event('liquidity-sweep', '上方扫单', last, '突破后跌回') : null, latestGap ? event(latestGap.type, 'FVG', latestGap.candle, '三根 K 线价格失衡') : null].filter(Boolean),
    invalidation: signal === 'bullish' && lastLow ? `跌破结构低点 ${round(lastLow.price, 8)}` : signal === 'bearish' && lastHigh ? `突破结构高点 ${round(lastHigh.price, 8)}` : '等待新的确认收盘突破',
    metrics: { bullishBreak, bearishBreak, bullishSweep, bearishSweep, fairValueGaps: gaps.length },
  })
}

function analyzeTurtle(candles, input) {
  const work = candles.slice(-120)
  const current = work.at(-1)
  const prior55 = work.slice(-56, -1)
  const prior20 = work.slice(-21, -1)
  const high55 = Math.max(...prior55.map((item) => item.h))
  const low55 = Math.min(...prior55.map((item) => item.l))
  const high20 = Math.max(...prior20.map((item) => item.h))
  const low20 = Math.min(...prior20.map((item) => item.l))
  const volatility = atr(work, 20)
  const signal = current.c > high55 ? 'bullish' : current.c < low55 ? 'bearish' : 'neutral'
  const distance = signal === 'bullish' ? current.c - high55 : signal === 'bearish' ? low55 - current.c : Math.min(Math.abs(current.c - high55), Math.abs(current.c - low55))
  return baseResult('turtle-breakout', work, input, {
    signal,
    signalLabel: signal === 'bullish' ? '55 周期上轨突破' : signal === 'bearish' ? '55 周期下轨突破' : '通道内部 / 等待突破',
    structureMatchScore: signal === 'neutral' ? 0.3 : 0.58 + clamp(distance / (volatility || distance || 1)) * 0.18,
    evidence: [signal === 'neutral' ? '现价仍在 55 周期通道内' : `收盘有效${signal === 'bullish' ? '高于' : '低于'} 55 周期边界`, `ATR(20) ${round(volatility, 8)}`],
    counterEvidence: signal === 'neutral' ? ['没有形成入场突破'] : volatility && distance < volatility * 0.25 ? ['突破幅度小于 0.25 ATR，假突破风险较高'] : [],
    levels: [level('55 上轨', high55, 'resistance'), level('55 下轨', low55, 'support'), level('20 上轨', high20), level('20 下轨', low20)],
    invalidation: signal === 'bullish' ? `跌回 20 周期下轨 ${round(low20, 8)}` : signal === 'bearish' ? `突破 20 周期上轨 ${round(high20, 8)}` : '收盘突破 55 周期边界后重新计算',
    metrics: { atr20: round(volatility, 8), high55: round(high55, 8), low55: round(low55, 8), high20: round(high20, 8), low20: round(low20, 8) },
  })
}

function analyzeBollingerRsiMacd(candles, input) {
  const work = candles.slice(-160)
  const closes = work.map((item) => item.c)
  const recent = closes.slice(-20)
  const mean = average(recent)
  const deviation = Math.sqrt(average(recent.map((value) => (value - mean) ** 2)))
  const upper = mean + deviation * 2
  const lower = mean - deviation * 2
  const rsi = rsiValue(closes, 14)
  const macd = macdValue(closes)
  const close = closes.at(-1)
  const widthPercent = mean ? (upper - lower) / mean * 100 : 0
  const bullishMomentum = close > mean && rsi >= 50 && rsi <= 72 && macd?.histogram > 0
  const bearishMomentum = close < mean && rsi <= 50 && rsi >= 28 && macd?.histogram < 0
  const bullishReversion = close <= lower && rsi < 35
  const bearishReversion = close >= upper && rsi > 65
  const signal = bullishMomentum || bullishReversion ? 'bullish' : bearishMomentum || bearishReversion ? 'bearish' : 'neutral'
  const squeeze = widthPercent < 5
  return baseResult('bollinger-rsi-macd', work, input, {
    signal,
    signalLabel: bullishReversion ? '下轨超卖回归候选' : bearishReversion ? '上轨超买回归候选' : bullishMomentum ? '多头动量共振' : bearishMomentum ? '空头动量共振' : squeeze ? '布林带收缩，等待方向' : '指标组合没有共振',
    structureMatchScore: signal === 'neutral' ? (squeeze ? 0.5 : 0.26) : 0.72,
    evidence: [`RSI(14) ${rsi.toFixed(1)}`, `MACD 柱 ${round(macd?.histogram, 8)}`, `布林带宽度 ${widthPercent.toFixed(2)}%`, ...(squeeze ? ['波动带处于收缩状态'] : [])],
    counterEvidence: signal === 'neutral' ? ['价格、动量与均值回归条件没有同时成立'] : squeeze ? ['波动收缩可能放大突破方向的不确定性'] : [],
    levels: [level('布林下轨', lower, 'support'), level('中轨', mean), level('布林上轨', upper, 'resistance')],
    invalidation: signal === 'bullish' ? `收盘跌破下轨 ${round(lower, 8)} 且 RSI 继续走弱` : signal === 'bearish' ? `收盘突破上轨 ${round(upper, 8)} 且 RSI 继续走强` : '等待价格、RSI 与 MACD 同向确认',
    metrics: { rsi14: round(rsi, 2), macd: round(macd?.line, 8), macdSignal: round(macd?.signal, 8), macdHistogram: round(macd?.histogram, 8), bandWidthPercent: round(widthPercent, 2) },
  })
}

function supertrendValue(candles, period = 10, multiplier = 3) {
  const trs = trueRanges(candles)
  let atrValue = average(trs.slice(0, period))
  let upper = null
  let lower = null
  let direction = 1
  let trend = null
  for (let index = period - 1; index < candles.length; index += 1) {
    if (index >= period) atrValue = ((atrValue * (period - 1)) + trs[index]) / period
    const middle = (candles[index].h + candles[index].l) / 2
    const basicUpper = middle + multiplier * atrValue
    const basicLower = middle - multiplier * atrValue
    const previousClose = index > 0 ? candles[index - 1].c : candles[index].c
    upper = upper == null || basicUpper < upper || previousClose > upper ? basicUpper : upper
    lower = lower == null || basicLower > lower || previousClose < lower ? basicLower : lower
    if (candles[index].c > upper) direction = 1
    else if (candles[index].c < lower) direction = -1
    trend = direction === 1 ? lower : upper
  }
  return { value: trend, direction: direction === 1 ? 'up' : 'down', atr: atrValue }
}

function analyzeSupertrendAdx(candles, input) {
  const work = candles.slice(-180)
  const supertrend = supertrendValue(work)
  const adx = adxValue(work, 14)
  const strong = adx?.adx >= 20
  const signal = strong ? (supertrend.direction === 'up' ? 'bullish' : 'bearish') : 'neutral'
  const diDisagrees = strong && ((signal === 'bullish' && adx.plusDi < adx.minusDi) || (signal === 'bearish' && adx.minusDi < adx.plusDi))
  return baseResult('supertrend-adx', work, input, {
    signal,
    signalLabel: strong ? `${supertrend.direction === 'up' ? '上行' : '下行'} SuperTrend，ADX 确认` : '趋势强度不足',
    structureMatchScore: strong ? 0.54 + clamp((adx.adx - 20) / 30) * 0.28 : 0.3,
    evidence: [`SuperTrend 方向：${supertrend.direction === 'up' ? '上行' : '下行'}`, `ADX(14) ${adx?.adx.toFixed(1) ?? '—'}`, `+DI / -DI：${adx?.plusDi.toFixed(1) ?? '—'} / ${adx?.minusDi.toFixed(1) ?? '—'}`],
    counterEvidence: diDisagrees ? ['DI 方向与 SuperTrend 不一致'] : strong ? [] : ['ADX 低于 20，趋势跟随信号容易反复'],
    levels: [level('SuperTrend', supertrend.value, supertrend.direction === 'up' ? 'support' : 'resistance')],
    invalidation: `${supertrend.direction === 'up' ? '收盘跌破' : '收盘突破'} SuperTrend ${round(supertrend.value, 8)}`,
    metrics: { supertrend: round(supertrend.value, 8), atr10: round(supertrend.atr, 8), adx14: round(adx?.adx, 2), plusDi: round(adx?.plusDi, 2), minusDi: round(adx?.minusDi, 2) },
  })
}

function analyzeVwapVolumeFlow(candles, input) {
  const work = candles.slice(-160)
  const volume = sum(work.map((item) => Math.max(0, item.vol ?? 0)))
  if (volume <= 0) return insufficient('vwap-volume-flow', work, input, '成交量不足，无法计算 VWAP、OBV 与 MFI。')
  const vwap = sum(work.map((item) => ((item.h + item.l + item.c) / 3) * Math.max(0, item.vol ?? 0))) / volume
  let obv = 0
  const obvSeries = [0]
  for (let index = 1; index < work.length; index += 1) {
    if (work[index].c > work[index - 1].c) obv += work[index].vol ?? 0
    else if (work[index].c < work[index - 1].c) obv -= work[index].vol ?? 0
    obvSeries.push(obv)
  }
  const obvRecent = obvSeries.slice(-20)
  const obvSlope = obvRecent.at(-1) - obvRecent[0]
  const mfiRows = work.slice(-15)
  let positive = 0
  let negative = 0
  for (let index = 1; index < mfiRows.length; index += 1) {
    const typical = (mfiRows[index].h + mfiRows[index].l + mfiRows[index].c) / 3
    const previous = (mfiRows[index - 1].h + mfiRows[index - 1].l + mfiRows[index - 1].c) / 3
    const flow = typical * Math.max(0, mfiRows[index].vol ?? 0)
    if (typical >= previous) positive += flow
    else negative += flow
  }
  const mfi = negative === 0 ? 100 : 100 - 100 / (1 + positive / negative)
  const close = work.at(-1).c
  const bullish = close > vwap && obvSlope > 0 && mfi >= 45 && mfi < 80
  const bearish = close < vwap && obvSlope < 0 && mfi <= 55 && mfi > 20
  const signal = bullish ? 'bullish' : bearish ? 'bearish' : 'neutral'
  return baseResult('vwap-volume-flow', work, input, {
    signal,
    signalLabel: bullish ? '价格与资金流多头共振' : bearish ? '价格与资金流空头共振' : 'VWAP 与量价流向分歧',
    structureMatchScore: signal === 'neutral' ? 0.32 : 0.74,
    evidence: [`现价位于样本 VWAP ${close >= vwap ? '上方' : '下方'}`, `OBV 近 20 根变化 ${round(obvSlope, 2)}`, `MFI(14) ${mfi.toFixed(1)}`],
    counterEvidence: signal === 'neutral' ? ['价格位置、OBV 与 MFI 没有同向确认'] : [],
    levels: [level('样本锚定 VWAP', vwap)],
    invalidation: signal === 'bullish' ? `收盘跌回 VWAP ${round(vwap, 8)} 且 OBV 转弱` : signal === 'bearish' ? `收盘突破 VWAP ${round(vwap, 8)} 且 OBV 转强` : '价格与 OBV、MFI 同向后重新评估',
    metrics: { anchoredVwap: round(vwap, 8), obv: round(obv, 2), obv20Change: round(obvSlope, 2), mfi14: round(mfi, 2) },
  })
}

const ANALYZERS = new Map([
  ['wyckoff', analyzeWyckoffInternal],
  ['elliott-wave', analyzeElliott],
  ['gann-angle', analyzeGann],
  ['dow-theory', analyzeDow],
  ['ichimoku', analyzeIchimoku],
  ['fibonacci', analyzeFibonacci],
  ['volume-profile', analyzeVolumeProfile],
  ['smart-money', analyzeSmartMoney],
  ['turtle-breakout', analyzeTurtle],
  ['bollinger-rsi-macd', analyzeBollingerRsiMacd],
  ['supertrend-adx', analyzeSupertrendAdx],
  ['vwap-volume-flow', analyzeVwapVolumeFlow],
])

export function analyzeMarket(methodId, raw, input = {}) {
  const normalizedMethod = String(methodId ?? '').trim().toLowerCase()
  if (!METHODS.has(normalizedMethod)) throw new Error('不支持的市场分析方法')
  const nextInput = { ...input, method: normalizedMethod }
  const preparation = prepared(raw, normalizedMethod, nextInput)
  if (preparation.error) return preparation.error
  return ANALYZERS.get(normalizedMethod)(preparation.candles, nextInput)
}

export function analyzeWyckoff(raw, input = {}) { return analyzeMarket('wyckoff', raw, input) }
