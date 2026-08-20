export function checkWrite({ toolName, args, config, state, autonomy }) {
  const { readOnly = true, risk = {} } = config
  const a = args ?? {}
  if (readOnly) return { ok: false, reason: '只读模式已开启：写操作被禁止。如需交易请先关闭只读（该变更本身需审批）。' }
  const autonomyLevel = Number(autonomy?.definition?.level ?? 0)
  if (autonomyLevel < 3) return { ok: false, reason: '当前自主权只允许观察、建议或准备订单；真实写操作需要“逐笔审批”或更高等级。' }
  const riskReducing = /(^|_)(cancel|cancel_all|close_position)($|_)/i.test(String(toolName)) || a.reduceOnly === true
  const instrument = String(a.instId ?? '').toUpperCase()
  const metadata = state.instrumentMetadata?.get(instrument)
  if (!riskReducing && !metadata) return { ok: false, reason: '交易标的元数据缺失，风险内核按拒绝处理。' }
  if (!riskReducing) {
    const precision = validatePrecision(a, metadata)
    if (!precision.ok) return precision
  }
  const notional = estimateNotional(a, state)
  if (!riskReducing && notional == null) return { ok: false, reason: '无法可靠估算订单名义价值，风险内核按拒绝处理。' }
  const minNotional = Number(metadata?.minNotional)
  const maxNotional = Number(metadata?.maxNotional)
  if (!riskReducing && Number.isFinite(minNotional) && minNotional > 0 && notional < minNotional) return { ok: false, reason: `订单名义价值低于交易所最小值 ${metadata.minNotional}` }
  if (!riskReducing && Number.isFinite(maxNotional) && maxNotional > 0 && notional > maxNotional) return { ok: false, reason: `订单名义价值超过交易所最大值 ${metadata.maxNotional}` }
  const maxDataAge = risk.maxMarketDataAgeMs ?? 30000
  const priceAt = state.lastPriceAt?.get(instrument)
  if (!riskReducing && (!priceAt || Date.now() - priceAt > maxDataAge)) return { ok: false, reason: '市场数据已经过期，写操作被拒绝。' }
  const maxOrder = risk.maxOrderNotionalUsdt ?? 5000
  const maxDaily = risk.maxDailyNotionalUsdt ?? 50000
  if (notional != null && notional > maxOrder) {
    return { ok: false, reason: `单笔名义价值 ${notional.toFixed(2)} USDT 超过上限 ${maxOrder} USDT` }
  }
  const daily = state.dailyNotional + (notional ?? 0)
  if (daily > maxDaily) {
    return { ok: false, reason: `日累计名义 ${daily.toFixed(0)} USDT 将超过上限 ${maxDaily} USDT` }
  }
  const maxLeverage = risk.maxLeverage ?? 10
  const lever = a.lever ?? a.leverage
  if (lever != null && (!Number.isFinite(Number(lever)) || Number(lever) <= 0)) return { ok: false, reason: '杠杆参数无效' }
  if (lever != null && Number(lever) > maxLeverage) {
    return { ok: false, reason: `杠杆 ${lever}x 超过上限 ${maxLeverage}x` }
  }
  const allowed = risk.allowedInstIds ?? []
  if (Array.isArray(allowed) && allowed.length > 0 && a.instId && !allowed.includes(String(a.instId))) {
    return { ok: false, reason: `交易对 ${a.instId} 不在白名单内` }
  }
  return { ok: true, notional, requiresPermit: !riskReducing, riskReducing }
}

function decimalMultiple(value, step) {
  const quotient = value / step
  return Math.abs(quotient - Math.round(quotient)) <= 1e-8 * Math.max(1, Math.abs(quotient))
}

function validatePrecision(a, metadata) {
  const size = Number(a.sz)
  const minSize = Number(metadata?.minSz)
  const maxSize = Number(metadata?.maxSz)
  const lotSize = Number(metadata?.lotSz)
  if (!Number.isFinite(size) || size <= 0) return { ok: false, reason: '订单数量无效' }
  if (Number.isFinite(minSize) && minSize > 0 && size < minSize) return { ok: false, reason: `订单数量低于最小值 ${metadata.minSz}` }
  if (Number.isFinite(maxSize) && maxSize > 0 && size > maxSize) return { ok: false, reason: `订单数量超过最大值 ${metadata.maxSz}` }
  if (Number.isFinite(lotSize) && lotSize > 0 && !decimalMultiple(size, lotSize)) return { ok: false, reason: `订单数量不符合步进 ${metadata.lotSz}` }
  if (a.px != null && a.px !== '') {
    const price = Number(a.px)
    const tickSize = Number(metadata?.tickSz)
    const minPrice = Number(metadata?.minPx)
    const maxPrice = Number(metadata?.maxPx)
    if (!Number.isFinite(price) || price <= 0) return { ok: false, reason: '订单价格无效' }
    if (Number.isFinite(minPrice) && minPrice > 0 && price < minPrice) return { ok: false, reason: `订单价格低于交易所最小值 ${metadata.minPx}` }
    if (Number.isFinite(maxPrice) && maxPrice > 0 && price > maxPrice) return { ok: false, reason: `订单价格超过交易所最大值 ${metadata.maxPx}` }
    if (Number.isFinite(tickSize) && tickSize > 0 && !decimalMultiple(price, tickSize)) return { ok: false, reason: `订单价格不符合最小变动单位 ${metadata.tickSz}` }
  }
  return { ok: true }
}

function estimateNotional(a, state) {
  const sz = Number(a.sz)
  if (!Number.isFinite(sz) || sz <= 0) return null
  if (String(a.tgtCcy ?? '').toLowerCase() === 'quote_ccy') return sz
  const px = Number(a.px)
  const inst = a.instId ? String(a.instId) : ''
  const last = state.lastPrices?.get(inst)
  const price = Number.isFinite(px) && px > 0 ? px : last
  const metadata = state.instrumentMetadata?.get(inst)
  const market = String(metadata?.market ?? '').toLowerCase()
  const contractMultiplier = Number(metadata?.contractMultiplier)
  if (market === 'inverse') {
    if (!Number.isFinite(contractMultiplier) || contractMultiplier <= 0) return null
    return sz * contractMultiplier
  }
  if (market === 'linear') {
    if (!Number.isFinite(price) || price <= 0) return null
    return sz * (Number.isFinite(contractMultiplier) && contractMultiplier > 0 ? contractMultiplier : 1) * price
  }
  if (inst.toUpperCase().endsWith('-SWAP')) {
    const contractValue = Number(metadata?.ctVal)
    if (!Number.isFinite(contractValue) || contractValue <= 0 || !Number.isFinite(price) || price <= 0) return null
    const valueCurrency = String(metadata?.ctValCcy ?? '').toUpperCase()
    const quoteCurrency = String(metadata?.quoteCcy ?? metadata?.settleCcy ?? '').toUpperCase()
    return valueCurrency && quoteCurrency && valueCurrency === quoteCurrency ? sz * contractValue : sz * contractValue * price
  }
  if (Number.isFinite(price) && price > 0) return sz * price
  return null
}
