import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { mkdir, readFile, rename, writeFile, chmod } from 'node:fs/promises'

const AUTONOMY = [
  { id: 'observe', level: 0, label: '观察' },
  { id: 'advise', level: 1, label: '建议' },
  { id: 'prepare', level: 2, label: '准备订单' },
  { id: 'approve', level: 3, label: '逐笔审批' },
  { id: 'bounded', level: 4, label: '限域执行' },
  { id: 'guardian', level: 5, label: '仓位守护' },
]

const TEAM_ROLES = [
  { id: 'macro', label: '宏观环境', responsibility: '流动性、政策与跨市场状态' },
  { id: 'structure', label: '市场结构', responsibility: '价格结构、成交量与关键价位' },
  { id: 'catalyst', label: '事件催化', responsibility: '新闻、链上事件与信息可信度' },
  { id: 'quant', label: '量化信号', responsibility: '统计信号、波动率与概率校准' },
  { id: 'personal', label: '个人交易规则', responsibility: '用户偏好、限制与决策纪律' },
  { id: 'risk', label: '风险内核', responsibility: '确定性规则与执行否决' },
]
const OPINION_ROLES = new Set(['macro', 'structure', 'catalyst', 'quant', 'personal'])
const THESIS_TRANSITIONS = {
  watching: new Set(['triggered', 'invalidated', 'expired']),
  triggered: new Set(['validated', 'invalidated', 'expired']),
  validated: new Set(['approved', 'invalidated', 'expired']),
  approved: new Set(['executed', 'invalidated', 'expired']),
  executed: new Set(['closed']),
  invalidated: new Set(['closed']),
  expired: new Set(['closed']),
  closed: new Set(),
}
const ORDER_TERMINAL_STATES = new Set(['filled', 'canceled', 'rejected', 'denied', 'failed', 'manual-review'])
const ORDER_RECONCILABLE_STATES = new Set(['submitting', 'unknown', 'reconciling', 'acknowledged', 'open', 'partially-filled', 'cancel-pending'])
const ORDER_TRANSITIONS = {
  received: new Set(['validating', 'rejected', 'failed']),
  validating: new Set(['awaiting-approval', 'rejected', 'failed']),
  'awaiting-approval': new Set(['approved', 'denied', 'failed']),
  approved: new Set(['submitting', 'failed']),
  submitting: new Set(['acknowledged', 'open', 'partially-filled', 'filled', 'canceled', 'rejected', 'unknown', 'manual-review']),
  unknown: new Set(['reconciling', 'acknowledged', 'open', 'partially-filled', 'filled', 'canceled', 'rejected', 'manual-review']),
  reconciling: new Set(['reconciling', 'acknowledged', 'open', 'partially-filled', 'filled', 'canceled', 'rejected', 'manual-review']),
  acknowledged: new Set(['open', 'partially-filled', 'filled', 'cancel-pending', 'canceled', 'rejected', 'unknown', 'manual-review']),
  open: new Set(['partially-filled', 'filled', 'cancel-pending', 'canceled', 'rejected', 'unknown', 'manual-review']),
  'partially-filled': new Set(['partially-filled', 'filled', 'cancel-pending', 'canceled', 'unknown', 'manual-review']),
  'cancel-pending': new Set(['open', 'canceled', 'partially-filled', 'filled', 'unknown', 'manual-review']),
  filled: new Set(), canceled: new Set(), rejected: new Set(), denied: new Set(), failed: new Set(),
  'manual-review': new Set(['reconciling', 'acknowledged', 'open', 'partially-filled', 'filled', 'canceled', 'rejected']),
}

const DEFAULT_STATE = {
  schemaVersion: 1,
  autonomy: { id: 'observe', updatedAt: null, scope: null },
  killSwitch: { active: false, updatedAt: null, reason: null },
  theses: [],
  decisionRooms: [],
  shadows: [],
  replays: [],
  memories: [],
  provenance: [],
  riskPermits: [],
  orders: [],
  executionLedger: { dailyDate: '', dailyNotionalUsdt: 0, reservations: [], unknownOrders: [] },
}

function now() { return new Date().toISOString() }
function finite(value) { const number = Number(value); return Number.isFinite(number) ? number : null }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)) }
function text(value, name, max = 800, required = false) {
  const result = String(value ?? '').trim()
  if (required && !result) throw new Error(`${name}不能为空`)
  if (result.length > max) throw new Error(`${name}不能超过 ${max} 个字符`)
  return result
}
function list(value, max = 20) { return Array.isArray(value) ? value.slice(0, max) : [] }
function clone(value) { return structuredClone(value) }
const SECRET_KEY = /api.?key|secret|passphrase|private.?key|mnemonic|seed|signature|authorization/i
function redact(value, key = '') {
  if (SECRET_KEY.test(key)) return '[REDACTED]'
  if (Array.isArray(value)) return value.map((item) => redact(item))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, redact(child, childKey)]))
  return value
}

function orderState(value, fallback = null) {
  const normalized = String(value ?? '').trim().toLowerCase().replace(/_/g, '-')
  const mapped = ({
    live: 'open', pending: 'open', accepted: 'acknowledged', new: 'acknowledged',
    'partially-filled': 'partially-filled', partiallyfilled: 'partially-filled', partial: 'partially-filled',
    cancelled: 'canceled', cancelledbyuser: 'canceled', complete: 'filled', completed: 'filled',
  })[normalized] ?? normalized
  if (Object.hasOwn(ORDER_TRANSITIONS, mapped)) return mapped
  if (fallback) return fallback
  throw new Error('订单状态无效')
}

