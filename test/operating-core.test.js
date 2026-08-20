import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { ClustrOperatingCore } from '../src/operating-core.js'

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'clustr-core-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const core = new ClustrOperatingCore({ file: join(dir, 'state.json'), readOnly: false })
  await core.setAutonomy({ id: 'approve', scope: { exchanges: ['okx'], instruments: ['BTC-USDT'], expiresAt: new Date(Date.now() + 60_000).toISOString(), maxOrders: 2, maxRiskPercent: 1 } })
  const risk = await core.recordRiskEvaluation({ exchange: 'okx', instId: 'BTC-USDT', side: 'buy', equityUsdt: 10000, entryPrice: 50000, stopPrice: 49500, quantity: 0.01, dataAgeMs: 10, slippageBps: 5 })
  assert.equal(risk.allowed, true)
  return { core, permitId: risk.executionPermit.id, notional: risk.metrics.notionalUsdt }
}

test('execution authorization consumes permit and autonomy atomically', async (t) => {
  const { core, permitId, notional } = await fixture(t)
  const attempts = await Promise.allSettled([
    core.consumeExecutionAuthorization({ permitId, exchange: 'okx', instId: 'BTC-USDT', side: 'buy', notionalUsdt: notional }),
    core.consumeExecutionAuthorization({ permitId, exchange: 'okx', instId: 'BTC-USDT', side: 'buy', notionalUsdt: notional }),
  ])
  assert.equal(attempts.filter((item) => item.status === 'fulfilled').length, 1)
  assert.equal(attempts.filter((item) => item.status === 'rejected').length, 1)
  assert.equal((await core.autonomyStatus()).usedOrders, 1)
})

test('kill switch revokes active permits and resets autonomy', async (t) => {
  const { core, permitId, notional } = await fixture(t)
  await core.setKillSwitch({ active: true, confirmed: true, reason: 'user requested' })
  assert.equal((await core.executionGate()).ok, false)
  assert.equal((await core.autonomyStatus()).definition.level, 0)
  await assert.rejects(core.consumeExecutionAuthorization({ permitId, exchange: 'okx', instId: 'BTC-USDT', side: 'buy', notionalUsdt: notional }), /紧急停止/)
})

test('restoring read-only revokes permits and rejects writes before approval', async (t) => {
  const { core, permitId, notional } = await fixture(t)
  await core.applyExecutionMode({ readOnly: true, actor: 'user', reason: 'manual relock' })
  assert.equal((await core.executionGate()).ok, false)
  assert.equal((await core.autonomyStatus()).definition.level, 0)
  await assert.rejects(core.consumeExecutionAuthorization({ permitId, exchange: 'okx', instId: 'BTC-USDT', side: 'buy', notionalUsdt: notional }), /只读保护|自主权授权不可用/)
})

test('execution budget and unknown orders survive a process restart', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'clustr-ledger-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const file = join(dir, 'state.json')
  const first = new ClustrOperatingCore({ file, readOnly: false })
  await first.reserveExecutionBudget({ clientOrderId: 'exec-a', exchangeClientOrderId: 'clstr-a', exchange: 'okx', instId: 'BTC-USDT', market: 'spot', notionalUsdt: 500, maxDailyNotionalUsdt: 1000 })
  await assert.rejects(first.reserveExecutionBudget({ clientOrderId: 'exec-b', exchangeClientOrderId: 'clstr-b', exchange: 'okx', instId: 'BTC-USDT', market: 'spot', notionalUsdt: 501, maxDailyNotionalUsdt: 1000 }), /超过上限/)
  await first.markExecutionUnknown('exec-a')

  const restarted = new ClustrOperatingCore({ file, readOnly: false })
  const before = await restarted.executionLedgerStatus()
  assert.equal(before.unknownOrders.length, 1)
  assert.equal(before.reservedNotionalUsdt, 500)
  await restarted.resolveExecutionBudget('exec-a', { exchangeState: 'filled', countNotional: true })
  const after = await restarted.executionLedgerStatus()
  assert.equal(after.unknownOrders.length, 0)
  assert.equal(after.reservedNotionalUsdt, 0)
  assert.equal(after.dailyNotionalUsdt, 500)
})

