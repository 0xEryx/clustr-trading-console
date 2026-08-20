import test from 'node:test'
import assert from 'node:assert/strict'
import {
  bindTradingSession,
  inspectBoundSession,
  inspectCurrentSession,
  inspectSessionAccess,
  inspectSessionModes,
  resolveEffectivePreset,
} from '../src/session-access.js'

function snapshot(id, initialPreset, selections = []) {
  return {
    session: { id, agentPreset: initialPreset },
    events: selections.map((agentPreset, index) => ({
      type: 'agent-preset/selected',
      seq: index,
      data: { agentPreset },
    })),
  }
}

class MemoryBindingStore {
  constructor(sessionId = null) { this.sessionId = sessionId }
  async read() { return this.sessionId ? { schemaVersion: 1, sessionId: this.sessionId } : null }
  async bind(sessionId, { replace = false } = {}) {
    if (this.sessionId && this.sessionId !== sessionId && !replace) throw new Error('另一个 Clustr 交易会话已启用；需要明确确认后才能切换。')
    this.sessionId = sessionId
    return this.read()
  }
  async clear(expected = null) {
    if (expected && expected !== this.sessionId) throw new Error('目标会话不是当前启用的 Clustr 交易会话')
    this.sessionId = null
    return true
  }
}

test('effective preset uses the newest committed selection instead of the frozen header', () => {
  const current = snapshot('newest', 'crypto-trader', ['cordis', 'crypto-trader', 'code'])
  assert.equal(resolveEffectivePreset(current), 'code')
})

test('an exact session reads its effective preset from complete events', async () => {
  const sessions = new Map([
    ['clustr', snapshot('clustr', 'cordis', ['crypto-trader'])],
    ['code', snapshot('code', 'crypto-trader', ['code'])],
  ])
  const sessionQuery = { readSession: async (id) => sessions.get(id) }

  assert.deepEqual(await inspectSessionAccess(sessionQuery, 'clustr'), {
    sessionId: 'clustr', eligible: true, effectivePreset: 'crypto-trader',
  })
  assert.deepEqual(await inspectSessionAccess(sessionQuery, 'code'), {
    sessionId: 'code', eligible: false, effectivePreset: 'code',
  })
})

test('creating Clustr B never steals the explicit binding from Clustr A', async () => {
  const sessions = new Map([
    ['clustr-a', snapshot('clustr-a', 'crypto-trader')],
    ['clustr-b', snapshot('clustr-b', 'crypto-trader')],
  ])
  const sessionQuery = { readSession: async (id) => sessions.get(id) }
  const binding = new MemoryBindingStore()

  await bindTradingSession(sessionQuery, binding, 'clustr-a')
  const a = await inspectCurrentSession(sessionQuery, binding, 'clustr-a')
  const b = await inspectCurrentSession(sessionQuery, binding, 'clustr-b')
  const sidebar = await inspectBoundSession(sessionQuery, binding)

  assert.equal(a.eligible, true)
  assert.equal(a.bindingState, 'bound')
  assert.equal(b.eligible, false)
  assert.equal(b.bindingState, 'occupied')
  assert.equal(sidebar.sessionId, 'clustr-a')
  assert.equal(sidebar.eligible, true)
})

test('switching the bound session from Clustr to Code invalidates it immediately', async () => {
  const sessions = new Map([['clustr-b', snapshot('clustr-b', 'crypto-trader')]])
  const sessionQuery = { readSession: async (id) => sessions.get(id) }
  const binding = new MemoryBindingStore('clustr-b')

  assert.equal((await inspectCurrentSession(sessionQuery, binding, 'clustr-b')).eligible, true)
  sessions.set('clustr-b', snapshot('clustr-b', 'crypto-trader', ['code']))

  const current = await inspectCurrentSession(sessionQuery, binding, 'clustr-b')
  const sidebar = await inspectBoundSession(sessionQuery, binding)
  assert.equal(current.eligible, false)
  assert.equal(current.bindingState, 'invalid')
  assert.equal(sidebar.eligible, false)
  assert.equal(sidebar.bindingState, 'invalid')
})

test('a normal session cannot inherit Clustr access from its frozen header', async () => {
  const sessions = new Map([['normal', snapshot('normal', 'crypto-trader', ['code'])]])
  const sessionQuery = { readSession: async (id) => sessions.get(id) }
  const binding = new MemoryBindingStore('normal')

  const access = await inspectCurrentSession(sessionQuery, binding, 'normal')
  assert.equal(access.presetEligible, false)
  assert.equal(access.eligible, false)
  assert.equal(access.effectivePreset, 'code')
})

test('a query failure preserves the binding and is not reported as unauthorized', async () => {
  const binding = new MemoryBindingStore('clustr-a')
  const sessionQuery = { readSession: async () => { throw new Error('temporary failure') } }

  const access = await inspectBoundSession(sessionQuery, binding)
  assert.equal(access.sessionId, 'clustr-a')
  assert.equal(access.bindingState, 'query_error')
  assert.equal(access.presetEligible, null)
  assert.equal(binding.sessionId, 'clustr-a')
})

test('changing the bound session requires an explicit replacement', async () => {
  const sessions = new Map([
    ['clustr-a', snapshot('clustr-a', 'crypto-trader')],
    ['clustr-b', snapshot('clustr-b', 'crypto-trader')],
  ])
  const sessionQuery = { readSession: async (id) => sessions.get(id) }
  const binding = new MemoryBindingStore('clustr-a')

  await assert.rejects(() => bindTradingSession(sessionQuery, binding, 'clustr-b'), /明确确认/)
  assert.equal(binding.sessionId, 'clustr-a')
  await bindTradingSession(sessionQuery, binding, 'clustr-b', { replace: true })
  assert.equal(binding.sessionId, 'clustr-b')
})

test('sidebar mode lookup uses complete events and isolates per-session query failures', async () => {
  const sessions = new Map([
    ['clustr', snapshot('clustr', 'cordis', ['crypto-trader'])],
    ['code', snapshot('code', 'crypto-trader', ['code'])],
  ])
  const sessionQuery = { readSession: async (id) => {
    if (id === 'broken') throw new Error('temporary failure')
    return sessions.get(id)
  } }

  assert.deepEqual(await inspectSessionModes(sessionQuery, ['clustr', 'code', 'broken', 'clustr']), {
    sessions: [
      { sessionId: 'clustr', state: 'ready', presetEligible: true, effectivePreset: 'crypto-trader' },
      { sessionId: 'code', state: 'ready', presetEligible: false, effectivePreset: 'code' },
      { sessionId: 'broken', state: 'query_error', presetEligible: null, effectivePreset: null },
    ],
  })
})
