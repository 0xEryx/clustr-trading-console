// Clustr Trading Console — multi-exchange AI trader toolkit for DeepSeek Harness.
import { randomBytes } from 'node:crypto'
import { OkxBridge } from './bridge.js'
import { classifyTool, moduleOf, summarize } from './tool-policy.js'
import { checkWrite } from './risk.js'
import { append as auditAppend, entries as auditEntries, status as auditStatus } from './audit.js'
import { registerRoutes } from './routes.js'
import { CredentialVault } from './vault.js'
import { BinancePublicAdapter } from './binance.js'
import { BinanceExecutionAdapter, BinanceExecutionError } from './binance-execution.js'
import { registerTraderTools } from './trader-tools.js'
import { analysisCatalog, analyzeMarket, normalizeCandleRows } from './analysis.js'
import { ClustrOperatingCore } from './operating-core.js'
import { BybitPublicAdapter } from './bybit.js'
import { BybitMcpBridge, BybitMcpError, BybitTradingAdapter } from './bybit-mcp.js'
import { HyperliquidPublicAdapter } from './hyperliquid.js'
import { readExchangeAccount } from './account-adapters.js'
import { ClustrNetwork } from './network.js'
import {
  bindTradingSession,
  inspectBoundSession,
  inspectCurrentSession,
  inspectSessionModes,
  unbindTradingSession,
} from './session-access.js'
import { SessionBindingStore } from './session-binding.js'
import { ExecutionPolicyStore } from './execution-policy.js'
import { accountProviders, capabilityManifest } from './capabilities.js'
import { CLUSTR_PROMPT_VERSION, renderClustrRuntimeContext } from './prompt-contract.js'
import { filterClustrToolsForAgent, guardClustrToolExecution } from './tool-scope.js'
import { compileMarketPacket } from './market-packet.js'
import { CLUSTR_VERSION } from './version.js'
import { SessionTapeStore } from './session-tape.js'
import { buildTradingWorkspace } from './trading-workspace.js'
import { routeOrderIntent } from './order-routing.js'

// Keep the host half pending until every service it binds to is active. Without
// this declaration Cordis may call apply() before Web routes and tools exist,
// leaving a client bundle with no matching host capabilities.
export const inject = ['tools', 'systemPrompt', 'webServer', 'approval', 'sessionQuery', 'timer']

