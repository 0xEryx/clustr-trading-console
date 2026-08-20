import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'

import { SessionTapeStore } from '../src/session-tape.js'

test('session tape records a standardized replay and verified slippage', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'clustr-tape-'))
  const file = join(directory, 'tape.json')
  try {
    const store = new SessionTapeStore({ file })
    const entry = store.start({ sessionId: 'session-a', callId: 'call-1', exchange: 'okx', action: 'place', market: 'spot', instrument: 'BTC-USDT', side: 'buy', orderType: 'market', size: '0.01', referencePrice: 100, clientOrderId: 'clstr-1' })
    store.stage(entry.id, { name: 'risk-passed', label: '风控通过', status: 'ok', latencyMs: 12, details: { notionalUsdt: 100 } })
    store.finish(entry.id, { status: 'filled', label: '成交已核验', result: { exchangeOrderId: 'order-1', fillPrice: 100.1, referencePrice: 100 } })
    await store.flush()
    const view = store.list({ sessionId: 'session-a' })
    assert.equal(view.entries.length, 1)
    assert.equal(view.entries[0].status, 'filled')
    assert.ok(Math.abs(view.entries[0].metrics.slippageBps - 10) < 0.0001)
    assert.equal(view.metrics.measuredSlippageSamples, 1)
    assert.ok(view.entries[0].stages.some((stage) => stage.name === 'completed'))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('session tape isolates sessions and never persists supplied secret fields', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'clustr-tape-'))
  const file = join(directory, 'tape.json')
  try {
    const store = new SessionTapeStore({ file })
    const first = store.start({ sessionId: 'session-a', action: 'place', instrument: 'BTC-USDT', clientOrderId: 'clstr-a', apiKey: 'SENTINEL_API_KEY' })
    store.stage(first.id, { name: 'submitted', details: { secretKey: 'SENTINEL_SECRET', reason: 'safe reason' } })
    store.finish(first.id, { status: 'ok', result: { passphrase: 'SENTINEL_PASS', exchangeOrderId: 'order-a' } })
    store.start({ sessionId: 'session-b', action: 'cancel', instrument: 'ETH-USDT', clientOrderId: 'clstr-b' })
    await store.flush()
    assert.equal(store.list({ sessionId: 'session-a' }).entries.length, 1)
    assert.equal(store.list({ sessionId: 'session-b' }).entries.length, 1)
    const persisted = await readFile(file, 'utf8')
    assert.doesNotMatch(persisted, /SENTINEL_/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('unknown orders can be enriched later without inventing fill metrics', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'clustr-tape-'))
  try {
    const store = new SessionTapeStore({ file: join(directory, 'tape.json') })
    const entry = store.start({ sessionId: 'session-a', action: 'place', instrument: 'BTC-USDT', side: 'sell', referencePrice: 100, clientOrderId: 'clstr-unknown' })
    store.finish(entry.id, { status: 'unknown', result: { exchangeClientOrderId: 'clstr-unknown' } })
    assert.equal(store.list({ sessionId: 'session-a' }).entries[0].metrics.slippageBps, null)
    store.reconcileByClientOrderId('clstr-unknown', { status: 'filled', fillPrice: 99.9, referencePrice: 100 })
    const resolved = store.list({ sessionId: 'session-a' })
    assert.equal(resolved.entries[0].status, 'filled')
    assert.ok(Math.abs(resolved.entries[0].metrics.slippageBps - 10) < 0.0001)
    await store.flush()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('restart preserves missing metrics as missing and redacts secret-shaped error text', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'clustr-tape-'))
  const file = join(directory, 'tape.json')
  try {
    const first = new SessionTapeStore({ file })
    const entry = first.start({ sessionId: 'session-a', action: 'place', instrument: 'BTC-USDT', side: 'buy' })
    first.finish(entry.id, { status: 'error', result: { reason: 'exchange rejected apiKey=SENTINEL_API_KEY secretKey:SENTINEL_SECRET' } })
    await first.flush()
    const persisted = await readFile(file, 'utf8')
    assert.doesNotMatch(persisted, /SENTINEL_/)

    const restored = new SessionTapeStore({ file })
    const view = restored.list({ sessionId: 'session-a' })
    assert.equal(view.entries[0].metrics.slippageBps, null)
    assert.equal(view.metrics.measuredSlippageSamples, 0)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
