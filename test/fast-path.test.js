import assert from 'node:assert/strict'
import test from 'node:test'
import { compileMarketPacket } from '../src/market-packet.js'
import { installReasoningRouter, routeReasoningEffort } from '../src/reasoning-router.js'
import { renderClustrRuntimeContext } from '../src/prompt-contract.js'
import { registerTraderTools } from '../src/trader-tools.js'
import {
  CLUSTR_MODEL_TOOL_NAMES,
  filterClustrToolsForAgent,
  markClustrAgentScope,
} from '../src/tool-scope.js'

function registerWithMocks(overrides = {}) {
  const definitions = []
  const tools = { register(definition) { definitions.push(definition); return () => {} } }
  const core = {
    status: async () => ({ state: 'ready' }),
    autonomyStatus: async () => ({ id: 'observe' }),
    createThesis: async (value) => value,
    listTheses: async () => [],
    transitionThesis: async (_id, value) => value,
    decisionRoom: async (_id, value) => value,
    createShadow: async () => ({ state: 'created' }),
    recordRiskEvaluation: async (value) => value,
    recordMemory: async (value) => value,
    memoryReview: async () => ({ count: 0 }),
    provenance: async () => [],
  }
  registerTraderTools(tools, {
    contextSnapshot: async ({ sessionId }) => ({ sessionId, stateVersion: 1 }),
    accountsOverview: async () => ({ accounts: [] }),
    marketPacket: async (value) => ({ exchange: value.exchange, state: 'ready' }),
    marketAnalysis: async () => ({ state: 'insufficient-evidence' }),
    core,
    startReplay: async () => ({ state: 'ready' }),
    executeOrder: async (value) => ({ action: value.action, exchangeState: 'accepted' }),
    ...overrides,
  })
  return definitions
}

test('Clustr exposes a fixed ten-tool model surface and hides generic/raw tools', () => {
  assert.equal(CLUSTR_MODEL_TOOL_NAMES.size, 10)
  const agent = { id: 'clustr-fast-path' }
  const dispose = markClustrAgentScope(agent)
  const assembly = {
    sections: [], contexts: [], variables: {},
    tools: [
      ...[...CLUSTR_MODEL_TOOL_NAMES].map((name) => ({ name })),
      { name: 'okx_spot_place_order' },
      { name: 'bash' },
      { name: 'subagent' },
      { name: 'web_search' },
      { name: 'clustr_position_size' },
    ],
  }
  const filtered = filterClustrToolsForAgent(assembly, { agent })
  assert.deepEqual(new Set(filtered.tools.map((item) => item.name)), CLUSTR_MODEL_TOOL_NAMES)
  dispose()
})

test('composite tools use typed results, deadlines and safe-read parallelism', async () => {
  const definitions = registerWithMocks()
  assert.deepEqual(new Set(definitions.map((item) => item.name)), CLUSTR_MODEL_TOOL_NAMES)
  for (const definition of definitions) {
    assert.equal(definition.output.schema.type, 'object')
    assert.ok(Number.isFinite(definition.timeoutMs) && definition.timeoutMs > 0)
  }
  const context = definitions.find((item) => item.name === 'clustr_context')
  let concluded = false
  const value = await context.execute({ action: 'snapshot', direct: true }, {
    agent: { id: 'session-fast' },
    concludeTurn() { concluded = true },
  })
  assert.equal(value.status, 'ok')
  assert.equal(value.data.sessionId, 'session-fast')
  assert.equal(context.isConcurrencySafe({ action: 'snapshot' }), true)
  assert.equal(concluded, true)

  const order = definitions.find((item) => item.name === 'clustr_order')
  assert.equal(order.isConcurrencySafe({ action: 'status' }), true)
  assert.equal(order.isConcurrencySafe({ action: 'place' }), false)
  const orderValue = await order.execute({ exchange: 'okx', action: 'status', market: 'spot', instId: 'BTC-USDT', clientOrderId: 'clstr-1' }, {})
  assert.equal(orderValue.data.exchangeState, 'accepted')
})

