const ACTIVE_ORDER_STATES = new Set(['submitting', 'unknown', 'reconciling', 'acknowledged', 'open', 'live', 'partially-filled', 'partially_filled', 'cancel-pending'])
const RECONCILIATION_STATES = new Set(['submitting', 'unknown', 'reconciling', 'manual-review'])

function finite(value) {
  if (value == null || value === '') return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

function timestamp(value) {
  if (value == null || value === '') return null
  const numeric = Number(value)
  if (Number.isFinite(numeric)) return numeric
  const parsed = Date.parse(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

function state(value) {
  const normalized = String(value ?? 'unknown').toLowerCase().replace(/_/g, '-')
  return ({ new: 'acknowledged', accepted: 'acknowledged', pending: 'open', live: 'open', partiallyfilled: 'partially-filled', cancelled: 'canceled', complete: 'filled', completed: 'filled' })[normalized] ?? normalized
}

function key(order) {
  const exchange = String(order.exchange ?? '').toLowerCase()
  const identity = String(order.clientOrderId ?? order.exchangeClientOrderId ?? order.id ?? order.exchangeOrderId ?? '')
  return identity ? `${exchange}:${identity}` : ''
}

function normalizeExchangeOrder(account, order) {
  return {
    source: 'exchange', exchange: account.exchange, profile: account.profile,
    id: String(order.id ?? ''), clientOrderId: String(order.clientOrderId ?? ''),
    symbol: String(order.symbol ?? ''), marketType: String(order.marketType ?? ''), side: String(order.side ?? '').toLowerCase(),
    orderType: String(order.orderType ?? ''), size: finite(order.size), filledSize: finite(order.filledSize),
    price: finite(order.price), averageFillPrice: finite(order.averageFillPrice), reduceOnly: order.reduceOnly === true,
    status: state(order.status), createdAt: timestamp(order.createdAt), updatedAt: timestamp(order.updatedAt),
    reconciliation: null, timeline: [],
  }
}

function normalizeTrackedOrder(order) {
  return {
    source: 'clustr', exchange: String(order.exchange ?? ''), profile: String(order.profile ?? ''),
    id: String(order.exchangeOrderId ?? ''), clientOrderId: String(order.exchangeClientOrderId ?? ''), lifecycleId: String(order.id ?? ''),
    symbol: String(order.instrument ?? ''), marketType: String(order.market ?? ''), side: String(order.side ?? '').toLowerCase(),
    orderType: String(order.orderType ?? ''), size: finite(order.size), filledSize: finite(order.filledSize),
    price: finite(order.requestedPrice), averageFillPrice: finite(order.averageFillPrice), reduceOnly: false,
    status: state(order.state), exchangeState: order.exchangeState ? String(order.exchangeState) : null,
    createdAt: timestamp(order.createdAt), updatedAt: timestamp(order.updatedAt),
    reconciliation: order.reconciliation ?? null, timeline: Array.isArray(order.timeline) ? order.timeline.slice(-20) : [],
  }
}

export function buildTradingWorkspace({ accounts = [], trackedOrders = [], ledger = {}, at = Date.now() } = {}) {
  const connected = accounts.filter((account) => account?.connected)
  const positions = connected.flatMap((account) => (Array.isArray(account.positions) ? account.positions : []).map((position) => ({
    exchange: account.exchange, profile: account.profile, readStatus: account.readStatus,
    symbol: String(position.symbol ?? ''), marketType: String(position.marketType ?? ''), side: String(position.side ?? '').toLowerCase(),
    size: finite(position.size), entryPrice: finite(position.entryPrice), markPrice: finite(position.markPrice),
    unrealizedPnl: finite(position.unrealizedPnl), leverage: finite(position.leverage), liquidationPrice: finite(position.liquidationPrice),
    marginMode: String(position.marginMode ?? ''), margin: finite(position.margin), readAt: timestamp(account.readAt),
  }))).filter((position) => position.symbol)

  const exchangeOrders = connected.flatMap((account) => (Array.isArray(account.orders) ? account.orders : []).map((order) => normalizeExchangeOrder(account, order)))
  const lifecycleOrders = trackedOrders.map(normalizeTrackedOrder)
  const merged = new Map()
  for (const order of lifecycleOrders) {
    const orderKey = key(order) || `lifecycle:${order.lifecycleId}`
    merged.set(orderKey, order)
  }
  for (const order of exchangeOrders) {
    const orderKey = key(order) || `exchange:${order.exchange}:${order.id}`
    const tracked = merged.get(orderKey)
    merged.set(orderKey, tracked ? {
      ...tracked, ...order, source: 'clustr+exchange', lifecycleId: tracked.lifecycleId,
      reconciliation: tracked.reconciliation, timeline: tracked.timeline,
    } : order)
  }
  const allOrders = [...merged.values()].sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0))
  const openOrders = allOrders.filter((order) => ACTIVE_ORDER_STATES.has(state(order.status)))
  const reconciliationOrders = allOrders.filter((order) => RECONCILIATION_STATES.has(state(order.status)))
  const totalUnrealizedPnl = positions.map((position) => position.unrealizedPnl).filter(Number.isFinite).reduce((sum, value) => sum + value, 0)
  const readTimes = connected.map((account) => timestamp(account.readAt)).filter(Number.isFinite)
  const ledgerUnknown = Array.isArray(ledger.unknownOrders) ? ledger.unknownOrders.length : 0

  return {
    at,
    accounts: connected,
    positions,
    openOrders,
    trackedOrders: lifecycleOrders,
    recentOrders: allOrders.slice(0, 100),
    metrics: {
      connectedAccounts: connected.length,
      positions: positions.length,
      openOrders: openOrders.length,
      reconciliationOrders: Math.max(reconciliationOrders.length, ledgerUnknown),
      totalUnrealizedPnl,
      reservedNotionalUsdt: finite(ledger.reservedNotionalUsdt) ?? 0,
      oldestReadAt: readTimes.length ? Math.min(...readTimes) : null,
      partialAccounts: connected.filter((account) => account.readStatus !== 'ready').length,
    },
  }
}