test('order lifecycle persists every safety boundary and reconciles without duplicate submission', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'clustr-orders-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const file = join(dir, 'state.json')
  const first = new ClustrOperatingCore({ file, readOnly: false })
  await first.createOrderLifecycle({ id: 'exec-1', sessionId: 'session-a', exchange: 'okx', profile: 'demo', market: 'spot', instId: 'BTC-USDT', side: 'buy', orderType: 'limit', size: '0.01', requestedPrice: 50000, exchangeClientOrderId: 'clstr-1' })
  await first.transitionOrderLifecycle('exec-1', { state: 'validating' })
  await first.transitionOrderLifecycle('exec-1', { state: 'awaiting-approval' })
  await first.transitionOrderLifecycle('exec-1', { state: 'approved' })
  await first.transitionOrderLifecycle('exec-1', { state: 'submitting' })
  await first.transitionOrderLifecycle('exec-1', { state: 'unknown', reason: 'transport timeout' })
  await first.noteOrderReconciliation('exec-1', { error: 'exchange query timeout' })

  const restarted = new ClustrOperatingCore({ file, readOnly: false })
  const pending = await restarted.findOrderLifecycle({ exchangeClientOrderId: 'clstr-1' })
  assert.equal(pending.state, 'reconciling')
  assert.equal(pending.reconciliation.attempts, 1)
  assert.ok(Date.parse(pending.reconciliation.nextCheckAt) > Date.now())
  await restarted.transitionOrderLifecycle('exec-1', { state: 'open', exchangeState: 'live', exchangeOrderId: 'order-1', source: 'exchange-reconciliation', reconciliation: true })
  const resolved = await restarted.findOrderLifecycle({ id: 'exec-1' })
  assert.equal(resolved.state, 'open')
  assert.equal(resolved.exchangeOrderId, 'order-1')
  assert.equal((await restarted.listOrderLifecycles({ sessionId: 'session-a', activeOnly: true })).length, 1)
})

test('order lifecycle rejects impossible jumps and keeps cancellation uncertain until exchange confirmation', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'clustr-orders-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  const core = new ClustrOperatingCore({ file: join(dir, 'state.json'), readOnly: false })
  await core.createOrderLifecycle({ id: 'exec-2', exchange: 'okx', market: 'swap', instId: 'ETH-USDT-SWAP', side: 'sell', orderType: 'limit', size: '1', exchangeClientOrderId: 'clstr-2' })
  await assert.rejects(core.transitionOrderLifecycle('exec-2', { state: 'filled' }), /不能从 received/)
  await core.transitionOrderLifecycle('exec-2', { state: 'validating' })
  await core.transitionOrderLifecycle('exec-2', { state: 'awaiting-approval' })
  await core.transitionOrderLifecycle('exec-2', { state: 'approved' })
  await core.transitionOrderLifecycle('exec-2', { state: 'submitting' })
  await core.transitionOrderLifecycle('exec-2', { state: 'open', exchangeState: 'live' })
  await core.transitionOrderLifecycle('exec-2', { state: 'cancel-pending' })
  await core.transitionOrderLifecycle('exec-2', { state: 'unknown', reason: 'cancel response timed out' })
  await core.noteOrderReconciliation('exec-2')
  await core.transitionOrderLifecycle('exec-2', { state: 'canceled', exchangeState: 'canceled', source: 'exchange-reconciliation', reconciliation: true })
  const finalOrder = await core.findOrderLifecycle({ id: 'exec-2' })
  assert.equal(finalOrder.state, 'canceled')
  assert.ok(finalOrder.terminalAt)
  assert.equal((await core.listOrderLifecycles({ activeOnly: true })).length, 0)
})