export function apply(ctx, config = {}) {
  const cfg = {
    okxProfile: config.okxProfile ?? 'demo',
    modules: config.modules ?? ['market', 'account', 'spot', 'swap'],
    readOnly: config.readOnly ?? true,
    allowUserExecutionUnlock: config.allowUserExecutionUnlock ?? true,
    maxExecutionUnlockMinutes: config.maxExecutionUnlockMinutes ?? 480,
    risk: config.risk ?? {},
    proxyUrl: config.proxyUrl ?? null,
    useSystemProxy: config.useSystemProxy ?? true,
    watchlist: Array.isArray(config.watchlist) && config.watchlist.length > 0
      ? config.watchlist
      : ['BTC-USDT', 'ETH-USDT', 'BTC-USDT-SWAP', 'ETH-USDT-SWAP'],
  }
  const vault = new CredentialVault()
  const network = new ClustrNetwork({ proxyUrl: cfg.proxyUrl, useSystemProxy: cfg.useSystemProxy })
  const networkFetch = network.fetch.bind(network)
  const binance = new BinancePublicAdapter({ fetchImpl: networkFetch })
  const bybit = new BybitPublicAdapter({ timeoutMs: 5000, fetchImpl: networkFetch })
  const hyperliquid = new HyperliquidPublicAdapter({ timeoutMs: 8000, fetchImpl: networkFetch })
  const core = new ClustrOperatingCore({ readOnly: true, risk: cfg.risk })
  const sessionTape = new SessionTapeStore()
  const sessionBinding = new SessionBindingStore()
  const executionPolicy = new ExecutionPolicyStore({
    defaultReadOnly: cfg.readOnly,
    allowUnlock: cfg.allowUserExecutionUnlock,
    maxUnlockMinutes: cfg.maxExecutionUnlockMinutes,
  })
  const csrfToken = randomBytes(24).toString('base64url')
  const state = {
    bridge: null,
    bridgeReady: false,
    lastPrices: new Map(),
    lastPriceAt: new Map(),
    tickers: [],
    tickersAt: 0,
    tickerPollStatus: { state: 'unknown', lastSuccessAt: null, lastErrorAt: null, reason: null },
    accountCache: null,
    accountsOverviewCache: null,
    accountsOverviewPromise: null,
    accountPollStatus: { state: 'unknown', lastSuccessAt: null, lastErrorAt: null, reason: null },
    dailyNotional: 0,
    dailyDate: '',
    reservedNotional: 0,
    unknownOrders: new Map(),
    toolCount: 0,
    writeTools: [],
    blockedTools: [],
    registrations: [],
    okxRegistrations: [],
    okxToolDefinitions: new Map(),
    bridgeStartPromise: null,
    bybitBridges: new Map(),
    tickerPollPromise: null,
    accountPollPromise: null,
    reconcilePromise: null,
    marketProbePromise: null,
    instrumentCache: new Map(),
    instrumentMetadata: new Map(),
    analysisRequests: 0,
    executionAccountVerification: new Map(),
    executionMode: { readOnly: true, mode: 'read-only', allowUnlock: false, state: 'loading', expiresAt: null, reason: '正在读取执行保护状态' },
    toolReloadPromise: null,
    activeWriteCalls: 0,
    pendingReadOnlyBridgeReload: false,
    promptSnapshot: null,
    promptFingerprint: null,
    promptStateVersion: 0,
    promptRefreshPromise: null,
    sessionContexts: new Map(),
    disposed: false,
  }
  const toolsSvc = ctx.get('tools')
  const approval = ctx.get('approval')
  const sessionQuery = ctx.get('sessionQuery')
  const timer = ctx.get('timer')
  const cleanup = []

  // Two independent controls are intentional: the assembly filter removes the
  // tools from ordinary models, and the monotonic guard denies guessed calls,
  // Code Mode sub-dispatches, or stale clients that still know a tool name.
  cleanup.push(ctx.on('system-prompt/assemble', async (_assembly, context, next) => {
    const assembly = await next()
    return filterClustrToolsForAgent(assembly, context)
  }))
  cleanup.push(toolsSvc.guard(guardClustrToolExecution))

  async function refreshExecutionMode() {
    try {
      const previous = state.executionMode
      const current = await executionPolicy.status()
      state.executionMode = { ...current, state: 'ready' }
      core.syncReadOnly(current.readOnly)
      if (previous?.readOnly === false && current.readOnly === true && current.expired === true) {
        await core.applyExecutionMode({ readOnly: true, actor: 'system', reason: current.reason })
        auditAppend({ ts: Date.now(), tool: 'clustr_execution_mode', status: 'ok', reason: current.reason })
        if (state.activeWriteCalls === 0) await reloadOkxTools()
        else state.pendingReadOnlyBridgeReload = true
      }
      return state.executionMode
    } catch (error) {
      const message = String(error?.message ?? error)
      core.syncReadOnly(true)
      state.executionMode = { readOnly: true, mode: 'read-only', allowUnlock: false, state: 'error', expiresAt: null, reason: message }
      return state.executionMode
    }
  }

  const executionPolicyReady = refreshExecutionMode()

  async function bridge() {
    await executionPolicyReady
    if (!state.bridge) state.bridge = new OkxBridge({
      profile: cfg.okxProfile,
      modules: cfg.modules,
      readOnly: state.executionMode.readOnly,
      credentials: async () => {
        try { return await vault.get('okx', cfg.okxProfile) }
        catch (error) {
          if (error?.code === 'VAULT_UNAVAILABLE') return null
          throw error
        }
      },
      proxyEnv: () => network.childEnv(),
    })
    if (!state.bridgeReady && !state.bridgeStartPromise) {
      state.bridgeStartPromise = state.bridge.start()
        .then(() => { state.bridgeReady = true })
        .finally(() => { state.bridgeStartPromise = null })
    }
    if (!state.bridgeReady) await state.bridgeStartPromise
    return state.bridge
  }

  async function resetBridge() {
    if (state.bridge) await state.bridge.dispose().catch(() => {})
    state.bridge = null
    state.bridgeReady = false
    state.executionAccountVerification.clear()
  }

  async function resetBybitBridge(profile = null) {
    const target = profile == null ? null : String(profile).toLowerCase()
    for (const [key, value] of state.bybitBridges) {
      if (target != null && key !== target) continue
      await value.dispose().catch(() => {})
      state.bybitBridges.delete(key)
    }
  }

  function disposeOkxTools() {
    const stale = new Set(state.okxRegistrations)
    for (const dispose of state.okxRegistrations) { try { dispose() } catch {} }
    state.registrations = state.registrations.filter((dispose) => !stale.has(dispose))
    state.okxRegistrations = []
    state.okxToolDefinitions.clear()
    state.toolCount = 0
    state.writeTools = []
    state.blockedTools = []
  }

  async function reloadOkxTools() {
    if (state.toolReloadPromise) return state.toolReloadPromise
    state.toolReloadPromise = (async () => {
      disposeOkxTools()
      await resetBridge()
      await initTools()
      return { toolCount: state.toolCount, writeTools: [...state.writeTools] }
    })().finally(() => { state.toolReloadPromise = null })
    return state.toolReloadPromise
  }

  function normalizeSchema(schema) {
    if (schema && typeof schema === 'object' && schema.type === 'object' && schema.properties && typeof schema.properties === 'object') {
      return { type: 'object', properties: schema.properties, required: Array.isArray(schema.required) ? schema.required : [], additionalProperties: true }
    }
    return { type: 'object', properties: {}, additionalProperties: true }
  }

  async function hydrateOrderContext(instId) {
    const instrument = String(instId ?? '').toUpperCase()
    if (!instrument) return
    const b = await bridge()
    if (!state.instrumentMetadata.has(instrument)) {
      const instType = instrument.endsWith('-SWAP') ? 'SWAP' : 'SPOT'
      const raw = await b.callTool('market_get_instruments', { instType })
      const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
      const metadata = rows.find((row) => String(row?.instId ?? '').toUpperCase() === instrument)
      if (metadata) state.instrumentMetadata.set(instrument, metadata)
    }
    const ticker = normalizeTicker(await b.callTool('market_get_ticker', { instId: instrument }), instrument)
    if (typeof ticker?.last === 'number') {
      state.lastPrices.set(instrument, ticker.last)
      state.lastPriceAt.set(instrument, Date.now())
    }
  }

  async function verifyExecutionAccount(exchange = 'okx', profile = cfg.okxProfile, options = {}) {
    const key = `${String(exchange).toLowerCase()}:${String(profile).toLowerCase()}`
    const cached = state.executionAccountVerification.get(key)
    if (cached?.ok && Date.now() - cached.at < 20_000) return cached.overview
    const credentials = await vault.get(exchange, profile)
    if (!credentials) throw new Error('执行账户没有可用凭证')
    const overview = await readExchangeAccount(exchange, credentials, { demo: exchange === 'okx' && String(profile).toLowerCase() === 'demo', fetchImpl: networkFetch, ...options })
    if (!['ready', 'partial'].includes(overview.readStatus)) throw new Error(overview.errors?.[0]?.reason ?? '执行账户状态无法确认')
    if (overview.security?.highRisk) throw new Error('执行账户的 API Key 含提现或划转权限，写操作被拒绝')
    if (overview.security?.canTrade !== true) throw new Error('执行账户没有交易权限')
    state.executionAccountVerification.set(key, { ok: true, at: Date.now(), overview })
    return overview
  }

  function capabilityOptions() {
    return { readOnly: state.executionMode.readOnly, executionExchange: state.executionMode.exchange, executionProfile: state.executionMode.profile }
  }

  function orderResponseFacts(data) {
    const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    const row = rows[0] ?? (data && typeof data === 'object' ? data : {})
    const numeric = (value) => { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : null }
    return {
      exchangeOrderId: row?.ordId ?? row?.orderId ?? null,
      exchangeClientOrderId: row?.clOrdId ?? row?.clientOrderId ?? null,
      exchangeState: row?.state ?? row?.status ?? 'accepted',
      fillPrice: numeric(row?.avgPx ?? row?.fillPx ?? row?.averagePrice),
      filledSize: numeric(row?.accFillSz ?? row?.fillSz ?? row?.filledSize),
    }
  }

  function lifecycleStateFromExchange(exchangeState, filledSize, requestedSize) {
    const value = String(exchangeState ?? '').toLowerCase().replace(/_/g, '-')
    if (/fill|complete/.test(value) && !/partial/.test(value)) return 'filled'
    if (/cancel/.test(value)) return 'canceled'
    if (/reject|fail/.test(value)) return 'rejected'
    const filled = Number(filledSize)
    const requested = Number(requestedSize)
    if (/partial/.test(value) || (Number.isFinite(filled) && filled > 0 && (!Number.isFinite(requested) || filled < requested))) return 'partially-filled'
    if (/live|open|pending|new/.test(value)) return 'open'
    return 'acknowledged'
  }

  function tapeSessionId(exec) { return String(exec?.sessionId ?? exec?.agent?.sessionId ?? exec?.agent?.id ?? '') }
  function commandAction(toolName) {
    if (/cancel/i.test(toolName)) return 'cancel'
    if (/close/i.test(toolName)) return 'close'
    if (/amend/i.test(toolName)) return 'amend'
    return 'place'
  }

  async function initTools() {
    if (state.toolCount > 0 || state.disposed) return
    const b = await bridge()
    const tools = await b.listTools()
    if (!toolsSvc) return
    for (const t of tools) {
      if (typeof t?.name !== 'string') continue
      const mod = moduleOf(t.name)
      if (!mod || !cfg.modules.includes(mod)) continue
      const dshName = 'okx_' + t.name
      const policy = classifyTool(t)
      if (policy.blocked) {
        state.blockedTools.push({ name: t.name, reason: policy.reason })
        continue
      }
      const write = policy.write
      const parameters = normalizeSchema(t.inputSchema)
      if (write) parameters.properties.clustrRiskPermit = { type: 'string', description: '由 clustr_risk 的 pretrade 动作生成的五分钟单次执行许可；取消、整仓平仓和 reduceOnly 等风险降低操作不需要。' }
      const definition = {
        name: dshName,
        description: `[Clustr · OKX ${mod}${write ? ' · 写操作（风控+审批）' : ' · 只读'}] ${t.description ?? ''}`,
        parameters,
        output: { schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] },
        async execute(args, exec) {
          if (state.disposed) return JSON.stringify({ status: 'error', message: '插件已经停止' })
          if (write) state.activeWriteCalls += 1
          const callArgs = { ...(args ?? {}) }
          delete callArgs.clustrRiskPermit
          const orderSubmission = write && /(place|create|amend).*order|order.*(place|create|amend)/i.test(t.name) && !/cancel/i.test(t.name)
          const newOrderSubmission = orderSubmission && /place|create/i.test(t.name) && !/amend/i.test(t.name)
          const cancelCommand = write && /cancel/i.test(t.name)
          if (newOrderSubmission && !callArgs.clOrdId) callArgs.clOrdId = `clstr${randomBytes(8).toString('hex')}`
          const ledgerOrderId = orderSubmission ? `exec${randomBytes(12).toString('hex')}` : null
          const isTradeCommand = write && (orderSubmission || /cancel|close/i.test(t.name))
          const tape = isTradeCommand ? sessionTape.start({
            sessionId: tapeSessionId(exec),
            callId: exec?.callId,
            exchange: 'okx',
            action: commandAction(t.name),
            market: String(callArgs.instId ?? '').endsWith('-SWAP') ? 'swap' : 'spot',
            instrument: callArgs.instId,
            side: callArgs.side ?? callArgs.posSide,
            orderType: callArgs.ordType,
            size: callArgs.sz,
            requestedPrice: callArgs.px,
            referencePrice: state.lastPrices.get(String(callArgs.instId ?? '').toUpperCase()),
            clientOrderId: callArgs.clOrdId,
          }) : null
          const tapeStage = (input) => { if (tape) sessionTape.stage(tape.id, input) }
          const tapeFinish = (status, label, result = {}) => { if (tape) sessionTape.finish(tape.id, { status, label, result }) }
          let localReservation = 0
          let lifecycleId = null
          let exchangeSubmissionStarted = false
          let exchangeAcknowledged = false
          let exchangeFacts = null
          const lifecycleTransition = async (input) => {
            if (!lifecycleId) return null
            return core.transitionOrderLifecycle(lifecycleId, input)
          }
          try {
            if (newOrderSubmission) {
              const created = await core.createOrderLifecycle({
                id: ledgerOrderId,
                sessionId: tapeSessionId(exec),
                exchange: 'okx',
                profile: cfg.okxProfile,
                market: String(callArgs.instId ?? '').endsWith('-SWAP') ? 'swap' : 'spot',
                instrument: callArgs.instId,
                side: callArgs.side ?? callArgs.posSide,
                orderType: callArgs.ordType,
                size: callArgs.sz,
                requestedPrice: callArgs.px,
                referencePrice: state.lastPrices.get(String(callArgs.instId ?? '').toUpperCase()),
                exchangeClientOrderId: callArgs.clOrdId,
              })
              lifecycleId = created.id
              await lifecycleTransition({ state: 'validating', reason: '正在核验账户、行情、风险与授权' })
            }
            if (write) {
              const toolArgs = callArgs
              const permitId = String(args?.clustrRiskPermit ?? '')
              await verifyExecutionAccount()
              if (orderSubmission) await hydrateOrderContext(toolArgs.instId)
              const referencePrice = state.lastPrices.get(String(toolArgs.instId ?? '').toUpperCase())
              tapeStage({ name: 'account-verified', label: '账户与行情已核验', status: 'ok', details: { referencePrice } })
              await refreshExecutionMode()
              const executionGate = await core.executionGate()
              if (!executionGate.ok) {
                await lifecycleTransition({ state: 'rejected', reason: executionGate.reason, source: 'risk-gate' })
                auditAppend({ ts: Date.now(), tool: dshName, args: toolArgs, status: 'rejected', reason: executionGate.reason })
                tapeFinish('rejected', '执行保护拒绝', { reason: executionGate.reason, referencePrice })
                return JSON.stringify({ status: 'rejected', reason: executionGate.reason })
              }
              const autonomy = await core.autonomyStatus()
              const verdict = checkWrite({ toolName: t.name, args: toolArgs, config: { ...cfg, readOnly: state.executionMode.readOnly }, state, autonomy })
              if (!verdict.ok) {
                await lifecycleTransition({ state: 'rejected', reason: verdict.reason, source: 'risk-kernel' })
                auditAppend({ ts: Date.now(), tool: dshName, args: toolArgs, status: 'rejected', reason: verdict.reason })
                tapeFinish('rejected', '确定性风控拒绝', { reason: verdict.reason, referencePrice })
                return JSON.stringify({ status: 'rejected', reason: verdict.reason })
              }
              const autonomyScope = await core.validateAutonomy({ exchange: 'okx', instId: toolArgs.instId })
              if (!autonomyScope.ok) {
                await lifecycleTransition({ state: 'rejected', reason: autonomyScope.reason, source: 'authorization' })
                auditAppend({ ts: Date.now(), tool: dshName, args: toolArgs, status: 'rejected', reason: autonomyScope.reason })
                tapeFinish('rejected', '授权范围拒绝', { reason: autonomyScope.reason, referencePrice, notionalUsdt: verdict.notional })
                return JSON.stringify({ status: 'rejected', reason: autonomyScope.reason })
              }
              if (verdict.requiresPermit) {
                const permit = await core.validateRiskPermit(permitId, { instId: toolArgs.instId, notionalUsdt: verdict.notional, side: toolArgs.side })
                if (!permit.ok) {
                  await lifecycleTransition({ state: 'rejected', reason: permit.reason, source: 'risk-permit' })
                  auditAppend({ ts: Date.now(), tool: dshName, args: toolArgs, status: 'rejected', reason: permit.reason })
                  tapeFinish('rejected', '风险许可拒绝', { reason: permit.reason, referencePrice, notionalUsdt: verdict.notional })
                  return JSON.stringify({ status: 'rejected', reason: permit.reason })
                }
              }
              tapeStage({ name: 'risk-passed', label: '风控与授权通过', status: 'ok', details: { notionalUsdt: verdict.notional, referencePrice, riskDecision: 'passed' } })
              if (!approval || !exec?.agent) {
                await lifecycleTransition({ state: 'failed', reason: '缺少逐笔审批上下文', source: 'approval' })
                auditAppend({ ts: Date.now(), tool: dshName, args: toolArgs, status: 'denied', reason: '无审批栈或执行上下文（fail-closed）' })
                tapeFinish('denied', '审批上下文缺失', { reason: '无审批栈或执行上下文', referencePrice, notionalUsdt: verdict.notional })
                return JSON.stringify({ status: 'denied', message: '缺少审批栈或执行上下文，写操作被拒绝（fail-closed）。' })
              }
              const approvalStartedAt = Date.now()
              await lifecycleTransition({ state: 'awaiting-approval', reason: '等待用户逐笔确认', source: 'approval' })
              tapeStage({ name: 'approval-requested', label: '等待用户逐笔审批', status: 'pending' })
              const outcome = await approval.request({
                agent: exec.agent,
                toolName: dshName,
                callId: exec?.callId,
                reason: `订单摘要：${summarize(t.name, toolArgs)}；名义约 ${verdict.notional != null ? verdict.notional.toFixed(2) : '未知'} USDT。`,
                signal: exec?.signal,
              })
              tapeStage({ name: 'approval-resolved', label: outcome === 'allowed-once' ? '用户已批准' : '用户未批准', status: outcome === 'allowed-once' ? 'ok' : 'denied', latencyMs: Date.now() - approvalStartedAt, metric: 'approval', details: { approval: String(outcome) } })
              if (outcome !== 'allowed-once') {
                await lifecycleTransition({ state: 'denied', reason: `逐笔审批结果：${String(outcome)}`, source: 'approval' })
                auditAppend({ ts: Date.now(), tool: dshName, args: toolArgs, status: 'denied', reason: '审批未通过：' + String(outcome) })
                tapeFinish('denied', '逐笔审批未通过', { reason: `审批结果：${String(outcome)}`, referencePrice, notionalUsdt: verdict.notional, approval: String(outcome) })
                return JSON.stringify({ status: 'denied', outcome: String(outcome), message: '审批未通过，订单未执行。' })
              }
              await lifecycleTransition({ state: 'approved', reason: '用户已批准本次交易', source: 'approval' })
              if (cancelCommand) {
                const trackedOrder = await core.findOrderLifecycle({ exchangeClientOrderId: callArgs.clOrdId, exchangeOrderId: callArgs.ordId })
                if (trackedOrder) {
                  lifecycleId = trackedOrder.id
                  await lifecycleTransition({ state: 'cancel-pending', reason: '用户已批准撤销订单，正在发送至交易所', source: 'approval' })
                }
              }
              if (verdict.notional != null) {
                const maxDaily = cfg.risk.maxDailyNotionalUsdt ?? 50000
                await core.reserveExecutionBudget({ clientOrderId: ledgerOrderId, exchangeClientOrderId: callArgs.clOrdId, exchange: 'okx', instId: toolArgs.instId, market: String(toolArgs.instId ?? '').endsWith('-SWAP') ? 'swap' : 'spot', notionalUsdt: verdict.notional, maxDailyNotionalUsdt: maxDaily })
                localReservation = verdict.notional
              }
              if (verdict.requiresPermit) await core.consumeExecutionAuthorization({ permitId, exchange: 'okx', instId: toolArgs.instId, notionalUsdt: verdict.notional, side: toolArgs.side })
              else await core.consumeAutonomyOrder({ exchange: 'okx', instId: toolArgs.instId })
            }
            const b = await bridge()
            const exchangeStartedAt = Date.now()
            if (newOrderSubmission) await lifecycleTransition({ state: 'submitting', reason: '订单正在发送至交易所', source: 'execution' })
            exchangeSubmissionStarted = isTradeCommand
            tapeStage({ name: 'submitted', label: '已提交至交易所', status: 'pending', details: { referencePrice: state.lastPrices.get(String(callArgs.instId ?? '').toUpperCase()), exchangeClientOrderId: callArgs.clOrdId } })
            const data = await b.callTool(t.name, callArgs)
            const facts = orderResponseFacts(data)
            exchangeAcknowledged = newOrderSubmission
            exchangeFacts = facts
            tapeStage({ name: 'exchange-acknowledged', label: '交易所已响应', status: 'ok', latencyMs: Date.now() - exchangeStartedAt, metric: 'exchange-ack', details: facts })
            if (localReservation > 0) {
              await core.resolveExecutionBudget(ledgerOrderId, { exchangeState: 'accepted', countNotional: true })
              localReservation = 0
            }
            if (newOrderSubmission) await lifecycleTransition({
              state: lifecycleStateFromExchange(facts.exchangeState, facts.filledSize, callArgs.sz),
              exchangeState: facts.exchangeState,
              exchangeOrderId: facts.exchangeOrderId,
              filledSize: facts.filledSize,
              fillPrice: facts.fillPrice,
              source: 'exchange',
              reason: facts.fillPrice ? '交易所返回可核验成交结果' : '交易所已接受订单',
            })
            auditAppend({ ts: Date.now(), tool: dshName, args: callArgs, status: 'ok' })
            tapeFinish('ok', facts.fillPrice ? '成交结果已核验' : '交易所已接受，等待成交数据', { ...facts, referencePrice: state.lastPrices.get(String(callArgs.instId ?? '').toUpperCase()), exchangeClientOrderId: facts.exchangeClientOrderId ?? callArgs.clOrdId })
            return JSON.stringify({ status: 'ok', data })
          } catch (err) {
            const message = String(err?.message ?? err)
            if (exchangeAcknowledged) {
              auditAppend({ ts: Date.now(), tool: dshName, args: callArgs, status: 'accepted-with-local-warning', reason: '交易所已响应，但本地订单状态保存异常' })
              tapeFinish('accepted', '交易所已响应，本地状态待恢复', { ...exchangeFacts, reason: '本地订单状态保存异常', referencePrice: state.lastPrices.get(String(callArgs.instId ?? '').toUpperCase()), exchangeClientOrderId: exchangeFacts?.exchangeClientOrderId ?? callArgs.clOrdId })
              return JSON.stringify({ status: 'accepted', data: exchangeFacts, warning: '交易所已经响应，但本地订单状态暂时无法保存。请按 clientOrderId 核对，禁止重复下单。' })
            }
            if (isTradeCommand && /timeout|timed out|disconnect|connection|closed|econn|epipe|unknown/i.test(message)) {
              if (localReservation > 0) {
                await core.markExecutionUnknown(ledgerOrderId).catch(() => {})
                localReservation = 0
              }
              if (lifecycleId) await lifecycleTransition({ state: 'unknown', reason: '提交结果未知，系统将自动向交易所核对', source: 'execution' }).catch(() => {})
              auditAppend({ ts: Date.now(), tool: dshName, args: callArgs, status: 'unknown', reason: '提交结果未知，必须按 clientOrderId 查询确认' })
              tapeFinish('unknown', '订单状态待核对', { reason: '提交结果未知，禁止盲目重试', referencePrice: state.lastPrices.get(String(callArgs.instId ?? '').toUpperCase()), exchangeClientOrderId: callArgs.clOrdId })
              return JSON.stringify({ status: 'unknown', state: 'reconciling', clientOrderId: callArgs.clOrdId, message: '订单提交结果未知。请按 clientOrderId 查询确认，禁止盲目重试。' })
            }
            if (localReservation > 0) {
              await core.releaseExecutionBudget(ledgerOrderId, message).catch(() => {})
              localReservation = 0
            }
            if (lifecycleId) await lifecycleTransition({ state: cancelCommand ? 'unknown' : exchangeSubmissionStarted ? 'rejected' : 'failed', reason: message, source: exchangeSubmissionStarted ? 'exchange' : 'clustr' }).catch(() => {})
            auditAppend({ ts: Date.now(), tool: dshName, args: callArgs, status: 'error', reason: message })
            tapeFinish('error', '交易指令未完成', { reason: message, referencePrice: state.lastPrices.get(String(callArgs.instId ?? '').toUpperCase()), exchangeClientOrderId: callArgs.clOrdId })
            return JSON.stringify({ status: 'error', message })
          } finally {
            if (write) {
              state.activeWriteCalls = Math.max(0, state.activeWriteCalls - 1)
              if (state.activeWriteCalls === 0 && state.pendingReadOnlyBridgeReload) {
                state.pendingReadOnlyBridgeReload = false
                Promise.resolve().then(() => reloadOkxTools()).catch((error) => {
                  auditAppend({ ts: Date.now(), tool: 'clustr_execution_mode', status: 'error', reason: `只读 Bridge 重载失败：${String(error?.message ?? error)}` })
                })
              }
            }
          }
        },
      }
      state.okxToolDefinitions.set(t.name, definition)
      const registration = toolsSvc.register(definition)
      state.okxRegistrations.push(registration)
      state.registrations.push(registration)
      state.toolCount += 1
      if (write) state.writeTools.push(dshName)
    }
    console.log(`[Clustr Trading Console] registered ${state.toolCount} OKX tools (write: ${state.writeTools.length}, blocked: ${state.blockedTools.length})`)
  }

  function normalizeTicker(t, instId) {
    const d = t && typeof t === 'object' ? (Array.isArray(t.data) ? t.data[0] : t) : null
    if (!d) return null
    const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : undefined }
    const last = num(d.last ?? d.lastPx ?? d.lastPrice ?? d.price)
    const open24 = num(d.open24h ?? d.open)
    const chg = open24 && last != null ? ((last - open24) / open24) * 100 : undefined
    return {
      instId,
      last,
      changePct: chg,
      high: num(d.high24h),
      low: num(d.low24h),
      vol: num(d.vol24h ?? d.volCcy24h),
      fundingRate: num(d.fundingRate),
      openInterest: num(d.openInterest),
    }
  }

  function compactSymbol(value) { return String(value ?? '').toUpperCase().replace(/-SWAP$/, '').replace(/[-/_]/g, '') }
  function hyperCoin(value) { return String(value ?? '').toUpperCase().replace(/-SWAP$/, '').split('-')[0] }
  function binanceInterval(value) {
    const interval = String(value ?? '15m')
    return interval === '1H' ? '1h' : interval === '4H' ? '4h' : interval === '1D' ? '1d' : interval
  }
  function publicHealth(adapter) {
    const value = adapter.healthStatus()
    return { ...value, marketData: value.status === 'ready', lastError: value.lastError ? String(value.lastError).slice(0, 240) : null }
  }

  const defaultAccountRefs = () => [
    { exchange: 'okx', profile: String(cfg.okxProfile).toLowerCase() },
    { exchange: 'binance', profile: 'default' },
    { exchange: 'bybit', profile: 'default' },
    { exchange: 'hyperliquid', profile: 'default' },
  ]

  async function readAccountsOverview() {
    if (state.accountsOverviewPromise) return state.accountsOverviewPromise
    state.accountsOverviewPromise = (async () => {
      await refreshExecutionMode()
      const accounts = await vault.status(defaultAccountRefs())
      const providers = new Map(accountProviders(capabilityOptions()).map((provider) => [provider.id, provider]))
      const rows = await Promise.all(accounts.map(async (account) => {
        const provider = providers.get(account.exchange)
        const selectedExecutionAccount = state.executionMode.readOnly
          ? (account.exchange === 'okx' && account.profile === String(cfg.okxProfile).toLowerCase())
          : account.exchange === state.executionMode.exchange && account.profile === state.executionMode.profile
        const execution = !provider ? null : !provider.executionAvailable
          ? { available: false, enabled: false, state: 'read-only', label: '仅账户读取', path: provider.executionPath }
          : !selectedExecutionAccount
            ? { available: true, enabled: false, state: 'not-selected', label: '非执行账户', path: provider.executionPath }
            : state.executionMode.readOnly
              ? { available: true, enabled: false, state: 'protected', label: '只读保护', path: provider.executionPath }
              : { available: true, enabled: true, state: 'ready', label: '逐笔审批交易', path: provider.executionPath }
        const base = { exchange: account.exchange, profile: account.profile, connected: account.connected, hasSigner: account.hasSigner, execution }
        if (provider?.availability === 'unavailable') {
          return { ...base, readStatus: 'unavailable', balances: [], positions: [], orders: [], openOrderCount: null, errors: [], availability: 'unavailable' }
        }
        if (!account.connected) return { ...base, readStatus: 'disconnected', balances: [], positions: [], orders: [], openOrderCount: 0, errors: [] }
        try {
          const credentials = await vault.get(account.exchange, account.profile)
          const overview = await readExchangeAccount(account.exchange, credentials, { demo: account.exchange === 'okx' && account.profile === 'demo', fetchImpl: networkFetch })
          const securedExecution = overview.security?.highRisk && base.execution?.available
            ? { ...base.execution, enabled: false, state: 'blocked-permissions', label: '权限过高，已阻止执行' }
            : base.execution
          return { ...base, ...overview, execution: securedExecution }
        } catch {
          return { ...base, readStatus: 'error', balances: [], positions: [], orders: [], openOrderCount: null, errors: [{ scope: 'account', reason: '账户读取失败，请检查凭证权限与交易所连接。', status: null, code: null }], readAt: Date.now() }
        }
      }))
      const result = { accounts: rows, at: Date.now() }
      state.accountsOverviewCache = result
      return result
    })().finally(() => { state.accountsOverviewPromise = null })
    return state.accountsOverviewPromise
  }

  function defaultSessionContext() {
    return { exchange: 'okx', symbol: 'BTC-USDT', displaySymbol: 'BTC/USDT', marketType: 'spot', timeframe: '15m', source: 'default', updatedAt: null }
  }

  function normalizeSessionContext(input = {}) {
    const exchange = String(input.exchange ?? '').trim().toLowerCase()
    const provider = accountProviders({ readOnly: true }).find((item) => item.id === exchange)
    if (!provider) throw new Error('Console 交易所无效')
    const symbol = String(input.symbol ?? '').trim().toUpperCase()
    if (!symbol || symbol.length > 80 || !/^[A-Z0-9@._:/-]+$/.test(symbol)) throw new Error('Console 交易标的无效')
    const marketType = String(input.marketType ?? '').trim().toLowerCase()
    if (!provider.marketScopes.includes(marketType)) throw new Error('Console 市场类型无效')
    const timeframe = String(input.timeframe ?? '').trim()
    if (!/^(1m|3m|5m|15m|30m|1H|2H|4H|6H|12H|1D|1W)$/i.test(timeframe)) throw new Error('Console K 线周期无效')
    const displaySymbol = String(input.displaySymbol ?? symbol).trim().replace(/[\r\n<>]/g, ' ').slice(0, 96) || symbol
    return { exchange, symbol, displaySymbol, marketType, timeframe, source: 'console', updatedAt: Date.now() }
  }

  function sessionContext(sessionId) {
    return state.sessionContexts.get(String(sessionId ?? '')) ?? defaultSessionContext()
  }

  async function setSessionContext(input = {}) {
    const sessionId = String(input.sessionId ?? '').trim()
    if (!sessionId || sessionId.length > 256 || !/^[a-zA-Z0-9._:-]+$/.test(sessionId)) throw new Error('会话标识无效')
    const access = await traderSession({ sessionId })
    if (access.presetEligible !== true) throw new Error('只有 Clustr Trading Console 会话可以写入交易上下文')
    const next = normalizeSessionContext(input)
    state.sessionContexts.set(sessionId, next)
    return { ok: true, sessionId, context: next }
  }

  async function refreshPromptSnapshot({ refreshAccounts = false } = {}) {
    if (state.promptRefreshPromise) return state.promptRefreshPromise
    state.promptRefreshPromise = (async () => {
      const executionMode = await refreshExecutionMode()
      const accountsOverview = refreshAccounts || !state.accountsOverviewCache
        ? await readAccountsOverview().catch(() => state.accountsOverviewCache ?? { accounts: [], at: 0 })
        : state.accountsOverviewCache
      const [autonomy, killSwitch, executionLedger, activeOrders] = await Promise.all([
        core.autonomyStatus(),
        core.killSwitchStatus(),
        core.executionLedgerStatus(),
        core.listOrderLifecycles({ activeOnly: true, limit: 500 }),
      ])
      const semanticState = {
        executionMode: {
          readOnly: executionMode.readOnly,
          mode: executionMode.mode,
          state: executionMode.state,
          expiresAt: executionMode.expiresAt,
          allowUnlock: executionMode.allowUnlock,
        },
        autonomy: {
          id: autonomy.id,
          usedOrders: autonomy.usedOrders,
          expiresAt: autonomy.expiresAt,
          scope: autonomy.scope,
        },
        killSwitch: { active: killSwitch.active },
        accounts: (accountsOverview?.accounts ?? []).map((account) => ({
          exchange: account.exchange,
          profile: account.profile,
          connected: account.connected,
          readStatus: account.readStatus,
          executionState: account.execution?.state,
        })),
        activeOrderCount: activeOrders.length,
        unknownOrderCount: Math.max(
          Array.isArray(executionLedger?.unknownOrders) ? executionLedger.unknownOrders.length : 0,
          activeOrders.filter((order) => ['submitting', 'unknown', 'reconciling', 'manual-review'].includes(order.state)).length,
        ),
      }
      const fingerprint = JSON.stringify(semanticState)
      if (fingerprint !== state.promptFingerprint) {
        state.promptFingerprint = fingerprint
        state.promptStateVersion += 1
      }
      state.promptSnapshot = {
        promptVersion: CLUSTR_PROMPT_VERSION,
        executionMode,
        autonomy,
        killSwitch,
        accounts: accountsOverview?.accounts ?? [],
        accountsAt: accountsOverview?.at ?? null,
        providers: capabilityManifest({ readOnly: executionMode.readOnly, executionExchange: executionMode.exchange, executionProfile: executionMode.profile }),
        activeOrderCount: semanticState.activeOrderCount,
        unknownOrderCount: semanticState.unknownOrderCount,
        stateVersion: state.promptStateVersion,
        updatedAt: Date.now(),
      }
      return state.promptSnapshot
    })().finally(() => { state.promptRefreshPromise = null })
    return state.promptRefreshPromise
  }

  function runtimeContextFor(agent) {
    const sessionId = String(agent?.id ?? agent?.session?.id ?? '')
    const preset = String(agent?.session?.header?.agentPreset ?? 'crypto-trader')
    return renderClustrRuntimeContext({
      ...(state.promptSnapshot ?? { executionMode: state.executionMode, accounts: [], updatedAt: null }),
      sessionId,
      preset,
      selection: sessionContext(sessionId),
    })
  }

  async function contextSnapshot(input = {}) {
    const sessionId = String(input.sessionId ?? '').trim()
    const snapshot = await refreshPromptSnapshot({ refreshAccounts: true })
    return {
      ...snapshot,
      sessionId: sessionId || null,
      preset: 'crypto-trader',
      selection: sessionContext(sessionId),
    }
  }

  function okxInstrumentRows(raw, marketType) {
    const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
    return rows.filter((row) => !row.state || row.state === 'live').map((row) => ({
      exchange: 'okx',
      symbol: String(row.instId ?? ''),
      displaySymbol: String(row.instId ?? '').replace(/-SWAP$/, ' 永续').replace('-', '/'),
      baseAsset: String(row.baseCcy ?? row.ctValCcy ?? ''),
      quoteAsset: String(row.quoteCcy ?? row.settleCcy ?? ''),
      settleAsset: String(row.settleCcy ?? ''),
      marketType,
      state: 'live',
    })).filter((row) => row.symbol)
  }

  async function instrumentUniverse(exchange, marketType = 'all') {
    const id = String(exchange ?? '').toLowerCase()
    const selectedMarket = marketType || 'all'
    const cacheKey = `${id}:${selectedMarket}`
    const cached = state.instrumentCache.get(cacheKey)
    if (cached?.data && Date.now() - cached.at < 5 * 60_000) return cached.data
    if (cached?.promise) return cached.promise
    const promise = (async () => {
      let data
      if (id === 'okx') {
        const b = await bridge()
        const types = selectedMarket === 'spot' ? ['spot'] : selectedMarket === 'swap' ? ['swap'] : ['spot', 'swap']
        const values = await Promise.all(types.map((type) => b.callTool('market_get_instruments', { instType: type.toUpperCase() })))
        data = values.flatMap((value, index) => okxInstrumentRows(value, types[index]))
      } else if (id === 'binance') data = await binance.instruments(selectedMarket)
      else if (id === 'bybit') {
        const categories = ['spot', 'linear', 'inverse'].includes(selectedMarket) ? [selectedMarket] : ['spot', 'linear', 'inverse']
        data = (await Promise.all(categories.map((category) => bybit.instruments(category)))).flat()
      }
      else if (id === 'hyperliquid') data = await hyperliquid.instruments()
      else throw new Error('该交易所不受支持')
      const unique = [...new Map(data.map((row) => [`${row.marketType}:${row.symbol}`, row])).values()]
      state.instrumentCache.set(cacheKey, { data: unique, at: Date.now(), promise: null })
      return unique
    })().catch((error) => { state.instrumentCache.delete(cacheKey); throw error })
    state.instrumentCache.set(cacheKey, { data: cached?.data ?? null, at: cached?.at ?? 0, promise })
    return promise
  }

  async function searchInstruments({ exchange = 'okx', marketType, query = '', limit = 20 }) {
    const id = String(exchange).toLowerCase()
    const needle = String(query ?? '').trim().toUpperCase().replace(/[-/_\s]/g, '')
    const boundedLimit = Math.min(Math.max(Number(limit) || 20, 1), 50)
    const preferred = new Map(['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE'].map((asset, index) => [asset, index]))
    const rows = (await instrumentUniverse(id, marketType || 'all')).filter((row) => !marketType || marketType === 'all' || row.marketType === marketType).filter((row) => {
      if (!needle) return true
      return [row.symbol, row.displaySymbol, row.baseAsset, row.quoteAsset].some((value) => String(value ?? '').toUpperCase().replace(/[-/_\s]/g, '').includes(needle))
    }).sort((a, b) => {
      const exactA = needle && String(a.symbol).replace(/[-/_]/g, '').toUpperCase().startsWith(needle) ? 0 : 1
      const exactB = needle && String(b.symbol).replace(/[-/_]/g, '').toUpperCase().startsWith(needle) ? 0 : 1
      if (exactA !== exactB) return exactA - exactB
      const quoteRank = (row) => ({ USDT: 0, USDC: 1, USD: 2, BTC: 3, ETH: 4 }[row.quoteAsset] ?? 9)
      const quoteA = quoteRank(a)
      const quoteB = quoteRank(b)
      if (quoteA !== quoteB) return quoteA - quoteB
      if (!needle) {
        const prefA = preferred.get(a.baseAsset) ?? 99
        const prefB = preferred.get(b.baseAsset) ?? 99
        if (prefA !== prefB) return prefA - prefB
        if (a.marketType !== b.marketType) return a.marketType === 'spot' ? -1 : 1
      }
      return String(a.displaySymbol).localeCompare(String(b.displaySymbol))
    }).slice(0, boundedLimit)
    return { exchange: id, query: String(query ?? ''), count: rows.length, instruments: rows, at: Date.now() }
  }

  async function probePublicMarkets() {
    if (state.disposed || state.marketProbePromise) return state.marketProbePromise
    state.marketProbePromise = Promise.allSettled([
      binance.ticker('BTCUSDT'),
      bybit.ticker('BTCUSDT', { category: 'spot' }),
      hyperliquid.ticker('BTC'),
    ]).finally(() => { state.marketProbePromise = null })
    return state.marketProbePromise
  }

  async function publicTicker({ exchange, instId, marketType }) {
    const id = String(exchange ?? '').toLowerCase()
    if (!instId) throw new Error('请选择交易标的')
    if (id === 'okx') {
      const b = await bridge()
      const value = normalizeTicker(await b.callTool('market_get_ticker', { instId }), instId)
      return { exchange: 'okx', symbol: instId, marketType: instId.endsWith('-SWAP') ? 'swap' : 'spot', timestamp: Date.now(), price: value?.last, high24h: value?.high, low24h: value?.low, volume24h: value?.vol, priceChangePercent24h: value?.changePct, fundingRate: value?.fundingRate, openInterest: value?.openInterest }
    }
    if (id === 'binance') {
      const selectedMarket = marketType === 'usd-m-futures' ? 'usd-m-futures' : 'spot'
      const row = await binance.ticker(compactSymbol(instId), { marketType: selectedMarket })
      return { exchange: 'binance', symbol: row.symbol, marketType: selectedMarket, timestamp: Number(row.closeTime) || Date.now(), price: Number(row.lastPrice), bid: Number(row.bidPrice), ask: Number(row.askPrice), open24h: Number(row.openPrice), high24h: Number(row.highPrice), low24h: Number(row.lowPrice), volume24h: Number(row.volume), quoteVolume24h: Number(row.quoteVolume), priceChangePercent24h: Number(row.priceChangePercent) }
    }
    if (id === 'bybit') return bybit.ticker(compactSymbol(instId), { category: marketType ?? (String(instId).endsWith('-SWAP') ? 'linear' : 'spot') })
    if (id === 'hyperliquid') return hyperliquid.ticker(hyperCoin(instId))
    throw new Error('该交易所不受支持')
  }

  async function publicKlines({ exchange, instId, bar = '15m', limit = 200, marketType }) {
    const id = String(exchange ?? '').toLowerCase()
    const boundedLimit = Math.min(Math.max(Number(limit) || 200, 1), 500)
    if (id === 'okx') {
      const value = await klines({ instId, bar, limit: boundedLimit })
      return { exchange: 'okx', symbol: instId, marketType: String(instId).endsWith('-SWAP') ? 'swap' : 'spot', interval: bar, timestamp: Date.now(), candles: normalizeCandleRows(value.candles).map((item) => ({ timestamp: item.ts, open: item.o, high: item.h, low: item.l, close: item.c, volume: item.vol, confirmed: item.confirmed })) }
    }
    if (id === 'binance') {
      const selectedMarket = marketType === 'usd-m-futures' ? 'usd-m-futures' : 'spot'
      const rows = await binance.klines(compactSymbol(instId), binanceInterval(bar), boundedLimit, { marketType: selectedMarket })
      return { exchange: 'binance', symbol: compactSymbol(instId), marketType: selectedMarket, interval: binanceInterval(bar), timestamp: Date.now(), candles: rows.map((item) => ({ timestamp: Number(item[0]), endTimestamp: Number(item[6]), open: Number(item[1]), high: Number(item[2]), low: Number(item[3]), close: Number(item[4]), volume: Number(item[5]), quoteVolume: Number(item[7]), tradeCount: Number(item[8]), confirmed: Number(item[6]) < Date.now() })) }
    }
    if (id === 'bybit') return bybit.klines(compactSymbol(instId), bar, boundedLimit, { category: marketType ?? (String(instId).endsWith('-SWAP') ? 'linear' : 'spot') })
    if (id === 'hyperliquid') return hyperliquid.klines(hyperCoin(instId), bar, boundedLimit)
    throw new Error('该交易所不受支持')
  }

  async function publicBook({ exchange, instId, limit = 20, marketType }) {
    const id = String(exchange ?? '').toLowerCase()
    const boundedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
    if (id === 'okx') {
      const b = await bridge()
      return { exchange: 'okx', symbol: instId, marketType: String(instId).endsWith('-SWAP') ? 'swap' : 'spot', timestamp: Date.now(), data: await b.callTool('market_get_orderbook', { instId, sz: boundedLimit }) }
    }
    if (id === 'binance') {
      const selectedMarket = marketType === 'usd-m-futures' ? 'usd-m-futures' : 'spot'
      const row = await binance.book(compactSymbol(instId), boundedLimit, { marketType: selectedMarket })
      const levels = (items) => items.map((item) => ({ price: Number(item[0]), size: Number(item[1]), orders: null }))
      return { exchange: 'binance', symbol: compactSymbol(instId), marketType: selectedMarket, timestamp: Date.now(), updateId: row.lastUpdateId, bids: levels(row.bids ?? []), asks: levels(row.asks ?? []) }
    }
    if (id === 'bybit') return bybit.book(compactSymbol(instId), boundedLimit, { category: marketType ?? (String(instId).endsWith('-SWAP') ? 'linear' : 'spot') })
    if (id === 'hyperliquid') return hyperliquid.book(hyperCoin(instId), Math.min(boundedLimit, 20))
    throw new Error('该交易所不受支持')
  }

  async function marketPacket({ exchange = 'okx', instId, bar = '15m', limit = 120, marketType }) {
    if (!instId) throw new Error('请选择交易标的')
    const receivedAt = Date.now()
    const settled = await Promise.allSettled([
      publicTicker({ exchange, instId, marketType }),
      publicKlines({ exchange, instId, bar, limit: Math.min(Math.max(Number(limit) || 120, 40), 240), marketType }),
      publicBook({ exchange, instId, limit: 20, marketType }),
    ])
    const errors = settled.filter((item) => item.status === 'rejected').map((item) => String(item.reason?.message ?? item.reason))
    return compileMarketPacket({
      exchange,
      instId,
      marketType,
      bar,
      receivedAt,
      ticker: settled[0].status === 'fulfilled' ? settled[0].value : null,
      klines: settled[1].status === 'fulfilled' ? settled[1].value : null,
      book: settled[2].status === 'fulfilled' ? settled[2].value : null,
      errors,
    })
  }

  async function marketConsensus({ instId }) {
    if (!instId) throw new Error('请选择交易标的')
    const exchanges = ['okx', 'binance', 'bybit', 'hyperliquid']
    const settled = await Promise.allSettled(exchanges.map((exchange) => publicTicker({ exchange, instId })))
    const sources = settled.map((result, index) => result.status === 'fulfilled'
      ? { exchange: exchanges[index], status: 'ready', price: Number(result.value.price), timestamp: result.value.timestamp, dataAgeMs: Math.max(0, Date.now() - Number(result.value.timestamp || Date.now())) }
      : { exchange: exchanges[index], status: 'unavailable', reason: String(result.reason?.message ?? result.reason).slice(0, 240) })
    const prices = sources.filter((item) => item.status === 'ready' && Number.isFinite(item.price)).map((item) => item.price).sort((a, b) => a - b)
    if (!prices.length) return { instId, at: Date.now(), state: 'unavailable', sources, medianPrice: null, dispersionBps: null, warnings: ['没有交易所返回可用价格'] }
    const middle = Math.floor(prices.length / 2)
    const medianPrice = prices.length % 2 ? prices[middle] : (prices[middle - 1] + prices[middle]) / 2
    const dispersionBps = medianPrice > 0 ? (prices.at(-1) - prices[0]) / medianPrice * 10000 : null
    const warnings = []
    if (sources.some((item) => item.status !== 'ready')) warnings.push('部分交易所当前不可用')
    if (dispersionBps != null && dispersionBps > 25) warnings.push('跨交易所价格差异超过 25 bps')
    if (sources.some((item) => item.status === 'ready' && item.dataAgeMs > 30000)) warnings.push('部分行情数据已经过期')
    return { instId, at: Date.now(), state: warnings.length ? 'degraded' : 'ready', medianPrice, dispersionBps, sourceCount: prices.length, sources, warnings }
  }

  async function pollTickers() {
    if (state.disposed || state.tickerPollPromise) return state.tickerPollPromise
    state.tickerPollPromise = (async () => { try {
      const b = await bridge()
      const list = []
      let failures = 0
      for (const instId of cfg.watchlist) {
        try {
          const t = await b.callTool('market_get_ticker', { instId })
          const row = normalizeTicker(t, instId)
          if (row) {
            list.push(row)
            if (typeof row.last === 'number') state.lastPrices.set(instId, row.last)
            state.lastPriceAt.set(instId, Date.now())
          }
        } catch { failures += 1 }
      }
      if (!list.length) throw new Error('行情连接异常')
      state.tickers = list
      state.tickersAt = Date.now()
      state.tickerPollStatus = { state: failures ? 'partial' : 'ready', lastSuccessAt: Date.now(), lastErrorAt: failures ? Date.now() : null, reason: failures ? `${failures} 个关注标的读取异常` : null }
    } catch (error) {
      state.tickerPollStatus = { ...state.tickerPollStatus, state: state.tickersAt ? 'stale' : 'error', lastErrorAt: Date.now(), reason: /timeout/i.test(String(error?.message ?? '')) ? '行情连接超时' : '行情连接异常' }
    } finally { state.tickerPollPromise = null } })()
    return state.tickerPollPromise
  }

  async function pollAccount() {
    if (state.disposed || state.accountPollPromise) return state.accountPollPromise
    state.accountPollPromise = (async () => { try {
      const [account] = await vault.status([{ exchange: 'okx', profile: String(cfg.okxProfile).toLowerCase() }])
      if (!account?.connected) {
        const at = Date.now()
        state.accountCache = { balance: null, positions: null, state: 'disconnected', at }
        state.accountPollStatus = { state: 'disconnected', lastSuccessAt: at, lastErrorAt: null, reason: 'OKX 账户未连接' }
        return
      }
      const b = await bridge()
      const [balanceResult, positionsResult] = await Promise.allSettled([
        b.callTool('account_get_balance', {}),
        b.callTool('account_get_positions', {}),
      ])
      if (balanceResult.status === 'rejected' && positionsResult.status === 'rejected') throw new Error('账户读取异常')
      const partial = balanceResult.status === 'rejected' || positionsResult.status === 'rejected'
      state.accountCache = { balance: balanceResult.status === 'fulfilled' ? balanceResult.value : null, positions: positionsResult.status === 'fulfilled' ? positionsResult.value : null, state: partial ? 'partial' : 'ready', at: Date.now() }
      state.accountPollStatus = { state: partial ? 'partial' : 'ready', lastSuccessAt: Date.now(), lastErrorAt: partial ? Date.now() : null, reason: partial ? '部分账户范围读取异常' : null }
    } catch (error) {
      const stale = Boolean(state.accountCache?.at)
      state.accountPollStatus = { ...state.accountPollStatus, state: stale ? 'stale' : 'error', lastErrorAt: Date.now(), reason: /timeout/i.test(String(error?.message ?? '')) ? '账户连接超时' : '账户读取异常' }
      if (stale) state.accountCache = { ...state.accountCache, state: 'stale', staleAgeMs: Date.now() - state.accountCache.at }
    } finally { state.accountPollPromise = null } })()
    return state.accountPollPromise
  }

  async function reconcileUnknownOrders({ force = false } = {}) {
    if (state.disposed || state.reconcilePromise) return state.reconcilePromise
    state.reconcilePromise = (async () => {
      const ledger = await core.executionLedgerStatus()
      const tracked = (await core.listOrderLifecycles({ activeOnly: !force, dueOnly: !force, limit: 200 }))
        .filter((order) => ['submitting', 'unknown', 'reconciling', 'acknowledged', 'open', 'partially-filled', 'cancel-pending', 'manual-review'].includes(order.state))
      const candidates = new Map()
      for (const order of [...ledger.reservations, ...ledger.unknownOrders]) candidates.set(order.clientOrderId, { ...order, lifecycleId: order.clientOrderId })
      for (const order of tracked) candidates.set(order.id, {
        ...(candidates.get(order.id) ?? {}),
        clientOrderId: order.id,
        lifecycleId: order.id,
        exchangeClientOrderId: order.exchangeClientOrderId,
        exchange: order.exchange,
        profile: order.profile,
        instId: order.instrument,
        market: order.market,
        state: order.state,
        requestedSize: order.size,
      })
      const orders = [...candidates.values()].filter((order) => ['okx', 'binance', 'bybit'].includes(order.exchange))
      if (!orders.length) return { checked: 0, resolved: 0, pending: 0 }
      let okxBridge = null
      let resolved = 0
      let pending = 0
      for (const order of orders) {
        try {
          if (order.state === 'reserved') await core.markExecutionUnknown(order.clientOrderId)
          if (!order.exchangeClientOrderId) {
            await core.noteReconciliationAttempt(order.clientOrderId).catch(() => {})
            await core.noteOrderReconciliation(order.lifecycleId, { error: '缺少交易所客户端订单编号' }).catch(() => {})
            pending += 1
            continue
          }
          let matched
          if (order.exchange === 'binance') {
            const adapter = await binanceExecutionAdapter(order.profile || 'default')
            await adapter.syncTime(order.market)
            const row = await adapter.queryOrder({ market: order.market, instId: order.instId, clientOrderId: order.exchangeClientOrderId })
            if (!row) throw new Error('交易所暂未返回匹配订单')
            matched = {
              state: row.status,
              ordId: row.orderId,
              clOrdId: row.clientOrderId,
              accFillSz: row.filledSize,
              avgPx: row.averageFillPrice,
            }
          } else if (order.exchange === 'bybit') {
            const adapter = await bybitTradingAdapter(order.profile || 'default')
            const row = await adapter.queryOrder({ market: order.market, instId: order.instId, clientOrderId: order.exchangeClientOrderId })
            if (!row) throw new Error('交易所暂未返回匹配订单')
            matched = {
              state: row.status,
              ordId: row.orderId,
              clOrdId: row.clientOrderId,
              accFillSz: row.filledSize,
              avgPx: row.averageFillPrice,
            }
          } else {
            okxBridge ??= await bridge()
            const tool = order.market === 'swap' ? 'swap_get_order' : 'spot_get_order'
            const raw = await okxBridge.callTool(tool, { instId: order.instId, clOrdId: order.exchangeClientOrderId })
            const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
            matched = rows.find((row) => String(row?.clOrdId ?? '') === order.exchangeClientOrderId) ?? rows[0]
          }
          if (!matched) {
            await core.noteReconciliationAttempt(order.clientOrderId).catch(() => {})
            await core.noteOrderReconciliation(order.lifecycleId, { error: '交易所暂未返回匹配订单' }).catch(() => {})
            pending += 1
            continue
          }
          const orderState = String(matched.state ?? 'accepted').toLowerCase()
          const filled = Number(matched.accFillSz ?? matched.fillSz ?? 0)
          const countNotional = !(orderState === 'canceled' && (!Number.isFinite(filled) || filled === 0))
          await core.resolveExecutionBudget(order.clientOrderId, { exchangeState: orderState, countNotional }).catch(() => ({ resolved: false }))
          await core.transitionOrderLifecycle(order.lifecycleId, {
            state: lifecycleStateFromExchange(orderState, filled, order.requestedSize),
            exchangeState: orderState,
            exchangeOrderId: matched.ordId,
            filledSize: Number.isFinite(filled) ? filled : null,
            fillPrice: Number(matched.avgPx ?? matched.fillPx) || null,
            source: 'exchange-reconciliation',
            reason: '交易所订单状态已核对',
            reconciliation: true,
          }).catch(() => {})
          sessionTape.reconcileByClientOrderId(order.exchangeClientOrderId, {
            status: orderState,
            exchangeState: orderState,
            exchangeOrderId: matched.ordId,
            exchangeClientOrderId: matched.clOrdId ?? order.exchangeClientOrderId,
            fillPrice: Number(matched.avgPx ?? matched.fillPx) || null,
          })
          auditAppend({ ts: Date.now(), tool: 'clustr_order_reconciliation', args: { instId: order.instId, clOrdId: order.exchangeClientOrderId }, status: 'reconciled', reason: `订单状态已确认：${orderState}` })
          resolved += 1
        } catch (error) {
          await core.noteReconciliationAttempt(order.clientOrderId).catch(() => {})
          await core.noteOrderReconciliation(order.lifecycleId, { error: /timeout/i.test(String(error?.message ?? '')) ? '交易所查询超时' : '交易所状态暂时无法确认' }).catch(() => {})
          pending += 1
        }
      }
      return { checked: orders.length, resolved, pending }
    })().finally(() => { state.reconcilePromise = null })
    return state.reconcilePromise
  }

  async function klines({ instId, bar, limit }) {
    if (!instId) throw new Error('请选择交易标的')
    const b = await bridge()
    const raw = await b.callTool('market_get_candles', { instId, bar, limit })
    const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : null
    return { instId, bar, candles: rows ?? raw }
  }

  async function marketAnalysis({ method = 'wyckoff', exchange = 'okx', instId, bar, limit, marketType }) {
    if (!instId) throw new Error('请选择交易标的')
    state.analysisRequests += 1
    const selectedExchange = String(exchange).toLowerCase()
    const boundedLimit = Math.min(Math.max(Number(limit) || 200, 40), 300)
    const raw = selectedExchange === 'okx'
      ? await (await bridge()).callTool('market_get_candles', { instId, bar: bar ?? '1H', limit: boundedLimit })
      : (await publicKlines({ exchange: selectedExchange, instId, bar: bar ?? '1H', limit: boundedLimit, marketType })).candles
    return { ...analyzeMarket(method, raw, { instId, bar: bar ?? '1H' }), exchange: selectedExchange, marketType: marketType ?? null }
  }

  const wyckoff = (input) => marketAnalysis({ ...input, method: 'wyckoff' })

  async function startReplay(input = {}) {
    const exchange = String(input.exchange ?? 'okx').toLowerCase()
    const market = await publicKlines({ exchange, instId: input.instId, bar: input.bar ?? '1H', limit: Math.min(Math.max(Number(input.limit) || 200, 40), 300), marketType: input.marketType })
    return core.createReplay({ ...input, instrument: input.instId, exchange, candles: market.candles })
  }

  function compactOrderArguments(input = {}) {
    return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''))
  }

  async function executeOkxOrder(input = {}, exec) {
    const action = String(input.action ?? '')
    const market = String(input.market ?? '')
    const instId = String(input.instId ?? '').trim().toUpperCase()
    if (!['place', 'cancel', 'close', 'status'].includes(action)) throw new Error('订单动作无效')
    if (!['spot', 'swap'].includes(market)) throw new Error('订单市场无效')
    if (!instId || !/^[A-Z0-9._:-]+$/.test(instId)) throw new Error('交易标的无效')
    if (action === 'close' && market !== 'swap') throw new Error('整仓平仓仅适用于永续市场')
    if (['cancel', 'status'].includes(action) && !input.orderId && !input.clientOrderId) throw new Error('查询或撤单必须提供 orderId 或 clientOrderId')
    if (action === 'place') {
      if (!input.tdMode || !input.side || !input.ordType || !input.size) throw new Error('下单缺少 tdMode、side、ordType 或 size')
      if (input.ordType !== 'market' && !input.price) throw new Error('非市价订单必须提供 price')
      if (!input.riskPermit && input.reduceOnly !== true) throw new Error('新增或扩大风险的订单缺少单次风险许可')
    }
    if (action === 'close' && !['cross', 'isolated'].includes(String(input.tdMode ?? ''))) throw new Error('整仓平仓必须提供 cross 或 isolated 保证金模式')
    if (!state.okxToolDefinitions.size) await initTools()
    const rawName = action === 'place' ? `${market}_place_order`
      : action === 'cancel' ? `${market}_cancel_order`
        : action === 'status' ? `${market}_get_order`
          : `${market}_close_position`
    const definition = state.okxToolDefinitions.get(rawName)
    if (!definition) throw new Error(`当前 OKX 连接不支持 ${market}/${action}`)
    const args = action === 'place' ? compactOrderArguments({
      instId,
      tdMode: input.tdMode,
      side: input.side,
      posSide: market === 'swap' ? input.posSide : undefined,
      ordType: input.ordType,
      sz: String(input.size),
      tgtCcy: input.targetCurrency,
      px: input.price == null ? undefined : String(input.price),
      reduceOnly: market === 'swap' ? input.reduceOnly : undefined,
      clOrdId: input.clientOrderId,
      tpTriggerPx: input.takeProfitTrigger,
      tpOrdPx: input.takeProfitPrice,
      slTriggerPx: input.stopLossTrigger,
      slOrdPx: input.stopLossPrice,
      clustrRiskPermit: input.riskPermit,
    }) : action === 'close' ? compactOrderArguments({
      instId,
      mgnMode: input.tdMode,
      posSide: input.posSide,
      autoCxl: input.autoCancel,
      clOrdId: input.clientOrderId,
    }) : compactOrderArguments({
      instId,
      ordId: input.orderId,
      clOrdId: input.clientOrderId,
    })
    const value = await definition.execute(args, exec)
    if (typeof value !== 'string') return value
    try { return JSON.parse(value) } catch { return { status: 'error', message: 'OKX 返回无法解析' } }
  }

  async function binanceExecutionAdapter(profile) {
    const credentials = await vault.get('binance', profile)
    if (!credentials) throw new Error('Binance 执行账户没有可用凭证')
    return new BinanceExecutionAdapter({ credentials, fetchImpl: networkFetch })
  }

  async function bybitTradingAdapter(profile) {
    const normalizedProfile = String(profile ?? 'default').toLowerCase()
    const credentials = await vault.get('bybit', normalizedProfile)
    if (!credentials) throw new Error('Bybit 执行账户没有可用凭证')
    let bridge = state.bybitBridges.get(normalizedProfile)
    if (!bridge) {
      bridge = new BybitMcpBridge({
        credentials: async () => vault.get('bybit', normalizedProfile),
        testnet: credentials.testnet === true,
      })
      state.bybitBridges.set(normalizedProfile, bridge)
    }
    return new BybitTradingAdapter({ bridge })
  }

  async function hydrateBybitOrderContext(adapter, market, instId) {
    const metadata = await adapter.instrument(market, instId)
    state.instrumentMetadata.set(instId, metadata)
    const ticker = await adapter.ticker(market, instId)
    state.lastPrices.set(instId, ticker.price)
    state.lastPriceAt.set(instId, Date.now())
    return { metadata, referencePrice: ticker.price }
  }

  async function hydrateBinanceOrderContext(adapter, market, instId, ordType) {
    const metadata = await adapter.instrument(market, instId, ordType)
    state.instrumentMetadata.set(instId, metadata)
    const ticker = await binance.ticker(instId, { marketType: market })
    const last = Number(ticker?.lastPrice ?? ticker?.price)
    if (!Number.isFinite(last) || last <= 0) throw new Error('Binance 行情价格无法确认')
    state.lastPrices.set(instId, last)
    state.lastPriceAt.set(instId, Date.now())
    return { metadata, referencePrice: last }
  }

  async function executeBinanceOrder(input = {}, exec, routed = routeOrderIntent(input, state.executionMode)) {
    const action = String(input.action ?? '').toLowerCase()
    const market = String(input.market ?? '').toLowerCase()
    const instId = compactSymbol(input.instId)
    if (!['place', 'cancel', 'close', 'status'].includes(action)) throw new Error('Binance 订单动作无效')
    if (!['spot', 'usd-m-futures'].includes(market)) throw new Error('Binance 订单市场必须是 spot 或 usd-m-futures')
    if (!instId || !/^[A-Z0-9]+$/.test(instId)) throw new Error('Binance 交易标的无效')
    if (action === 'close' && market !== 'usd-m-futures') throw new Error('Binance 整仓平仓仅适用于 U 本位永续')
    if (['cancel', 'status'].includes(action) && !input.orderId && !input.clientOrderId) throw new Error('查询或撤单必须提供 orderId 或 clientOrderId')
    if (action === 'cancel' && !input.clientOrderId) throw new Error('为保证撤单超时后可自动核对，Binance 撤单必须提供 clientOrderId')
    if (action === 'place') {
      if (!input.side || !input.ordType || !input.size) throw new Error('Binance 下单缺少 side、ordType 或 size')
      if (input.ordType !== 'market' && !input.price) throw new Error('Binance 非市价订单必须提供 price')
      if (!input.riskPermit && input.reduceOnly !== true) throw new Error('新增或扩大风险的订单缺少单次风险许可')
    }
    const adapter = await binanceExecutionAdapter(routed.profile)
    if (action === 'status') return { status: 'ok', data: await adapter.queryOrder({ market, instId, orderId: input.orderId, clientOrderId: input.clientOrderId }) }

    await refreshExecutionMode()
    routeOrderIntent({ ...input, exchange: 'binance', profile: routed.profile }, state.executionMode)
    state.activeWriteCalls += 1
    const riskIncreasing = action === 'place' && input.reduceOnly !== true
    const clientOrderId = input.clientOrderId || `clstr${randomBytes(8).toString('hex')}`
    const ledgerOrderId = `exec${randomBytes(12).toString('hex')}`
    const tape = sessionTape.start({
      sessionId: tapeSessionId(exec), callId: exec?.callId, exchange: 'binance', action, market,
      instrument: instId, side: input.side ?? input.posSide, orderType: input.ordType ?? (action === 'close' ? 'market' : null),
      size: input.size, requestedPrice: input.price, referencePrice: state.lastPrices.get(instId), clientOrderId,
    })
    const tapeStage = (value) => sessionTape.stage(tape.id, value)
    const tapeFinish = (status, label, result = {}) => sessionTape.finish(tape.id, { status, label, result })
    let lifecycleId = null
    let cancellationExisting = false
    let localReservation = 0
    let submissionStarted = false
    try {
      if (action === 'place' || action === 'close') {
        const created = await core.createOrderLifecycle({
          id: ledgerOrderId, sessionId: tapeSessionId(exec), exchange: 'binance', profile: routed.profile,
          market, instrument: instId, side: input.side ?? input.posSide, orderType: input.ordType ?? 'market',
          size: input.size, requestedPrice: input.price, referencePrice: state.lastPrices.get(instId), exchangeClientOrderId: clientOrderId,
        })
        lifecycleId = created.id
        await core.transitionOrderLifecycle(lifecycleId, { state: 'validating', reason: '正在核验 Binance 账户、行情、风险与授权' })
      } else if (action === 'cancel') {
        const tracked = await core.findOrderLifecycle({ exchangeClientOrderId: input.clientOrderId, exchangeOrderId: input.orderId })
        if (tracked) {
          lifecycleId = tracked.id
          cancellationExisting = true
        } else {
          const created = await core.createOrderLifecycle({
            id: ledgerOrderId, sessionId: tapeSessionId(exec), exchange: 'binance', profile: routed.profile,
            market, instrument: instId, side: input.side, orderType: 'cancel', size: input.size,
            exchangeClientOrderId: input.clientOrderId,
          })
          lifecycleId = created.id
          await core.transitionOrderLifecycle(lifecycleId, { state: 'validating', reason: '正在核验 Binance 撤单目标、账户与授权' })
        }
      }

      const clock = await adapter.syncTime(market)
      const accountOverview = await verifyExecutionAccount('binance', routed.profile, { timestampOffsetMs: clock.offsetMs })
      const spotScope = accountOverview.scopes?.find((item) => item.scope === 'spot')
      if (spotScope?.status !== 'ready') throw new Error('Binance API 权限基线无法确认；为防止遗漏提现权限，执行保持关闭')
      if (market === 'spot' && accountOverview.security?.marketPermissions?.spotCanTrade !== true) throw new Error('Binance API Key 没有现货交易权限')
      if (market === 'usd-m-futures' && accountOverview.security?.marketPermissions?.futuresCanTrade !== true) throw new Error('Binance API Key 没有 U 本位合约交易权限')
      let leverage = null
      if (action === 'place') {
        const hydrated = await hydrateBinanceOrderContext(adapter, market, instId, input.ordType)
        if (market === 'usd-m-futures') {
          const rows = await adapter.positionRisk(instId)
          const target = rows.find((row) => ['BOTH', String(input.posSide ?? '').toUpperCase()].includes(String(row.positionSide ?? 'BOTH').toUpperCase())) ?? rows[0]
          leverage = Number(target?.leverage)
        }
        tapeStage({ name: 'account-verified', label: 'Binance 账户与行情已核验', status: 'ok', details: { referencePrice: hydrated.referencePrice } })
      } else {
        tapeStage({ name: 'account-verified', label: 'Binance 账户与指令目标已核验', status: 'ok' })
      }
      const gate = await core.executionGate()
      if (!gate.ok) throw new Error(gate.reason)
      const autonomy = await core.autonomyStatus()
      if (input.targetCurrency && input.targetCurrency !== 'base_ccy') throw new Error('Binance 当前执行只接受以基础币计量的 quantity，拒绝隐式换算')
      const riskArgs = { instId, side: input.side, sz: input.size, px: input.price, ordType: input.ordType, reduceOnly: input.reduceOnly, lever: leverage }
      const riskToolName = action === 'close' ? 'binance_close_position' : `binance_${action}_order`
      const verdict = checkWrite({ toolName: riskToolName, args: riskArgs, config: { ...cfg, readOnly: state.executionMode.readOnly }, state, autonomy })
      if (!verdict.ok) throw new Error(verdict.reason)
      const scope = await core.validateAutonomy({ exchange: 'binance', instId })
      if (!scope.ok) throw new Error(scope.reason)
      if (riskIncreasing) {
        const permit = await core.validateRiskPermit(String(input.riskPermit ?? ''), { exchange: 'binance', instId, notionalUsdt: verdict.notional, side: input.side })
        if (!permit.ok) throw new Error(permit.reason)
      }
      tapeStage({ name: 'risk-passed', label: '风控与授权通过', status: 'ok', details: { notionalUsdt: verdict.notional, referencePrice: state.lastPrices.get(instId) } })
      if (!approval || !exec?.agent) throw new Error('缺少逐笔审批上下文，写操作被拒绝')
      if (lifecycleId && (action !== 'cancel' || !cancellationExisting)) await core.transitionOrderLifecycle(lifecycleId, { state: 'awaiting-approval', reason: '等待用户逐笔确认', source: 'approval' })
      const approvalStartedAt = Date.now()
      tapeStage({ name: 'approval-requested', label: '等待用户逐笔审批', status: 'pending' })
      const outcome = await approval.request({
        agent: exec.agent, toolName: 'clustr_order', callId: exec?.callId,
        reason: `Binance/${routed.profile} ${action}：${instId} ${input.side ?? input.posSide ?? ''} ${input.size ?? '整仓'} ${input.ordType ?? 'market'}；名义约 ${verdict.notional != null ? verdict.notional.toFixed(2) : '风险降低操作'} USDT。`,
        signal: exec?.signal,
      })
      tapeStage({ name: 'approval-resolved', label: outcome === 'allowed-once' ? '用户已批准' : '用户未批准', status: outcome === 'allowed-once' ? 'ok' : 'denied', latencyMs: Date.now() - approvalStartedAt, metric: 'approval', details: { approval: String(outcome) } })
      if (outcome !== 'allowed-once') {
        if (lifecycleId) await core.transitionOrderLifecycle(lifecycleId, { state: 'denied', reason: `逐笔审批结果：${String(outcome)}`, source: 'approval' }).catch(() => {})
        tapeFinish('denied', '逐笔审批未通过', { approval: String(outcome) })
        return { status: 'denied', outcome: String(outcome), message: '审批未通过，订单未执行。' }
      }
      if (lifecycleId) await core.transitionOrderLifecycle(lifecycleId, { state: action === 'cancel' && cancellationExisting ? 'cancel-pending' : 'approved', reason: '用户已批准本次 Binance 指令', source: 'approval' }).catch(() => {})
      if (riskIncreasing && verdict.notional != null) {
        await core.reserveExecutionBudget({ clientOrderId: ledgerOrderId, exchangeClientOrderId: clientOrderId, exchange: 'binance', instId, market, notionalUsdt: verdict.notional, maxDailyNotionalUsdt: cfg.risk.maxDailyNotionalUsdt ?? 50000 })
        localReservation = verdict.notional
        await core.consumeExecutionAuthorization({ permitId: input.riskPermit, exchange: 'binance', instId, notionalUsdt: verdict.notional, side: input.side })
      } else {
        await core.consumeAutonomyOrder({ exchange: 'binance', instId })
      }

      if (lifecycleId && (action !== 'cancel' || !cancellationExisting)) await core.transitionOrderLifecycle(lifecycleId, { state: 'submitting', reason: '订单正在发送至 Binance', source: 'execution' })
      submissionStarted = true
      const exchangeStartedAt = Date.now()
      tapeStage({ name: 'submitted', label: '已提交至 Binance', status: 'pending', details: { referencePrice: state.lastPrices.get(instId), exchangeClientOrderId: clientOrderId } })
      const data = action === 'place'
        ? await adapter.placeOrder({ ...input, market, instId, clientOrderId })
        : action === 'cancel'
          ? await adapter.cancelOrder({ market, instId, orderId: input.orderId, clientOrderId: input.clientOrderId })
          : await adapter.closePosition({ ...input, market, instId, clientOrderId })
      const facts = {
        exchangeOrderId: data.orderId, exchangeClientOrderId: data.clientOrderId || clientOrderId,
        exchangeState: data.status, fillPrice: data.averageFillPrice, filledSize: data.filledSize,
      }
      tapeStage({ name: 'exchange-acknowledged', label: 'Binance 已响应', status: 'ok', latencyMs: Date.now() - exchangeStartedAt, metric: 'exchange-ack', details: facts })
      if (localReservation > 0) {
        await core.resolveExecutionBudget(ledgerOrderId, { exchangeState: data.status, countNotional: true })
        localReservation = 0
      }
      if (lifecycleId) await core.transitionOrderLifecycle(lifecycleId, {
        state: lifecycleStateFromExchange(data.status, data.filledSize, input.size), exchangeState: data.status,
        exchangeOrderId: data.orderId, filledSize: data.filledSize, fillPrice: data.averageFillPrice,
        source: 'exchange', reason: data.averageFillPrice ? 'Binance 返回可核验成交结果' : 'Binance 已接受交易指令',
      }).catch(() => {})
      auditAppend({ ts: Date.now(), tool: 'clustr_order_binance', args: { exchange: 'binance', profile: routed.profile, action, market, instId, side: input.side, size: input.size, clientOrderId }, status: 'ok' })
      tapeFinish('ok', data.averageFillPrice ? '成交结果已核验' : 'Binance 已接受，等待成交数据', { ...facts, referencePrice: state.lastPrices.get(instId) })
      return { status: 'ok', data }
    } catch (error) {
      const message = String(error?.message ?? error)
      const outcomeUnknown = error instanceof BinanceExecutionError ? error.outcomeUnknown : submissionStarted && /timeout|disconnect|connection|econn|unknown/i.test(message)
      if (outcomeUnknown) {
        if (localReservation > 0) { await core.markExecutionUnknown(ledgerOrderId).catch(() => {}); localReservation = 0 }
        if (lifecycleId) await core.transitionOrderLifecycle(lifecycleId, { state: 'unknown', reason: 'Binance 提交结果未知，系统将自动核对', source: 'execution' }).catch(() => {})
        auditAppend({ ts: Date.now(), tool: 'clustr_order_binance', args: { exchange: 'binance', action, market, instId, clientOrderId }, status: 'unknown', reason: '提交结果未知，必须按 clientOrderId 查询确认' })
        tapeFinish('unknown', '订单状态待核对', { reason: '提交结果未知，禁止盲目重试', referencePrice: state.lastPrices.get(instId), exchangeClientOrderId: clientOrderId })
        return { status: 'unknown', state: 'reconciling', clientOrderId, message: 'Binance 订单提交结果未知。系统将按 clientOrderId 核对，禁止重复下单。' }
      }
      if (localReservation > 0) await core.releaseExecutionBudget(ledgerOrderId, message).catch(() => {})
      if (lifecycleId) await core.transitionOrderLifecycle(lifecycleId, { state: action === 'cancel' && cancellationExisting ? 'open' : submissionStarted ? 'rejected' : 'failed', reason: message, source: submissionStarted ? 'exchange' : 'clustr' }).catch(() => {})
      auditAppend({ ts: Date.now(), tool: 'clustr_order_binance', args: { exchange: 'binance', action, market, instId, clientOrderId }, status: 'error', reason: message })
      tapeFinish('error', 'Binance 交易指令未完成', { reason: message, referencePrice: state.lastPrices.get(instId), exchangeClientOrderId: clientOrderId })
      return { status: 'error', message }
    } finally {
      state.activeWriteCalls = Math.max(0, state.activeWriteCalls - 1)
    }
  }

  async function executeBybitOrder(input = {}, exec, routed = routeOrderIntent(input, state.executionMode)) {
    const action = String(input.action ?? '').toLowerCase()
    const market = String(input.market ?? '').toLowerCase()
    const instId = compactSymbol(input.instId)
    if (!['place', 'cancel', 'close', 'status'].includes(action)) throw new Error('Bybit 订单动作无效')
    if (!['spot', 'linear', 'inverse'].includes(market)) throw new Error('Bybit 订单市场必须是 spot、linear 或 inverse')
    if (!instId || !/^[A-Z0-9]+$/.test(instId)) throw new Error('Bybit 交易标的无效')
    if (action === 'close' && market === 'spot') throw new Error('Bybit 整仓平仓仅适用于 linear 或 inverse')
    if (['cancel', 'status'].includes(action) && !input.orderId && !input.clientOrderId) throw new Error('查询或撤单必须提供 orderId 或 clientOrderId')
    if (action === 'cancel' && !input.clientOrderId) throw new Error('为保证撤单超时后可自动核对，Bybit 撤单必须提供 clientOrderId')
    if (action === 'place') {
      if (!input.side || !input.ordType || !input.size) throw new Error('Bybit 下单缺少 side、ordType 或 size')
      if (input.ordType !== 'market' && !input.price) throw new Error('Bybit 非市价订单必须提供 price')
      if (!input.riskPermit && input.reduceOnly !== true) throw new Error('新增或扩大风险的订单缺少单次风险许可')
    }
    if (input.targetCurrency && input.targetCurrency !== 'base_ccy') throw new Error('Bybit 当前执行只接受以基础币或合约张数计量的 quantity，拒绝隐式换算')
    const adapter = await bybitTradingAdapter(routed.profile)
    if (action === 'status') {
      const data = await adapter.queryOrder({ market, instId, orderId: input.orderId, clientOrderId: input.clientOrderId })
      return data ? { status: 'ok', data } : { status: 'unknown', state: 'reconciling', message: 'Bybit 暂未返回匹配订单。' }
    }

    await refreshExecutionMode()
    routeOrderIntent({ ...input, exchange: 'bybit', profile: routed.profile }, state.executionMode)
    state.activeWriteCalls += 1
    const riskIncreasing = action === 'place' && input.reduceOnly !== true
    const stableClientOrderId = input.clientOrderId || `clstr${randomBytes(8).toString('hex')}`
    const ledgerOrderId = `exec${randomBytes(12).toString('hex')}`
    const tape = sessionTape.start({
      sessionId: tapeSessionId(exec), callId: exec?.callId, exchange: 'bybit', action, market,
      instrument: instId, side: input.side ?? input.posSide, orderType: input.ordType ?? (action === 'close' ? 'market' : null),
      size: input.size, requestedPrice: input.price, referencePrice: state.lastPrices.get(instId), clientOrderId: stableClientOrderId,
    })
    const tapeStage = (value) => sessionTape.stage(tape.id, value)
    const tapeFinish = (status, label, result = {}) => sessionTape.finish(tape.id, { status, label, result })
    let lifecycleId = null
    let cancellationExisting = false
    let localReservation = 0
    let submissionStarted = false
    try {
      if (action === 'place' || action === 'close') {
        const created = await core.createOrderLifecycle({
          id: ledgerOrderId, sessionId: tapeSessionId(exec), exchange: 'bybit', profile: routed.profile,
          market, instrument: instId, side: input.side ?? input.posSide, orderType: input.ordType ?? 'market',
          size: input.size, requestedPrice: input.price, referencePrice: state.lastPrices.get(instId), exchangeClientOrderId: stableClientOrderId,
        })
        lifecycleId = created.id
        await core.transitionOrderLifecycle(lifecycleId, { state: 'validating', reason: '正在核验 Bybit 账户、官方 MCP、行情、风险与授权' })
      } else {
        const tracked = await core.findOrderLifecycle({ exchangeClientOrderId: input.clientOrderId, exchangeOrderId: input.orderId })
        if (tracked) { lifecycleId = tracked.id; cancellationExisting = true }
        else {
          const created = await core.createOrderLifecycle({
            id: ledgerOrderId, sessionId: tapeSessionId(exec), exchange: 'bybit', profile: routed.profile,
            market, instrument: instId, side: input.side, orderType: 'cancel', size: input.size,
            exchangeClientOrderId: input.clientOrderId,
          })
          lifecycleId = created.id
          await core.transitionOrderLifecycle(lifecycleId, { state: 'validating', reason: '正在核验 Bybit 撤单目标、账户与授权' })
        }
      }

      const accountOverview = await verifyExecutionAccount('bybit', routed.profile)
      await adapter.verifyApiKey()
      let leverage = null
      if (action === 'place') {
        const hydrated = await hydrateBybitOrderContext(adapter, market, instId)
        if (market !== 'spot') {
          const position = (accountOverview.positions ?? []).find((row) => compactSymbol(row.symbol) === instId && (!input.posSide || String(row.side) === String(input.posSide)))
          leverage = Number(position?.leverage)
          if (market === 'linear') {
            await adapter.preCheckOrder({ ...input, market, instId, clientOrderId: stableClientOrderId })
            tapeStage({ name: 'exchange-precheck', label: 'Bybit 官方订单预检查通过', status: 'ok' })
          }
        }
        tapeStage({ name: 'account-verified', label: 'Bybit 账户、官方 MCP 与行情已核验', status: 'ok', details: { referencePrice: hydrated.referencePrice } })
      } else {
        tapeStage({ name: 'account-verified', label: 'Bybit 账户、官方 MCP 与指令目标已核验', status: 'ok' })
      }

      const gate = await core.executionGate()
      if (!gate.ok) throw new Error(gate.reason)
      const autonomy = await core.autonomyStatus()
      const riskArgs = { instId, side: input.side, sz: input.size, px: input.price, ordType: input.ordType, reduceOnly: input.reduceOnly, lever: leverage }
      const riskToolName = action === 'close' ? 'bybit_close_position' : `bybit_${action}_order`
      const verdict = checkWrite({ toolName: riskToolName, args: riskArgs, config: { ...cfg, readOnly: state.executionMode.readOnly }, state, autonomy })
      if (!verdict.ok) throw new Error(verdict.reason)
      const scope = await core.validateAutonomy({ exchange: 'bybit', instId })
      if (!scope.ok) throw new Error(scope.reason)
      if (riskIncreasing) {
        const permit = await core.validateRiskPermit(String(input.riskPermit ?? ''), { exchange: 'bybit', instId, notionalUsdt: verdict.notional, side: input.side })
        if (!permit.ok) throw new Error(permit.reason)
      }
      tapeStage({ name: 'risk-passed', label: '风控与授权通过', status: 'ok', details: { notionalUsdt: verdict.notional, referencePrice: state.lastPrices.get(instId) } })
      if (!approval || !exec?.agent) throw new Error('缺少逐笔审批上下文，写操作被拒绝')
      if (lifecycleId && (action !== 'cancel' || !cancellationExisting)) await core.transitionOrderLifecycle(lifecycleId, { state: 'awaiting-approval', reason: '等待用户逐笔确认', source: 'approval' })
      const approvalStartedAt = Date.now()
      tapeStage({ name: 'approval-requested', label: '等待用户逐笔审批', status: 'pending' })
      const outcome = await approval.request({
        agent: exec.agent, toolName: 'clustr_order', callId: exec?.callId,
        reason: `Bybit/${routed.profile} ${action}：${instId} ${input.side ?? input.posSide ?? ''} ${input.size ?? '整仓'} ${input.ordType ?? 'market'}；名义约 ${verdict.notional != null ? verdict.notional.toFixed(2) : '风险降低操作'} USDT。`,
        signal: exec?.signal,
      })
      tapeStage({ name: 'approval-resolved', label: outcome === 'allowed-once' ? '用户已批准' : '用户未批准', status: outcome === 'allowed-once' ? 'ok' : 'denied', latencyMs: Date.now() - approvalStartedAt, metric: 'approval', details: { approval: String(outcome) } })
      if (outcome !== 'allowed-once') {
        if (lifecycleId) await core.transitionOrderLifecycle(lifecycleId, { state: 'denied', reason: `逐笔审批结果：${String(outcome)}`, source: 'approval' }).catch(() => {})
        tapeFinish('denied', '逐笔审批未通过', { approval: String(outcome) })
        return { status: 'denied', outcome: String(outcome), message: '审批未通过，订单未执行。' }
      }
      if (lifecycleId) await core.transitionOrderLifecycle(lifecycleId, { state: action === 'cancel' && cancellationExisting ? 'cancel-pending' : 'approved', reason: '用户已批准本次 Bybit 指令', source: 'approval' }).catch(() => {})
      if (riskIncreasing && verdict.notional != null) {
        await core.reserveExecutionBudget({ clientOrderId: ledgerOrderId, exchangeClientOrderId: stableClientOrderId, exchange: 'bybit', instId, market, notionalUsdt: verdict.notional, maxDailyNotionalUsdt: cfg.risk.maxDailyNotionalUsdt ?? 50000 })
        localReservation = verdict.notional
        await core.consumeExecutionAuthorization({ permitId: input.riskPermit, exchange: 'bybit', instId, notionalUsdt: verdict.notional, side: input.side })
      } else {
        await core.consumeAutonomyOrder({ exchange: 'bybit', instId })
      }

      if (lifecycleId && (action !== 'cancel' || !cancellationExisting)) await core.transitionOrderLifecycle(lifecycleId, { state: 'submitting', reason: '订单正在通过官方 MCP 发送至 Bybit', source: 'execution' })
      submissionStarted = true
      const exchangeStartedAt = Date.now()
      tapeStage({ name: 'submitted', label: '已通过官方 Trading MCP 提交至 Bybit', status: 'pending', details: { referencePrice: state.lastPrices.get(instId), exchangeClientOrderId: stableClientOrderId } })
      let data = action === 'place'
        ? await adapter.placeOrder({ ...input, market, instId, clientOrderId: stableClientOrderId })
        : action === 'cancel'
          ? await adapter.cancelOrder({ market, instId, orderId: input.orderId, clientOrderId: input.clientOrderId })
          : await adapter.closePosition({ ...input, market, instId, clientOrderId: stableClientOrderId })
      const confirmed = await adapter.queryOrder({ market, instId, orderId: data.orderId, clientOrderId: data.clientOrderId || stableClientOrderId }).catch(() => null)
      if (confirmed) data = confirmed
      const facts = { exchangeOrderId: data.orderId, exchangeClientOrderId: data.clientOrderId || stableClientOrderId, exchangeState: data.status, fillPrice: data.averageFillPrice, filledSize: data.filledSize }
      tapeStage({ name: 'exchange-acknowledged', label: confirmed ? 'Bybit 订单状态已核验' : 'Bybit 已受理，等待状态核对', status: 'ok', latencyMs: Date.now() - exchangeStartedAt, metric: 'exchange-ack', details: facts })
      if (localReservation > 0) { await core.resolveExecutionBudget(ledgerOrderId, { exchangeState: data.status, countNotional: true }); localReservation = 0 }
      if (lifecycleId) await core.transitionOrderLifecycle(lifecycleId, {
        state: lifecycleStateFromExchange(data.status, data.filledSize, input.size), exchangeState: data.status,
        exchangeOrderId: data.orderId, filledSize: data.filledSize, fillPrice: data.averageFillPrice,
        source: confirmed ? 'exchange-reconciliation' : 'exchange', reason: confirmed ? 'Bybit 订单状态已核验' : 'Bybit 官方 MCP 已返回受理结果',
      }).catch(() => {})
      auditAppend({ ts: Date.now(), tool: 'clustr_order_bybit', args: { exchange: 'bybit', profile: routed.profile, action, market, instId, side: input.side, size: input.size, clientOrderId: stableClientOrderId }, status: 'ok' })
      tapeFinish('ok', data.averageFillPrice ? '成交结果已核验' : confirmed ? '订单状态已核验' : 'Bybit 已接受，等待成交数据', { ...facts, referencePrice: state.lastPrices.get(instId) })
      return { status: 'ok', data }
    } catch (error) {
      const message = String(error?.message ?? error)
      const outcomeUnknown = submissionStarted && ((error instanceof BybitMcpError && error.outcomeUnknown) || /timeout|disconnect|connection|exited|unknown/i.test(message))
      if (outcomeUnknown) {
        if (localReservation > 0) { await core.markExecutionUnknown(ledgerOrderId).catch(() => {}); localReservation = 0 }
        if (lifecycleId) await core.transitionOrderLifecycle(lifecycleId, { state: 'unknown', reason: 'Bybit 提交结果未知，系统将自动核对', source: 'execution' }).catch(() => {})
        auditAppend({ ts: Date.now(), tool: 'clustr_order_bybit', args: { exchange: 'bybit', action, market, instId, clientOrderId: stableClientOrderId }, status: 'unknown', reason: '提交结果未知，必须按 clientOrderId 查询确认' })
        tapeFinish('unknown', '订单状态待核对', { reason: '提交结果未知，禁止盲目重试', referencePrice: state.lastPrices.get(instId), exchangeClientOrderId: stableClientOrderId })
        return { status: 'unknown', state: 'reconciling', clientOrderId: stableClientOrderId, message: 'Bybit 订单提交结果未知。系统将按 clientOrderId 核对，禁止重复下单。' }
      }
      if (localReservation > 0) await core.releaseExecutionBudget(ledgerOrderId, message).catch(() => {})
      if (lifecycleId) await core.transitionOrderLifecycle(lifecycleId, { state: action === 'cancel' && cancellationExisting ? 'open' : submissionStarted ? 'rejected' : 'failed', reason: message, source: submissionStarted ? 'exchange' : 'clustr' }).catch(() => {})
      auditAppend({ ts: Date.now(), tool: 'clustr_order_bybit', args: { exchange: 'bybit', action, market, instId, clientOrderId: stableClientOrderId }, status: 'error', reason: message })
      tapeFinish('error', 'Bybit 交易指令未完成', { reason: message, referencePrice: state.lastPrices.get(instId), exchangeClientOrderId: stableClientOrderId })
      return { status: 'error', message }
    } finally {
      state.activeWriteCalls = Math.max(0, state.activeWriteCalls - 1)
    }
  }

  async function executeOrder(input = {}, exec) {
    await refreshExecutionMode()
    const routed = routeOrderIntent(input, String(input.action ?? '').toLowerCase() === 'status' ? { ...state.executionMode, readOnly: true } : state.executionMode)
    if (routed.exchange === 'binance') return executeBinanceOrder(input, exec, routed)
    if (routed.exchange === 'bybit') return executeBybitOrder(input, exec, routed)
    return executeOkxOrder({ ...input, profile: routed.profile }, exec)
  }

  async function traderSession(input = {}) {
    if (!sessionQuery) throw new Error('会话查询服务不可用')
    if (input?.sessionId != null && String(input.sessionId)) {
      return inspectCurrentSession(sessionQuery, sessionBinding, input.sessionId)
    }
    return inspectBoundSession(sessionQuery, sessionBinding)
  }

  async function sessionTapeView(input = {}) {
    const sessionId = String(input.sessionId ?? '')
    if (!sessionId) throw new Error('缺少当前会话编号')
    const access = await traderSession({ sessionId })
    if (access?.eligible !== true || String(access?.sessionId ?? '') !== sessionId) throw new Error('当前会话没有 Session Tape 访问权限')
    return sessionTape.list({ sessionId, limit: input.limit })
  }

  async function tradingWorkspace(input = {}) {
    const sessionId = String(input.sessionId ?? '')
    if (!sessionId) throw new Error('缺少当前会话编号')
    const access = await traderSession({ sessionId })
    if (access?.eligible !== true || String(access?.sessionId ?? '') !== sessionId) throw new Error('当前会话没有交易工作台访问权限')
    const [overview, trackedOrders, ledger] = await Promise.all([
      readAccountsOverview(),
      core.listOrderLifecycles({ sessionId, limit: 200 }),
      core.executionLedgerStatus(),
    ])
    return buildTradingWorkspace({ accounts: overview.accounts, trackedOrders, ledger, at: Date.now() })
  }

  async function reconcileTradingOrders(input = {}) {
    const sessionId = String(input.sessionId ?? '')
    if (!sessionId) throw new Error('缺少当前会话编号')
    const access = await traderSession({ sessionId })
    if (access?.eligible !== true || String(access?.sessionId ?? '') !== sessionId) throw new Error('当前会话没有订单核对权限')
    const reconciliation = await reconcileUnknownOrders({ force: true })
    return { ...(await tradingWorkspace({ sessionId })), reconciliation }
  }

  async function traderSessionModes(input = {}) {
    if (!sessionQuery) throw new Error('会话查询服务不可用')
    return inspectSessionModes(sessionQuery, input.sessionIds)
  }

  async function bindTraderSession(input = {}) {
    if (!sessionQuery) throw new Error('会话查询服务不可用')
    return bindTradingSession(sessionQuery, sessionBinding, input.sessionId, { replace: input.replace === true })
  }

  async function unbindTraderSession(input = {}) {
    return unbindTradingSession(sessionBinding, input.sessionId || null)
  }

  function executionScope(input = {}) {
    const requested = Array.isArray(input.instruments) ? input.instruments : cfg.watchlist
    const instruments = [...new Set(requested.map((item) => String(item ?? '').trim().toUpperCase()).filter(Boolean))]
    if (instruments.length === 0 || instruments.length > 30 || instruments.some((item) => item.length > 64 || !/^[A-Z0-9._:-]+$/.test(item))) {
      throw new Error('逐笔审批交易必须限定 1–30 个有效交易标的')
    }
    const maxOrders = Number(input.maxOrders ?? 1)
    if (!Number.isInteger(maxOrders) || maxOrders < 1 || maxOrders > 20) throw new Error('逐笔审批交易次数必须在 1–20 之间')
    const hardRiskLimit = Number(cfg.risk.maxRiskPerTradePercent ?? 1)
    const maxRiskPercent = Number(input.maxRiskPercent ?? Math.min(1, hardRiskLimit))
    if (!Number.isFinite(maxRiskPercent) || maxRiskPercent <= 0 || maxRiskPercent > hardRiskLimit) {
      throw new Error(`单笔风险上限必须大于 0 且不超过系统上限 ${hardRiskLimit}%`)
    }
    return { instruments, maxOrders, maxRiskPercent }
  }

  async function setExecutionMode(input = {}) {
    if (input.confirmed !== true) throw new Error('执行模式变更需要明确确认')
    const readOnly = input.readOnly !== false
    if (readOnly) {
      const mode = await executionPolicy.set({ readOnly: true, confirmed: true, actor: input.actor ?? 'user', reason: input.reason ?? '用户恢复只读保护' })
      state.executionMode = { ...mode, state: 'ready' }
      await core.applyExecutionMode({ readOnly: true, actor: input.actor ?? 'user', reason: mode.reason })
      if (state.activeWriteCalls === 0) await reloadOkxTools()
      else state.pendingReadOnlyBridgeReload = true
      auditAppend({ ts: Date.now(), tool: 'clustr_execution_mode', status: 'ok', reason: '只读保护已开启；执行许可已撤销，自主权已降为观察' })
      await refreshPromptSnapshot({ refreshAccounts: true })
      return { ok: true, executionMode: state.executionMode, autonomy: await core.autonomyStatus(), message: '只读保护已开启；新的写操作会被立即拒绝。' }
    }

    const requestedExchange = String(input.exchange ?? '').toLowerCase()
    const requestedProfile = String(input.profile ?? (requestedExchange === 'okx' ? cfg.okxProfile : 'default')).toLowerCase()
    if (!['okx', 'binance', 'bybit'].includes(requestedExchange)) throw new Error('当前逐笔审批交易支持 OKX、Binance 与 Bybit')
    if (requestedExchange === 'okx' && requestedProfile !== String(cfg.okxProfile).toLowerCase()) throw new Error('OKX 执行账户必须使用当前配置的账户名称')
    const current = await refreshExecutionMode()
    if (!current.allowUnlock) throw new Error(current.reason || '此安装不允许解除只读保护')
    if ((await core.killSwitchStatus()).active) throw new Error('紧急停止处于启用状态；请先明确恢复写操作资格')
    if (requestedExchange === 'binance') {
      const adapter = await binanceExecutionAdapter(requestedProfile)
      const clock = await adapter.syncTime('spot')
      await verifyExecutionAccount(requestedExchange, requestedProfile, { timestampOffsetMs: clock.offsetMs })
    } else if (requestedExchange === 'bybit') {
      const adapter = await bybitTradingAdapter(requestedProfile)
      await verifyExecutionAccount(requestedExchange, requestedProfile)
      await adapter.verifyApiKey()
    } else {
      await verifyExecutionAccount(requestedExchange, requestedProfile)
    }
    const scope = executionScope(input)
    let unlocked = false
    try {
      const mode = await executionPolicy.set({
        readOnly: false,
        confirmed: true,
        durationMinutes: input.durationMinutes ?? 60,
        actor: input.actor ?? 'user',
        reason: input.reason ?? '用户明确启用逐笔审批交易',
        exchange: requestedExchange,
        profile: requestedProfile,
      })
      unlocked = true
      state.executionMode = { ...mode, state: 'ready' }
      core.syncReadOnly(false)
      const autonomy = await core.setAutonomy({ id: 'approve', scope: { exchanges: [requestedExchange], instruments: scope.instruments, expiresAt: mode.expiresAt, maxOrders: scope.maxOrders, maxRiskPercent: scope.maxRiskPercent } })
      if (requestedExchange === 'okx' && state.writeTools.length === 0) await reloadOkxTools()
      if (requestedExchange === 'okx' && state.writeTools.length === 0) throw new Error('OKX 执行工具没有成功加载，系统已经恢复只读保护')
      await core.applyExecutionMode({ readOnly: false, actor: input.actor ?? 'user', reason: mode.reason })
      auditAppend({ ts: Date.now(), tool: 'clustr_execution_mode', status: 'ok', reason: `${requestedExchange.toUpperCase()}/${requestedProfile} 已启用逐笔审批交易，${scope.maxOrders} 笔，至 ${mode.expiresAt}` })
      await refreshPromptSnapshot({ refreshAccounts: true })
      return { ok: true, executionMode: state.executionMode, autonomy, writeToolCount: requestedExchange === 'okx' ? state.writeTools.length : 1, message: `${requestedExchange === 'okx' ? 'OKX' : requestedExchange === 'binance' ? 'Binance' : 'Bybit'} ${requestedProfile} 已启用逐笔审批交易；每笔订单仍需通过风险许可和 Harness 单次审批。` }
    } catch (error) {
      if (unlocked) {
        const locked = await executionPolicy.set({ readOnly: true, confirmed: true, actor: 'system', reason: '执行能力初始化失败，自动恢复只读保护' }).catch(() => null)
        state.executionMode = locked ? { ...locked, state: 'ready' } : { readOnly: true, mode: 'read-only', allowUnlock: false, state: 'error', expiresAt: null, reason: '无法确认只读保护持久化状态' }
        await core.applyExecutionMode({ readOnly: true, actor: 'system', reason: state.executionMode.reason }).catch(() => { core.syncReadOnly(true) })
      }
      throw error
    }
  }

  const api = {
    status: async () => {
      const executionMode = await refreshExecutionMode()
      const executionLedger = await core.executionLedgerStatus()
      return {
      ok: true,
      profile: cfg.okxProfile,
      readOnly: executionMode.readOnly,
      executionMode,
      risk: cfg.risk,
      modules: cfg.modules,
      watchlist: cfg.watchlist,
      bridge: state.bridge?.health ?? 'stopped',
      bridgeError: state.bridge?.lastError ?? null,
      toolCount: state.toolCount,
      writeTools: state.writeTools,
      blockedTools: state.blockedTools,
      tickersAt: state.tickersAt,
      tickerPoll: state.tickerPollStatus,
      accountPoll: state.accountPollStatus,
      dailyNotional: executionLedger.dailyNotionalUsdt,
      reservedNotional: executionLedger.reservedNotionalUsdt,
      unknownOrders: executionLedger.unknownOrders,
      analysisRequests: state.analysisRequests,
      product: 'Clustr Trading Console',
      version: CLUSTR_VERSION,
      csrfToken,
      vaultBackend: vault.backend,
      vault: vault.diagnostics(),
      network: network.status(),
      exchanges: accountProviders({ readOnly: executionMode.readOnly, executionExchange: executionMode.exchange, executionProfile: executionMode.profile }),
      marketSources: [
        { id: 'okx', status: state.bridge?.health ?? 'unknown', marketData: state.bridge?.health === 'ready' },
        publicHealth(binance),
        publicHealth(bybit),
        publicHealth(hyperliquid),
      ],
      killSwitch: await core.killSwitchStatus(),
      }
    },
    tickers: async () => {
      if (state.tickers.length === 0) await pollTickers()
      return { tickers: state.tickers, at: state.tickersAt }
    },
    klines,
    account: async () => {
      if (!state.accountCache) await pollAccount()
      return state.accountCache ?? { balance: null, positions: null, at: 0 }
    },
    audit: () => ({ entries: auditEntries(), persistence: auditStatus() }),
    sessionTape: sessionTapeView,
    tradingWorkspace,
    reconcileTradingOrders,
    traderSession,
    traderSessionModes,
    bindTraderSession,
    unbindTraderSession,
    analysisCatalog,
    marketAnalysis,
    wyckoff,
    publicTicker,
    publicKlines,
    publicBook,
    searchInstruments,
    marketConsensus,
    accountsOverview: readAccountsOverview,
    contextSnapshot,
    getSessionContext: ({ sessionId }) => ({ sessionId: String(sessionId ?? ''), context: sessionContext(sessionId) }),
    setSessionContext,
    coreStatus: () => core.status(),
    listTheses: (input) => core.listTheses(input),
    createThesis: (input) => core.createThesis(input),
    transitionThesis: ({ thesisId, ...input }) => core.transitionThesis(String(thesisId ?? ''), input),
    addThesisEvidence: ({ thesisId, ...input }) => core.addThesisEvidence(String(thesisId ?? ''), input),
    decisionRoom: ({ thesisId, ...input }) => core.decisionRoom(String(thesisId ?? ''), input),
    createShadow: ({ thesisId, ...input }) => core.createShadow(String(thesisId ?? ''), input),
    startReplay,
    advanceReplay: ({ replayId, bars }) => core.advanceReplay(String(replayId ?? ''), bars),
    evaluateRisk: (input) => core.recordRiskEvaluation(input),
    autonomyStatus: () => core.autonomyStatus(),
    setAutonomy: async (input) => {
      const result = await core.setAutonomy(input)
      await refreshPromptSnapshot()
      return result
    },
    setExecutionMode,
    killSwitchStatus: () => core.killSwitchStatus(),
    setKillSwitch: async (input) => {
      const result = await core.setKillSwitch(input)
      await refreshPromptSnapshot()
      return result
    },
    networkEgress: () => network.egressIp(),
    recordMemory: (input) => core.recordMemory(input),
    memoryReview: (input) => core.memoryReview(input),
    provenance: (input) => core.provenance(input),
    verifyCsrf: (token) => token.length > 0 && token === csrfToken,
    exchanges: async () => { await refreshExecutionMode(); const accounts = await vault.status(defaultAccountRefs()); return { vaultBackend: vault.backend, vault: vault.diagnostics(), network: network.status(), accounts, providers: accountProviders(capabilityOptions()) } },
    verifyCredentials: async ({ exchange, profile, credentials }) => {
      const id = String(exchange ?? '').trim().toLowerCase()
      const accountProfile = String(profile ?? '').trim().toLowerCase()
      const provider = accountProviders({ readOnly: true }).find((item) => item.id === id)
      if (!provider) throw new Error('该交易所不受支持')
      if (provider.availability === 'unavailable') {
        const error = new Error(`${provider.name} 账户连接未开放`)
        error.code = 'ACCOUNT_CONNECTION_UNAVAILABLE'
        throw error
      }
      const normalized = vault.validate(id, credentials)
      const overview = await readExchangeAccount(id, normalized, { demo: id === 'okx' && accountProfile === 'demo', fetchImpl: networkFetch })
      const readable = overview.readStatus === 'ready' || overview.readStatus === 'partial'
      if (!readable) {
        const reason = overview.errors?.[0]?.reason ?? '账户验证失败'
        const error = new Error(`${reason}。凭证尚未保存。`)
        error.code = 'ACCOUNT_VERIFICATION_FAILED'
        throw error
      }
      if (overview.security?.highRisk) {
        const error = new Error(`${overview.security.highRiskReason ?? 'API Key 权限过高'}。请创建仅含读取权限，或“读取 + 交易”权限的新 Key；不得启用提现或划转。凭证尚未保存。`)
        error.code = 'UNSAFE_API_PERMISSIONS'
        throw error
      }
      return {
        ok: true,
        verification: {
          exchange: id,
          profile: accountProfile,
          readStatus: overview.readStatus,
          scopes: overview.scopes,
          errors: overview.errors,
          environment: overview.environment,
          balanceAssetCount: Array.isArray(overview.balances) ? overview.balances.length : 0,
          positionCount: Array.isArray(overview.positions) ? overview.positions.length : 0,
          signerConfigured: overview.signerConfigured === true,
          canTrade: overview.security?.canTrade === true,
          permissions: overview.security?.permissions ?? [],
          verifiedAt: Date.now(),
        },
      }
    },
    saveCredentials: async ({ exchange, profile, credentials }) => {
      const verificationResult = await api.verifyCredentials({ exchange, profile, credentials })
      const result = await vault.save(exchange, profile, credentials)
      state.executionAccountVerification.delete(`${String(exchange).toLowerCase()}:${String(profile).toLowerCase()}`)
      if (String(exchange).toLowerCase() === 'okx' && String(profile).toLowerCase() === String(cfg.okxProfile).toLowerCase()) await resetBridge()
      if (String(exchange).toLowerCase() === 'bybit') await resetBybitBridge(profile)
      auditAppend({ ts: Date.now(), tool: 'clustr_credentials', status: 'ok', reason: `${result.exchange}/${result.profile} 已保存到 ${vault.backend}` })
      await refreshPromptSnapshot({ refreshAccounts: true })
      return { ok: true, account: result, verification: verificationResult.verification, message: `连接验证通过，凭证已保存到 ${vault.backend}` }
    },
    removeCredentials: async ({ exchange, profile }) => {
      const result = await vault.remove(exchange, profile)
      state.executionAccountVerification.delete(`${String(exchange).toLowerCase()}:${String(profile).toLowerCase()}`)
      if (String(exchange).toLowerCase() === 'okx' && String(profile).toLowerCase() === String(cfg.okxProfile).toLowerCase()) await resetBridge()
      if (String(exchange).toLowerCase() === 'bybit') await resetBybitBridge(profile)
      auditAppend({ ts: Date.now(), tool: 'clustr_credentials', status: 'ok', reason: `${result.exchange}/${result.profile} 凭证已移除` })
      await refreshPromptSnapshot({ refreshAccounts: true })
      return { ok: true, account: result }
    },
  }

  cleanup.push(registerRoutes(ctx, api))
  ctx.provide('clustrConsole', {
    runtimeContextFor,
    contextSnapshot,
    accountsOverview: readAccountsOverview,
    capabilityManifest: () => capabilityManifest(capabilityOptions()),
    promptVersion: CLUSTR_PROMPT_VERSION,
  })

  initTools().catch((err) => {
    console.error('[Clustr Trading Console] tool init failed:', String(err?.message ?? err))
    if (state.bridge) state.bridge.lastError = String(err?.message ?? err)
  })

  state.registrations.push(...registerTraderTools(toolsSvc, {
    marketAnalysis,
    core,
    startReplay,
    marketConsensus,
    marketPacket,
    contextSnapshot,
    accountsOverview: readAccountsOverview,
    executeOrder,
  }))

  if (timer) {
    cleanup.push(timer.interval(() => { pollTickers().catch(() => {}) }, 10000))
    cleanup.push(timer.interval(() => { pollAccount().catch(() => {}) }, 30000))
    cleanup.push(timer.interval(() => { refreshPromptSnapshot({ refreshAccounts: true }).catch(() => {}) }, 60000))
    cleanup.push(timer.interval(() => { probePublicMarkets().catch(() => {}) }, 60000))
    cleanup.push(timer.interval(() => { reconcileUnknownOrders().catch(() => {}) }, 15000))
    pollTickers().catch(() => {})
    pollAccount().catch(() => {})
    refreshPromptSnapshot({ refreshAccounts: true }).catch(() => {})
    probePublicMarkets().catch(() => {})
    reconcileUnknownOrders().catch(() => {})
  }

  return () => {
    state.disposed = true
    for (const dispose of cleanup) { try { dispose() } catch {} }
    for (const reg of state.registrations) { try { reg() } catch {} }
    if (state.bridge) { state.bridge.dispose().catch(() => {}) }
    for (const bridge of state.bybitBridges.values()) bridge.dispose().catch(() => {})
    state.bybitBridges.clear()
    network.close().catch(() => {})
  }
}