test('reasoning router spends thinking only where uncertainty requires it', () => {
  assert.equal(routeReasoningEffort('BTC 现在多少钱？'), 'off')
  assert.equal(routeReasoningEffort('检查我的 Binance 账户余额和 API 权限'), 'off')
  assert.equal(routeReasoningEffort('当前连接了几个账户？只回答数量和状态。'), 'off')
  assert.equal(routeReasoningEffort('只读检查全部已连接账户的余额、持仓、读取状态、权限风险和执行边界，并按交易所与账户分别汇总'), 'off')
  assert.equal(routeReasoningEffort('分析 BTC 市场结构并给出反证和失效条件'), 'high')
  assert.equal(routeReasoningEffort('帮我买入 BTC，先做风控和审批'), 'high')
  assert.equal(routeReasoningEffort('对这个交易计划做一次深度对抗式审查'), 'max')
})

test('reasoning router restores the correct output budget across fast and analysis turns', async () => {
  const listeners = new Map()
  const ctx = { on(name, listener) { listeners.set(name, listener); return () => listeners.delete(name) } }
  const agent = {}
  const enter = (text, turn) => listeners.get('agent/pre-step')({ agent, messages: [{ content: [{ type: 'text', text }] }], turn }, async () => ({ kind: 'enter', messages: [] }))
  const request = (turn, config) => listeners.get('agent/request')({ agent, turn }, async () => config)
  const dispose = installReasoningRouter(ctx)
  await enter('OKX 账户连接了吗？', 1)
  assert.deepEqual(await request(1, { provider: 'deepseek-official', model: 'deepseek-v4-pro', reasoningEffort: 'high', maxTokens: 4096 }), { provider: 'deepseek-official', model: 'deepseek-v4-pro', reasoningEffort: 'off', maxTokens: 1200 })
  await enter('分析 BTC 市场结构和反证', 2)
  assert.deepEqual(await request(2, { provider: 'deepseek-official', model: 'deepseek-v4-pro', reasoningEffort: 'off', maxTokens: 1200 }), { provider: 'deepseek-official', model: 'deepseek-v4-pro', reasoningEffort: 'high', maxTokens: 2600 })
  await enter('深度对抗式分析 BTC 交易计划', 3)
  assert.equal((await request(3, { provider: 'deepseek-official', model: 'deepseek-v4-pro', maxTokens: 1200 })).maxTokens, 4096)
  dispose()
  assert.equal(listeners.size, 0)
})

test('runtime prompt changes on semantic version, not heartbeat timestamps', () => {
  const base = {
    sessionId: 'session-fast',
    preset: 'crypto-trader',
    stateVersion: 7,
    selection: { exchange: 'okx', symbol: 'BTC-USDT', marketType: 'spot', timeframe: '15m', source: 'console' },
    executionMode: { readOnly: true, expiresAt: null },
    autonomy: { id: 'observe', usedOrders: 0, definition: { label: '观察' } },
    killSwitch: { active: false },
    accounts: [],
    unknownOrderCount: 0,
  }
  const first = renderClustrRuntimeContext({ ...base, updatedAt: 1 })
  const second = renderClustrRuntimeContext({ ...base, updatedAt: 999999999 })
  assert.equal(first, second)
  assert.match(first, /状态版本：7/)
  assert.doesNotMatch(first, /状态更新时间/)
})

test('market packet compiles candles and depth into a compact evidence object', () => {
  const now = Date.parse('2026-08-20T00:00:00Z')
  const candles = Array.from({ length: 30 }, (_, index) => ({
    timestamp: now - (29 - index) * 60_000,
    open: 100 + index,
    high: 102 + index,
    low: 99 + index,
    close: 101 + index,
    volume: 10 + index,
  }))
  const packet = compileMarketPacket({
    exchange: 'okx', instId: 'BTC-USDT', marketType: 'spot', bar: '1m', receivedAt: now,
    ticker: { price: 130, bid: 129.9, ask: 130.1, timestamp: now - 250 },
    klines: { candles },
    book: { bids: [{ price: 129.9, size: 2 }], asks: [{ price: 130.1, size: 1 }] },
  })
  assert.equal(packet.state, 'ready')
  assert.equal(packet.candleCount, 30)
  assert.equal(packet.price, 130)
  assert.ok(packet.features.atr > 0)
  assert.ok(packet.liquidity.spreadBps > 0)
  assert.equal('candles' in packet, false)
})