function orderNumber(value) {
  if (value == null || value === '') return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

class LocalStateStore {
  constructor(file = join(homedir(), '.dsh', 'clustr', 'operating-core.json')) {
    this.file = file
    this.state = null
    this.writeQueue = Promise.resolve()
  }

  async load() {
    if (this.state) return this.state
    try {
      const parsed = JSON.parse(await readFile(this.file, 'utf8'))
      this.state = { ...clone(DEFAULT_STATE), ...parsed }
    } catch (error) {
      if (error?.code === 'ENOENT') this.state = clone(DEFAULT_STATE)
      else throw new Error('Clustr 本地状态无法读取；原文件已保留，系统不会静默重置。')
    }
    return this.state
  }

  async mutate(mutator) {
    const operation = this.writeQueue.catch(() => {}).then(async () => {
      const state = await this.load()
      const value = await mutator(state)
      await mkdir(dirname(this.file), { recursive: true, mode: 0o700 })
      const temporary = `${this.file}.${randomUUID()}.tmp`
      await writeFile(temporary, JSON.stringify(state, null, 2), { mode: 0o600 })
      await chmod(temporary, 0o600).catch(() => {})
      await rename(temporary, this.file)
      return clone(value)
    })
    this.writeQueue = operation.then(() => undefined, () => undefined)
    return operation
  }
}

function trace(state, { action, entityType, entityId, source = 'clustr-core', facts = {}, judgment = null, result = 'ok' }) {
  const entry = { id: randomUUID(), at: now(), action, entityType, entityId, source, facts, judgment, result }
  state.provenance.unshift(entry)
  state.provenance = state.provenance.slice(0, 1000)
  return entry
}

function normalizeEvidence(value, kind) {
  return list(value).map((item) => ({
    id: item?.id || randomUUID(),
    kind,
    claim: text(item?.claim ?? item, `${kind}内容`, 500, true),
    source: text(item?.source ?? 'user', '来源', 120),
    observedAt: item?.observedAt ? String(item.observedAt) : now(),
    dataTimestamp: item?.dataTimestamp ? String(item.dataTimestamp) : null,
  }))
}

function normalizeCandle(item) {
  if (Array.isArray(item)) return { ts: finite(item[0]), o: finite(item[1]), h: finite(item[2]), l: finite(item[3]), c: finite(item[4]), vol: finite(item[5]) }
  if (item && typeof item === 'object') return { ts: finite(item.ts ?? item.t ?? item.timestamp), o: finite(item.o ?? item.open), h: finite(item.h ?? item.high), l: finite(item.l ?? item.low), c: finite(item.c ?? item.close), vol: finite(item.vol ?? item.v ?? item.volume) }
  return null
}

export class ClustrOperatingCore {
  constructor(options = {}) {
    this.store = new LocalStateStore(options.file)
    this.readOnly = options.readOnly ?? true
    this.riskConfig = options.risk ?? {}
  }

  syncReadOnly(value) {
    this.readOnly = value !== false
    return this.readOnly
  }

  async applyExecutionMode({ readOnly, actor = 'user', reason = null } = {}) {
    const protectedMode = this.syncReadOnly(readOnly)
    return this.store.mutate((state) => {
      if (protectedMode) {
        state.autonomy = { id: 'observe', updatedAt: now(), scope: null, usedOrders: 0 }
        for (const permit of state.riskPermits) if (permit.status === 'active') permit.status = 'revoked'
      }
      trace(state, {
        action: protectedMode ? 'execution.read-only-enabled' : 'execution.approval-trading-enabled',
        entityType: 'execution-mode',
        entityId: 'global',
        source: text(actor, '操作者', 80),
        facts: { readOnly: protectedMode },
        judgment: { reason: reason ? text(reason, '原因', 300) : null },
      })
      return { readOnly: protectedMode, autonomy: clone(state.autonomy) }
    })
  }

  async status() {
    const state = await this.store.load()
    return {
      product: 'Clustr Trading Console',
      operatingPrinciple: '事实、判断、规则与状态变更彼此分离',
      autonomy: { ...state.autonomy, definition: AUTONOMY.find((item) => item.id === state.autonomy.id) },
      killSwitch: clone(state.killSwitch ?? DEFAULT_STATE.killSwitch),
      team: TEAM_ROLES,
      layers: [
        { id: 'intelligence', label: '市场情报图谱', capability: '多源行情归一与差异检测' },
        { id: 'team', label: '协作判断', capability: '结构化角色判断与分歧计算' },
        { id: 'thesis', label: '交易论点', capability: '持久化状态与证据链', count: state.theses.length },
        { id: 'shadow', label: '对照方案', capability: '并行方案定义与观察记录', count: state.shadows.length },
        { id: 'replay', label: 'K 线回放', capability: '按 K 线时间推进与未来数据隔离', count: state.replays.length },
        { id: 'risk', label: '风险内核', capability: '确定性裁决与单次执行许可' },
        { id: 'autonomy', label: '自主权阶梯', capability: '真实写操作授权边界' },
        { id: 'memory', label: '交易记忆', capability: '结果归因与重复错误统计', count: state.memories.length },
        { id: 'provenance', label: '决策溯源', capability: '事实、判断和状态变化追踪', count: state.provenance.length },
      ],
    }
  }

  async listTheses({ status, limit = 50 } = {}) {
    const state = await this.store.load()
    return state.theses.filter((item) => !status || item.status === status).slice(0, clamp(Number(limit) || 50, 1, 200)).map(clone)
  }

  async createThesis(input = {}) {
    const direction = String(input.direction ?? 'neutral').toLowerCase()
    if (!['long', 'short', 'neutral'].includes(direction)) throw new Error('direction 必须是 long、short 或 neutral')
    const instrument = text(input.instrument ?? input.instId, '交易标的', 64, true).toUpperCase()
    const createdAt = now()
    const expiresAt = input.expiresAt ? String(input.expiresAt) : null
    if (expiresAt && (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now())) throw new Error('交易论点到期时间必须晚于当前时间')
    const riskBudgetPercent = finite(input.riskBudgetPercent)
    if (riskBudgetPercent != null && (riskBudgetPercent <= 0 || riskBudgetPercent > 10)) throw new Error('风险预算必须在 0–10% 之间')
    const thesis = {
      id: randomUUID(),
      createdAt,
      updatedAt: createdAt,
      status: 'watching',
      instrument,
      exchange: text(input.exchange ?? 'multi', '交易所', 32),
      timeframe: text(input.timeframe ?? input.bar ?? '1H', '时间周期', 16),
      direction,
      statement: text(input.statement, '核心判断', 1200, true),
      entryCondition: text(input.entryCondition, '入场条件', 800, true),
      invalidation: text(input.invalidation, '失效条件', 800, true),
      expectedPath: text(input.expectedPath, '预期路径', 800),
      expiresAt,
      riskBudgetPercent,
      confidence: input.confidence == null ? null : clamp(finite(input.confidence) ?? 0, 0, 1),
      evidence: normalizeEvidence(input.evidence, 'support'),
      counterEvidence: normalizeEvidence(input.counterEvidence, 'counter'),
      owner: text(input.owner ?? 'user', '所有者', 80),
    }
    return this.store.mutate((state) => {
      state.theses.unshift(thesis)
      trace(state, { action: 'thesis.created', entityType: 'thesis', entityId: thesis.id, facts: { instrument, timeframe: thesis.timeframe, direction }, judgment: { statement: thesis.statement, confidence: thesis.confidence } })
      return thesis
    })
  }

  async transitionThesis(thesisId, input = {}) {
    const nextStatus = String(input.status ?? '').toLowerCase()
    const reason = text(input.reason, '状态变更原因', 800, true)
    return this.store.mutate((state) => {
      const thesis = state.theses.find((item) => item.id === thesisId)
      if (!thesis) throw new Error('交易论点不存在')
      if (thesis.expiresAt && Date.parse(thesis.expiresAt) <= Date.now() && thesis.status !== 'expired' && thesis.status !== 'closed') thesis.status = 'expired'
      if (!THESIS_TRANSITIONS[thesis.status]?.has(nextStatus)) throw new Error(`交易论点不能从 ${thesis.status} 进入 ${nextStatus}`)
      const previousStatus = thesis.status
      thesis.status = nextStatus
      thesis.updatedAt = now()
      thesis.statusReason = reason
      trace(state, { action: 'thesis.transitioned', entityType: 'thesis', entityId: thesis.id, source: text(input.actor ?? 'user', '操作者', 80), facts: { previousStatus, nextStatus }, judgment: { reason } })
      return thesis
    })
  }

  async addThesisEvidence(thesisId, input = {}) {
    return this.store.mutate((state) => {
      const thesis = state.theses.find((item) => item.id === thesisId)
      if (!thesis) throw new Error('交易论点不存在')
      const kind = input.kind === 'counter' ? 'counter' : 'support'
      const item = normalizeEvidence([input], kind)[0]
      if (kind === 'counter') thesis.counterEvidence.unshift(item)
      else thesis.evidence.unshift(item)
      thesis.updatedAt = now()
      trace(state, { action: 'thesis.evidence-added', entityType: 'thesis', entityId: thesis.id, source: item.source, facts: { kind, observedAt: item.observedAt, dataTimestamp: item.dataTimestamp }, judgment: { claim: item.claim } })
      return thesis
    })
  }

  async decisionRoom(thesisId, input = {}) {
    const opinions = list(input.opinions, 12).map((opinion) => {
      const role = text(opinion?.role, 'Agent 角色', 40, true)
      if (!OPINION_ROLES.has(role)) throw new Error('Agent 角色必须是 macro、structure、catalyst、quant 或 personal；风险内核不能由模型意见冒充')
      const stance = String(opinion?.stance ?? 'abstain').toLowerCase()
      if (!['long', 'short', 'neutral', 'abstain'].includes(stance)) throw new Error('Agent stance 无效')
      return {
        role,
        stance,
        confidence: clamp(finite(opinion?.confidence) ?? 0, 0, 1),
        rationale: text(opinion?.rationale, '判断理由', 800, true),
        evidenceIds: list(opinion?.evidenceIds, 30).map(String),
        submittedAt: now(),
      }
    })
    if (!opinions.length) throw new Error('至少需要一个 Agent 判断')
    if (new Set(opinions.map((item) => item.role)).size !== opinions.length) throw new Error('同一角色只能提交一个判断')
    return this.store.mutate((state) => {
      const thesis = state.theses.find((item) => item.id === thesisId)
      if (!thesis) throw new Error('交易论点不存在')
      const evidenceIds = new Set([...thesis.evidence, ...thesis.counterEvidence].map((item) => item.id))
      for (const opinion of opinions) if (opinion.evidenceIds.some((id) => !evidenceIds.has(id))) throw new Error('Agent 判断引用了不存在的证据')
      let directionalScore = 0
      let directionalWeight = 0
      let confidenceSum = 0
      for (const opinion of opinions) {
        const weight = 1
        const direction = opinion.stance === 'long' ? 1 : opinion.stance === 'short' ? -1 : 0
        directionalScore += direction * opinion.confidence * weight
        directionalWeight += opinion.stance === 'abstain' ? 0 : weight
        confidenceSum += opinion.confidence * weight
      }
      const normalized = directionalWeight ? directionalScore / directionalWeight : 0
      const disagreement = directionalWeight ? clamp(1 - Math.abs(normalized), 0, 1) : 1
      const direction = normalized > 0.2 ? 'long' : normalized < -0.2 ? 'short' : 'neutral'
      const room = {
        id: randomUUID(), thesisId, createdAt: now(), opinions,
        outcome: {
          direction,
          confidence: clamp((confidenceSum / Math.max(directionalWeight, 1)) * (1 - disagreement * 0.5), 0, 1),
          disagreement,
          abstentions: opinions.filter((item) => item.stance === 'abstain').length,
          action: 'requires-risk-evaluation',
        },
      }
      state.decisionRooms.unshift(room)
      state.decisionRooms = state.decisionRooms.slice(0, 300)
      trace(state, { action: 'team.decision-recorded', entityType: 'decision-room', entityId: room.id, facts: { thesisId, opinionCount: opinions.length }, judgment: room.outcome })
      return room
    })
  }

  async createShadow(thesisId, input = {}) {
    return this.store.mutate((state) => {
      const thesis = state.theses.find((item) => item.id === thesisId)
      if (!thesis) throw new Error('交易论点不存在')
      const variants = list(input.variants, 8).length ? list(input.variants, 8) : [
        { id: 'baseline', label: '原始计划', riskMultiplier: 1, delayBars: 0 },
        { id: 'half-risk', label: '半风险预算', riskMultiplier: 0.5, delayBars: 0 },
        { id: 'delayed-entry', label: '延后一根 K 线', riskMultiplier: 1, delayBars: 1 },
        { id: 'no-entry', label: '保持空仓', riskMultiplier: 0, delayBars: 0 },
      ]
      const shadow = { id: randomUUID(), thesisId, instrument: thesis.instrument, createdAt: now(), status: 'monitoring', variants, observations: [] }
      state.shadows.unshift(shadow)
      trace(state, { action: 'shadow.created', entityType: 'shadow', entityId: shadow.id, facts: { thesisId, variants: variants.map((item) => item.id) } })
      return shadow
    })
  }

  async createReplay(input = {}) {
    const rows = list(input.candles, 500).map(normalizeCandle).filter((item) => item?.ts != null && [item.o, item.h, item.l, item.c].every((value) => value != null)).sort((a, b) => a.ts - b.ts)
    if (rows.length < 20) throw new Error('市场回放至少需要 20 根有效 K 线')
    const initialBars = clamp(Number(input.initialBars) || Math.max(20, Math.floor(rows.length * 0.4)), 20, rows.length - 1)
    const replay = {
      id: randomUUID(), createdAt: now(), instrument: text(input.instrument ?? input.instId, '交易标的', 64, true).toUpperCase(),
      exchange: text(input.exchange ?? 'okx', '交易所', 32), bar: text(input.bar ?? '1H', '时间周期', 16),
      status: 'running', cursor: initialBars, totalBars: rows.length, candles: rows,
      integrity: { futureBarsHidden: rows.length - initialBars, sourceRange: { start: rows[0].ts, end: rows.at(-1).ts } }, decisions: [],
    }
    return this.store.mutate((state) => {
      state.replays.unshift(replay)
      state.replays = state.replays.slice(0, 60)
      trace(state, { action: 'replay.created', entityType: 'replay', entityId: replay.id, facts: { instrument: replay.instrument, bar: replay.bar, totalBars: rows.length, initialBars } })
      return { ...replay, candles: replay.candles.slice(0, replay.cursor) }
    })
  }

  async advanceReplay(replayId, bars = 1) {
    return this.store.mutate((state) => {
      const replay = state.replays.find((item) => item.id === replayId)
      if (!replay) throw new Error('市场回放不存在')
      replay.cursor = clamp(replay.cursor + clamp(Number(bars) || 1, 1, 50), 0, replay.totalBars)
      replay.status = replay.cursor >= replay.totalBars ? 'completed' : 'running'
      replay.integrity.futureBarsHidden = replay.totalBars - replay.cursor
      trace(state, { action: 'replay.advanced', entityType: 'replay', entityId: replay.id, facts: { cursor: replay.cursor, futureBarsHidden: replay.integrity.futureBarsHidden } })
      return { ...replay, candles: replay.candles.slice(0, replay.cursor) }
    })
  }

  evaluateRisk(input = {}) {
    const equity = finite(input.equityUsdt)
    const entry = finite(input.entryPrice)
    const stop = finite(input.stopPrice)
    const quantity = finite(input.quantity)
    const leverage = finite(input.leverage) ?? 1
    const dataAgeMs = finite(input.dataAgeMs)
    const slippageBps = finite(input.slippageBps)
    const dailyLossPercent = finite(input.dailyLossPercent) ?? 0
    const reasons = []
    if (![equity, entry, stop, quantity].every((value) => value != null && value > 0)) reasons.push('账户权益、入场价、止损价与数量必须为正数')
    if (entry === stop) reasons.push('止损价不能等于入场价')
    if (dataAgeMs == null || dataAgeMs > (this.riskConfig.maxMarketDataAgeMs ?? 30000)) reasons.push('市场数据缺失或已经过期')
    if (slippageBps == null || slippageBps > (this.riskConfig.maxSlippageBps ?? 35)) reasons.push('预估滑点缺失或超过限制')
    if (leverage > (this.riskConfig.maxLeverage ?? 10)) reasons.push('杠杆超过风险上限')
    if (dailyLossPercent >= (this.riskConfig.maxDailyLossPercent ?? 3)) reasons.push('当日亏损已达到停止交易阈值')
    const riskAmount = entry != null && stop != null && quantity != null ? Math.abs(entry - stop) * quantity : null
    const riskPercent = equity && riskAmount != null ? riskAmount / equity * 100 : null
    if (riskPercent != null && riskPercent > (this.riskConfig.maxRiskPerTradePercent ?? 1)) reasons.push('单笔风险超过账户风险预算')
    const notionalUsdt = entry != null && quantity != null ? entry * quantity : null
    if (notionalUsdt != null && notionalUsdt > (this.riskConfig.maxOrderNotionalUsdt ?? 5000)) reasons.push('订单名义价值超过单笔上限')
    const result = {
      allowed: reasons.length === 0,
      decision: reasons.length ? 'rejected' : 'eligible-for-approval',
      reasons,
      metrics: { riskAmountUsdt: riskAmount, riskPercent, notionalUsdt, leverage, dataAgeMs, slippageBps, dailyLossPercent },
      rules: {
        maxRiskPerTradePercent: this.riskConfig.maxRiskPerTradePercent ?? 1,
        maxOrderNotionalUsdt: this.riskConfig.maxOrderNotionalUsdt ?? 5000,
        maxLeverage: this.riskConfig.maxLeverage ?? 10,
        maxSlippageBps: this.riskConfig.maxSlippageBps ?? 35,
        maxMarketDataAgeMs: this.riskConfig.maxMarketDataAgeMs ?? 30000,
        maxDailyLossPercent: this.riskConfig.maxDailyLossPercent ?? 3,
      },
    }
    return result
  }

  async recordRiskEvaluation(input = {}) {
    const evaluation = this.evaluateRisk(input)
    return this.store.mutate((state) => {
      const entry = trace(state, { action: 'risk.evaluated', entityType: 'risk-evaluation', entityId: randomUUID(), facts: evaluation.metrics, judgment: { decision: evaluation.decision, reasons: evaluation.reasons }, result: evaluation.allowed ? 'ok' : 'rejected' })
      let permit = null
      if (evaluation.allowed) {
        permit = {
          id: randomUUID(), status: 'active', createdAt: now(), expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          instrument: text(input.instrument ?? input.instId, '交易标的', 64, true).toUpperCase(),
          exchange: text(input.exchange ?? 'okx', '交易所', 32),
          maxNotionalUsdt: evaluation.metrics.notionalUsdt,
          side: input.side ? text(input.side, '订单方向', 16).toLowerCase() : null,
          riskEvaluationId: entry.id,
        }
        state.riskPermits.unshift(permit)
        state.riskPermits = state.riskPermits.filter((item) => item.status === 'active' && Date.parse(item.expiresAt) > Date.now()).slice(0, 100)
      }
      return { ...evaluation, provenanceId: entry.id, executionPermit: permit }
    })
  }

  async validateRiskPermit(permitId, input = {}) {
    const state = await this.store.load()
    const permit = state.riskPermits.find((item) => item.id === permitId)
    if (!permit || permit.status !== 'active') return { ok: false, reason: '缺少有效的风险执行许可' }
    if (Date.parse(permit.expiresAt) <= Date.now()) return { ok: false, reason: '风险执行许可已经过期' }
    const instrument = String(input.instrument ?? input.instId ?? '').toUpperCase()
    if (instrument && permit.instrument !== instrument) return { ok: false, reason: '风险执行许可与交易标的不一致' }
    const exchange = String(input.exchange ?? '').toLowerCase()
    if (exchange && permit.exchange.toLowerCase() !== exchange) return { ok: false, reason: '风险执行许可与交易所不一致' }
    const notional = finite(input.notionalUsdt)
    if (notional == null || notional > permit.maxNotionalUsdt * 1.001) return { ok: false, reason: '订单规模超过风险执行许可' }
    const side = String(input.side ?? '').toLowerCase()
    if (permit.side && side && permit.side !== side) return { ok: false, reason: '风险执行许可与订单方向不一致' }
    return { ok: true, permit: clone(permit) }
  }

  async consumeRiskPermit(permitId) {
    return this.store.mutate((state) => {
      const permit = state.riskPermits.find((item) => item.id === permitId)
      if (!permit || permit.status !== 'active' || Date.parse(permit.expiresAt) <= Date.now()) throw new Error('风险执行许可不可用')
      permit.status = 'consumed'
      permit.consumedAt = now()
      trace(state, { action: 'risk.permit-consumed', entityType: 'risk-permit', entityId: permit.id, facts: { instrument: permit.instrument, exchange: permit.exchange, maxNotionalUsdt: permit.maxNotionalUsdt } })
      return permit
    })
  }

  async setAutonomy(input = {}) {
    const definition = AUTONOMY.find((item) => item.id === input.id)
    if (!definition) throw new Error('自主权等级无效')
    if (this.readOnly && definition.level > 2) throw new Error('只读保护开启时，自主权不能高于“准备订单”')
    const scope = input.scope ? {
      exchanges: list(input.scope.exchanges, 8).map(String), instruments: list(input.scope.instruments, 30).map(String),
      expiresAt: input.scope.expiresAt ? String(input.scope.expiresAt) : null,
      maxOrders: finite(input.scope.maxOrders), maxRiskPercent: finite(input.scope.maxRiskPercent),
    } : null
    if (definition.level >= 3) {
      if (!scope?.expiresAt || !Number.isFinite(Date.parse(scope.expiresAt)) || Date.parse(scope.expiresAt) <= Date.now()) throw new Error('逐笔审批及更高等级必须设置有效的授权到期时间')
      if (!scope.exchanges.length || !scope.instruments.length) throw new Error('逐笔审批及更高等级必须限定交易所和交易标的')
      scope.maxOrders = Math.max(1, Math.trunc(scope.maxOrders || 1))
      scope.maxRiskPercent = scope.maxRiskPercent == null ? (this.riskConfig.maxRiskPerTradePercent ?? 1) : scope.maxRiskPercent
    }
    return this.store.mutate((state) => {
      state.autonomy = { id: definition.id, updatedAt: now(), scope, usedOrders: 0 }
      trace(state, { action: 'autonomy.changed', entityType: 'autonomy', entityId: definition.id, facts: { level: definition.level, scope } })
      return { ...state.autonomy, definition }
    })
  }

  async autonomyStatus() {
    const state = await this.store.load()
    return { ...state.autonomy, definition: AUTONOMY.find((item) => item.id === state.autonomy.id), levels: AUTONOMY }
  }

  async killSwitchStatus() {
    const state = await this.store.load()
    return clone(state.killSwitch ?? DEFAULT_STATE.killSwitch)
  }

  async setKillSwitch(input = {}) {
    if (input.confirmed !== true) throw new Error('紧急停止状态变更需要明确确认')
    const active = input.active === true
    const reason = text(input.reason, '原因', 300, active)
    return this.store.mutate((state) => {
      state.killSwitch = { active, updatedAt: now(), reason: reason || null }
      if (active) {
        state.autonomy = { id: 'observe', updatedAt: now(), scope: null, usedOrders: 0 }
        for (const permit of state.riskPermits) if (permit.status === 'active') permit.status = 'revoked'
      }
      trace(state, { action: active ? 'execution.stopped' : 'execution.resumed', entityType: 'kill-switch', entityId: 'global', source: text(input.actor ?? 'user', '操作者', 80), facts: { active }, judgment: { reason: reason || null } })
      return state.killSwitch
    })
  }

  async executionGate() {
    const state = await this.store.load()
    if (this.readOnly) return { ok: false, reason: '只读保护已开启，真实写操作被拒绝' }
    if (state.killSwitch?.active) return { ok: false, reason: `紧急停止已启用${state.killSwitch.reason ? `：${state.killSwitch.reason}` : ''}` }
    return { ok: true }
  }

  async validateAutonomy(input = {}) {
    const state = await this.store.load()
    const definition = AUTONOMY.find((item) => item.id === state.autonomy.id) ?? AUTONOMY[0]
    if (definition.level < 3) return { ok: false, reason: '当前自主权不允许真实写操作' }
    const scope = state.autonomy.scope
    if (!scope) return { ok: false, reason: '当前自主权没有可执行范围' }
    if (!scope.expiresAt || Date.parse(scope.expiresAt) <= Date.now()) return { ok: false, reason: '自主权授权已经过期' }
    const exchange = String(input.exchange ?? '').toLowerCase()
    const instrument = String(input.instrument ?? input.instId ?? '').toUpperCase()
    if (!scope.exchanges.map((item) => item.toLowerCase()).includes(exchange)) return { ok: false, reason: '交易所不在自主权授权范围内' }
    if (!scope.instruments.map((item) => item.toUpperCase()).includes(instrument)) return { ok: false, reason: '交易标的不在自主权授权范围内' }
    if ((state.autonomy.usedOrders ?? 0) >= scope.maxOrders) return { ok: false, reason: '自主权授权次数已经用尽' }
    const riskPercent = finite(input.riskPercent)
    if (riskPercent != null && riskPercent > scope.maxRiskPercent) return { ok: false, reason: '订单风险超过自主权授权范围' }
    return { ok: true, autonomy: clone(state.autonomy), definition }
  }

  async consumeAutonomyOrder(input = {}) {
    return this.store.mutate((state) => {
      const scope = state.autonomy.scope
      if (!scope || Date.parse(scope.expiresAt) <= Date.now()) throw new Error('自主权授权不可用')
      if ((state.autonomy.usedOrders ?? 0) >= scope.maxOrders) throw new Error('自主权授权次数已经用尽')
      state.autonomy.usedOrders = (state.autonomy.usedOrders ?? 0) + 1
      trace(state, { action: 'autonomy.consumed', entityType: 'autonomy', entityId: state.autonomy.id, facts: { exchange: input.exchange, instrument: input.instrument ?? input.instId, usedOrders: state.autonomy.usedOrders, maxOrders: scope.maxOrders } })
      return state.autonomy
    })
  }

  async consumeExecutionAuthorization(input = {}) {
    return this.store.mutate((state) => {
      if (state.killSwitch?.active) throw new Error('紧急停止已启用，写操作被拒绝')
      const definition = AUTONOMY.find((item) => item.id === state.autonomy.id) ?? AUTONOMY[0]
      const scope = state.autonomy.scope
      if (definition.level < 3 || !scope || !scope.expiresAt || Date.parse(scope.expiresAt) <= Date.now()) throw new Error('自主权授权不可用')
      const exchange = String(input.exchange ?? '').toLowerCase()
      const instrument = String(input.instrument ?? input.instId ?? '').toUpperCase()
      if (!scope.exchanges.map((item) => item.toLowerCase()).includes(exchange)) throw new Error('交易所不在自主权授权范围内')
      if (!scope.instruments.map((item) => item.toUpperCase()).includes(instrument)) throw new Error('交易标的不在自主权授权范围内')
      if ((state.autonomy.usedOrders ?? 0) >= scope.maxOrders) throw new Error('自主权授权次数已经用尽')
      const permit = state.riskPermits.find((item) => item.id === String(input.permitId ?? ''))
      if (!permit || permit.status !== 'active' || Date.parse(permit.expiresAt) <= Date.now()) throw new Error('风险执行许可不可用')
      if (permit.instrument !== instrument || permit.exchange.toLowerCase() !== exchange) throw new Error('风险执行许可与订单不一致')
      const notional = finite(input.notionalUsdt)
      if (notional == null || notional > permit.maxNotionalUsdt * 1.001) throw new Error('订单规模超过风险执行许可')
      const side = String(input.side ?? '').toLowerCase()
      if (permit.side && side && permit.side !== side) throw new Error('风险执行许可与订单方向不一致')
      state.autonomy.usedOrders = (state.autonomy.usedOrders ?? 0) + 1
      permit.status = 'consumed'
      permit.consumedAt = now()
      trace(state, { action: 'execution.authorization-consumed', entityType: 'risk-permit', entityId: permit.id, facts: { exchange, instrument, notionalUsdt: notional, usedOrders: state.autonomy.usedOrders, maxOrders: scope.maxOrders } })
      return { autonomy: state.autonomy, permit }
    })
  }

  async executionLedgerStatus() {
    const state = await this.store.load()
    const ledger = state.executionLedger ?? clone(DEFAULT_STATE.executionLedger)
    const today = new Date().toISOString().slice(0, 10)
    return {
      dailyDate: ledger.dailyDate,
      dailyNotionalUsdt: ledger.dailyDate === today ? finite(ledger.dailyNotionalUsdt) ?? 0 : 0,
      reservedNotionalUsdt: [...(ledger.reservations ?? []), ...(ledger.unknownOrders ?? [])].reduce((sum, item) => sum + (finite(item.notionalUsdt) ?? 0), 0),
      reservations: clone(ledger.reservations ?? []),
      unknownOrders: clone(ledger.unknownOrders ?? []),
    }
  }

  async reserveExecutionBudget(input = {}) {
    const clientOrderId = text(input.clientOrderId, '客户端订单编号', 64, true)
    const notionalUsdt = finite(input.notionalUsdt)
    const maxDailyNotionalUsdt = finite(input.maxDailyNotionalUsdt)
    if (notionalUsdt == null || notionalUsdt <= 0 || maxDailyNotionalUsdt == null || maxDailyNotionalUsdt <= 0) throw new Error('执行预算参数无效')
    return this.store.mutate((state) => {
      state.executionLedger ??= clone(DEFAULT_STATE.executionLedger)
      const ledger = state.executionLedger
      const today = new Date().toISOString().slice(0, 10)
      if (ledger.dailyDate !== today) { ledger.dailyDate = today; ledger.dailyNotionalUsdt = 0 }
      if ([...(ledger.reservations ?? []), ...(ledger.unknownOrders ?? [])].some((item) => item.clientOrderId === clientOrderId)) throw new Error('客户端订单编号已经存在')
      const outstanding = [...(ledger.reservations ?? []), ...(ledger.unknownOrders ?? [])].reduce((sum, item) => sum + (finite(item.notionalUsdt) ?? 0), 0)
      const projected = (finite(ledger.dailyNotionalUsdt) ?? 0) + outstanding + notionalUsdt
      if (projected > maxDailyNotionalUsdt) throw new Error(`并发风险预留后，日累计名义 ${projected.toFixed(0)} USDT 将超过上限 ${maxDailyNotionalUsdt} USDT`)
      const reservation = { clientOrderId, exchangeClientOrderId: input.exchangeClientOrderId ? text(input.exchangeClientOrderId, '交易所客户端订单编号', 64) : null, exchange: text(input.exchange ?? 'okx', '交易所', 32), instId: text(input.instId, '交易标的', 64, true).toUpperCase(), market: text(input.market ?? 'spot', '市场类型', 16), notionalUsdt, createdAt: now(), state: 'reserved' }
      ledger.reservations ??= []
      ledger.reservations.push(reservation)
      trace(state, { action: 'execution.budget-reserved', entityType: 'order', entityId: clientOrderId, facts: { exchange: reservation.exchange, instId: reservation.instId, notionalUsdt } })
      return reservation
    })
  }

  async markExecutionUnknown(clientOrderId) {
    return this.store.mutate((state) => {
      state.executionLedger ??= clone(DEFAULT_STATE.executionLedger)
      const ledger = state.executionLedger
      const index = (ledger.reservations ?? []).findIndex((item) => item.clientOrderId === clientOrderId)
      if (index < 0) throw new Error('执行预算预留不存在')
      const [reservation] = ledger.reservations.splice(index, 1)
      const order = { ...reservation, state: 'reconciling', attempts: 0, unknownAt: now(), lastCheckedAt: null }
      ledger.unknownOrders ??= []
      ledger.unknownOrders.push(order)
      trace(state, { action: 'order.state-unknown', entityType: 'order', entityId: clientOrderId, facts: { instId: order.instId, notionalUsdt: order.notionalUsdt }, result: 'unknown' })
      return order
    })
  }

  async releaseExecutionBudget(clientOrderId, reason = '订单未发送') {
    return this.store.mutate((state) => {
      state.executionLedger ??= clone(DEFAULT_STATE.executionLedger)
      const ledger = state.executionLedger
      const before = (ledger.reservations ?? []).length
      ledger.reservations = (ledger.reservations ?? []).filter((item) => item.clientOrderId !== clientOrderId)
      if (before === ledger.reservations.length) return { released: false }
      trace(state, { action: 'execution.budget-released', entityType: 'order', entityId: clientOrderId, judgment: { reason: text(reason, '原因', 300) } })
      return { released: true }
    })
  }

  async resolveExecutionBudget(clientOrderId, input = {}) {
    return this.store.mutate((state) => {
      state.executionLedger ??= clone(DEFAULT_STATE.executionLedger)
      const ledger = state.executionLedger
      const all = [...(ledger.reservations ?? []), ...(ledger.unknownOrders ?? [])]
      const order = all.find((item) => item.clientOrderId === clientOrderId)
      if (!order) return { resolved: false }
      ledger.reservations = (ledger.reservations ?? []).filter((item) => item.clientOrderId !== clientOrderId)
      ledger.unknownOrders = (ledger.unknownOrders ?? []).filter((item) => item.clientOrderId !== clientOrderId)
      const today = new Date().toISOString().slice(0, 10)
      if (ledger.dailyDate !== today) { ledger.dailyDate = today; ledger.dailyNotionalUsdt = 0 }
      if (input.countNotional !== false) ledger.dailyNotionalUsdt = (finite(ledger.dailyNotionalUsdt) ?? 0) + order.notionalUsdt
      trace(state, { action: 'order.reconciled', entityType: 'order', entityId: clientOrderId, facts: { instId: order.instId, notionalUsdt: order.notionalUsdt, exchangeState: text(input.exchangeState ?? 'accepted', '交易所状态', 40) }, result: 'ok' })
      return { resolved: true, order }
    })
  }

  async noteReconciliationAttempt(clientOrderId) {
    return this.store.mutate((state) => {
      state.executionLedger ??= clone(DEFAULT_STATE.executionLedger)
      const order = (state.executionLedger.unknownOrders ?? []).find((item) => item.clientOrderId === clientOrderId)
      if (!order) return { found: false }
      order.attempts = (finite(order.attempts) ?? 0) + 1
      order.lastCheckedAt = now()
      if (Date.now() - Date.parse(order.unknownAt ?? order.createdAt) > 24 * 60 * 60_000) order.state = 'manual-review'
      return { found: true, order }
    })
  }

  async createOrderLifecycle(input = {}) {
    const id = text(input.id ?? randomUUID(), '订单编号', 64, true)
    const exchangeClientOrderId = text(input.exchangeClientOrderId, '交易所客户端订单编号', 64, true)
    const createdAt = now()
    const order = {
      id,
      sessionId: text(input.sessionId, '会话编号', 160),
      exchange: text(input.exchange ?? 'okx', '交易所', 32, true).toLowerCase(),
      profile: text(input.profile ?? 'default', '账户名称', 80),
      market: text(input.market ?? 'spot', '市场类型', 32, true).toLowerCase(),
      instrument: text(input.instrument ?? input.instId, '交易标的', 80, true).toUpperCase(),
      side: text(input.side, '订单方向', 16).toLowerCase(),
      orderType: text(input.orderType, '订单类型', 32).toLowerCase(),
      size: text(input.size, '订单数量', 48),
      requestedPrice: orderNumber(input.requestedPrice),
      referencePrice: orderNumber(input.referencePrice),
      notionalUsdt: orderNumber(input.notionalUsdt),
      exchangeClientOrderId,
      exchangeOrderId: null,
      state: 'received',
      exchangeState: null,
      filledSize: null,
      averageFillPrice: null,
      fee: null,
      createdAt,
      updatedAt: createdAt,
      terminalAt: null,
      reconciliation: { attempts: 0, lastCheckedAt: null, nextCheckAt: null, lastError: null },
      timeline: [{ id: randomUUID(), at: createdAt, from: null, to: 'received', source: 'clustr', reason: '交易指令已接收', facts: {} }],
    }
    return this.store.mutate((state) => {
      state.orders ??= []
      if (state.orders.some((item) => item.id === id || item.exchangeClientOrderId === exchangeClientOrderId)) throw new Error('订单编号已经存在')
      state.orders.unshift(order)
      state.orders = state.orders.slice(0, 500)
      trace(state, { action: 'order.lifecycle-created', entityType: 'order', entityId: id, facts: { exchange: order.exchange, instrument: order.instrument, exchangeClientOrderId } })
      return order
    })
  }

  async transitionOrderLifecycle(id, input = {}) {
    const orderId = text(id, '订单编号', 64, true)
    return this.store.mutate((state) => {
      state.orders ??= []
      const order = state.orders.find((item) => item.id === orderId)
      if (!order) throw new Error('订单生命周期不存在')
      const nextState = orderState(input.state, order.state)
      const currentState = orderState(order.state)
      if (nextState !== currentState && !ORDER_TRANSITIONS[currentState]?.has(nextState)) {
        throw new Error(`订单不能从 ${currentState} 变为 ${nextState}`)
      }
      const changedAt = now()
      const facts = redact({
        exchangeState: input.exchangeState == null ? undefined : String(input.exchangeState).slice(0, 40),
        exchangeOrderId: input.exchangeOrderId == null ? undefined : String(input.exchangeOrderId).slice(0, 80),
        filledSize: orderNumber(input.filledSize),
        averageFillPrice: orderNumber(input.averageFillPrice ?? input.fillPrice),
        fee: orderNumber(input.fee),
      })
      order.state = nextState
      order.exchangeState = facts.exchangeState ?? order.exchangeState
      order.exchangeOrderId = facts.exchangeOrderId ?? order.exchangeOrderId
      order.filledSize = facts.filledSize ?? order.filledSize
      order.averageFillPrice = facts.averageFillPrice ?? order.averageFillPrice
      order.fee = facts.fee ?? order.fee
      order.updatedAt = changedAt
      if (ORDER_TERMINAL_STATES.has(nextState)) order.terminalAt = changedAt
      else order.terminalAt = null
      if (input.reconciliation === true) {
        const attempts = Math.max(0, Number(order.reconciliation?.attempts ?? 0)) + 1
        const delayMs = Math.min(300_000, 15_000 * (2 ** Math.min(attempts - 1, 5)))
        order.reconciliation = {
          attempts,
          lastCheckedAt: changedAt,
          nextCheckAt: ORDER_TERMINAL_STATES.has(nextState) ? null : new Date(Date.now() + delayMs).toISOString(),
          lastError: input.error ? text(input.error, '核对错误', 240) : null,
        }
      } else if (ORDER_TERMINAL_STATES.has(nextState)) {
        order.reconciliation = { ...(order.reconciliation ?? {}), nextCheckAt: null, lastError: null }
      }
      const timeline = {
        id: randomUUID(), at: changedAt, from: currentState, to: nextState,
        source: text(input.source ?? 'clustr', '订单状态来源', 40),
        reason: input.reason ? text(input.reason, '订单状态说明', 240) : null,
        facts,
      }
      order.timeline ??= []
      order.timeline.push(timeline)
      order.timeline = order.timeline.slice(-60)
      trace(state, { action: 'order.lifecycle-transition', entityType: 'order', entityId: orderId, source: timeline.source, facts: { from: currentState, to: nextState, ...facts }, judgment: { reason: timeline.reason }, result: ORDER_TERMINAL_STATES.has(nextState) && nextState !== 'filled' && nextState !== 'canceled' ? nextState : 'ok' })
      return order
    })
  }

  async findOrderLifecycle(input = {}) {
    const state = await this.store.load()
    const id = String(input.id ?? '')
    const exchangeClientOrderId = String(input.exchangeClientOrderId ?? input.clientOrderId ?? '')
    const exchangeOrderId = String(input.exchangeOrderId ?? input.orderId ?? '')
    const order = (state.orders ?? []).find((item) => (id && item.id === id) || (exchangeClientOrderId && item.exchangeClientOrderId === exchangeClientOrderId) || (exchangeOrderId && item.exchangeOrderId === exchangeOrderId))
    return order ? clone(order) : null
  }

  async listOrderLifecycles({ sessionId, activeOnly = false, dueOnly = false, limit = 100 } = {}) {
    const state = await this.store.load()
    const currentTime = Date.now()
    return (state.orders ?? [])
      .filter((item) => !sessionId || item.sessionId === String(sessionId))
      .filter((item) => !activeOnly || !ORDER_TERMINAL_STATES.has(orderState(item.state, 'unknown')))
      .filter((item) => !dueOnly || !item.reconciliation?.nextCheckAt || Date.parse(item.reconciliation.nextCheckAt) <= currentTime)
      .slice(0, clamp(Number(limit) || 100, 1, 500))
      .map(clone)
  }

  async noteOrderReconciliation(id, input = {}) {
    const existing = await this.findOrderLifecycle({ id })
    if (!existing) return { found: false }
    const ageMs = Date.now() - Date.parse(existing.createdAt)
    const existingState = orderState(existing.state, 'unknown')
    const nextState = ageMs > 24 * 60 * 60_000
      ? 'manual-review'
      : existingState === 'submitting'
        ? 'unknown'
        : ['unknown', 'reconciling'].includes(existingState)
          ? 'reconciling'
          : existingState
    const order = await this.transitionOrderLifecycle(id, {
      state: nextState,
      source: 'exchange-reconciliation',
      reason: ageMs > 24 * 60 * 60_000 ? '交易所状态超过 24 小时仍无法确认，需要人工核对' : '正在向交易所核对订单状态',
      error: input.error,
      reconciliation: true,
    })
    return { found: true, order }
  }

  async recordMemory(input = {}) {
    const memory = {
      id: randomUUID(), recordedAt: now(), thesisId: input.thesisId ? String(input.thesisId) : null,
      instrument: text(input.instrument ?? input.instId, '交易标的', 64, true).toUpperCase(),
      outcomeR: finite(input.outcomeR), pnlUsdt: finite(input.pnlUsdt),
      followedPlan: Boolean(input.followedPlan),
      analysisQuality: clamp(finite(input.analysisQuality) ?? 0.5, 0, 1),
      executionQuality: clamp(finite(input.executionQuality) ?? 0.5, 0, 1),
      lesson: text(input.lesson, '复盘结论', 1200, true),
      errorTags: list(input.errorTags, 12).map((item) => text(item, '错误标签', 80, true)),
      facts: input.facts && typeof input.facts === 'object' ? redact(input.facts) : {},
    }
    return this.store.mutate((state) => {
      state.memories.unshift(memory)
      state.memories = state.memories.slice(0, 1000)
      trace(state, { action: 'memory.recorded', entityType: 'memory', entityId: memory.id, facts: { thesisId: memory.thesisId, instrument: memory.instrument, outcomeR: memory.outcomeR, followedPlan: memory.followedPlan }, judgment: { lesson: memory.lesson, analysisQuality: memory.analysisQuality, executionQuality: memory.executionQuality } })
      return memory
    })
  }

  async memoryReview({ instrument, limit = 200 } = {}) {
    const state = await this.store.load()
    const rows = state.memories.filter((item) => !instrument || item.instrument === String(instrument).toUpperCase()).slice(0, clamp(Number(limit) || 200, 1, 1000))
    const withOutcome = rows.filter((item) => item.outcomeR != null)
    const tagCounts = new Map()
    for (const row of rows) for (const tag of row.errorTags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    return {
      count: rows.length,
      averageOutcomeR: withOutcome.length ? withOutcome.reduce((sum, item) => sum + item.outcomeR, 0) / withOutcome.length : null,
      planAdherence: rows.length ? rows.filter((item) => item.followedPlan).length / rows.length : null,
      averageAnalysisQuality: rows.length ? rows.reduce((sum, item) => sum + item.analysisQuality, 0) / rows.length : null,
      averageExecutionQuality: rows.length ? rows.reduce((sum, item) => sum + item.executionQuality, 0) / rows.length : null,
      repeatedErrors: [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag, count]) => ({ tag, count })),
      recent: rows.slice(0, 20),
    }
  }

  async provenance({ entityType, entityId, limit = 100 } = {}) {
    const state = await this.store.load()
    return state.provenance.filter((item) => (!entityType || item.entityType === entityType) && (!entityId || item.entityId === entityId)).slice(0, clamp(Number(limit) || 100, 1, 500)).map(clone)
  }
}

export { AUTONOMY, TEAM_ROLES }
