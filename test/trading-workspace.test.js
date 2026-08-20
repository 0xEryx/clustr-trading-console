import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTradingWorkspace } from '../src/trading-workspace.js'

test('trading workspace merges exchange orders with Clustr lifecycle without duplicates', () => {
  const workspace = buildTradingWorkspace({
    accounts: [{
      connected: true, exchange: 'okx', profile: 'demo', readStatus: 'ready', readAt: 1000,
      positions: [{ symbol: 'BTC-USDT-SWAP', marketType: 'swap', side: 'long', size: 2, entryPrice: 50000, markPrice: 50100, unrealizedPnl: 200, leverage: 2, liquidationPrice: 30000 }],
      orders: [{ exchange: 'okx', id: 'order-1', clientOrderId: 'clstr-1', symbol: 'BTC-USDT', marketType: 'spot', side: 'buy', orderType: 'limit', size: 0.01, filledSize: 0, price: 49000, status: 'live', createdAt: 900 }],
    }],
    trackedOrders: [{ id: 'exec-1', sessionId: 'session-a', exchange: 'okx', profile: 'demo', market: 'spot', instrument: 'BTC-USDT', side: 'buy', orderType: 'limit', size: '0.01', requestedPrice: 49000, exchangeClientOrderId: 'clstr-1', state: 'acknowledged', createdAt: new Date(800).toISOString(), updatedAt: new Date(850).toISOString(), reconciliation: { attempts: 0 }, timeline: [] }],
    ledger: { reservedNotionalUsdt: 490, unknownOrders: [] },
    at: 1200,
  })

  assert.equal(workspace.positions.length, 1)
  assert.equal(workspace.openOrders.length, 1)
  assert.equal(workspace.openOrders[0].source, 'clustr+exchange')
  assert.equal(workspace.openOrders[0].status, 'open')
  assert.equal(workspace.openOrders[0].lifecycleId, 'exec-1')
  assert.equal(workspace.metrics.reconciliationOrders, 0)
})

test('trading workspace keeps an unknown order visible even when the exchange snapshot is empty', () => {
  const workspace = buildTradingWorkspace({
    accounts: [{ connected: true, exchange: 'okx', profile: 'demo', readStatus: 'partial', readAt: 1000, positions: [], orders: [] }],
    trackedOrders: [{ id: 'exec-unknown', sessionId: 'session-a', exchange: 'okx', profile: 'demo', market: 'spot', instrument: 'ETH-USDT', side: 'sell', orderType: 'market', size: '1', exchangeClientOrderId: 'clstr-unknown', state: 'reconciling', createdAt: new Date(800).toISOString(), updatedAt: new Date(900).toISOString(), reconciliation: { attempts: 2 }, timeline: [] }],
    ledger: { reservedNotionalUsdt: 2000, unknownOrders: [{ clientOrderId: 'exec-unknown' }] },
  })

  assert.equal(workspace.openOrders.length, 1)
  assert.equal(workspace.openOrders[0].status, 'reconciling')
  assert.equal(workspace.metrics.reconciliationOrders, 1)
  assert.equal(workspace.metrics.partialAccounts, 1)
})
