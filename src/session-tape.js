import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const DEFAULT_FILE = join(homedir(), '.dsh', 'clustr', 'session-tape.json')
const SECRET_KEY = /api.?key|secret|passphrase|private.?key|mnemonic|seed|signature|authorization|risk.?permit/i
const DETAIL_KEYS = new Set(['notionalUsdt', 'referencePrice', 'requestedPrice', 'fillPrice', 'slippageBps', 'exchangeOrderId', 'exchangeClientOrderId', 'exchangeState', 'reason', 'approval', 'riskDecision'])

function finite(value) { if (value == null || value === '') return null; const number = Number(value); return Number.isFinite(number) ? number : null }
function text(value, max = 240) {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/((?:api.?key|secret.?key|passphrase|private.?key|mnemonic|seed|authorization|bearer)\s*(?:=|:)\s*)[^\s,;]+/gi, '$1[REDACTED]')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, max)
}
function clone(value) { return structuredClone(value) }

function safeDetails(value) {
  if (!value || typeof value !== 'object') return {}
  const output = {}
  for (const [key, child] of Object.entries(value)) {
    if (!DETAIL_KEYS.has(key) || SECRET_KEY.test(key)) continue
    if (typeof child === 'number') output[key] = finite(child)
    else if (typeof child === 'boolean') output[key] = child
    else output[key] = text(child)
  }
  return output
}

function percentile(values, ratio) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!sorted.length) return null
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))]
}

function slippageBps(referencePrice, fillPrice, side) {
  const reference = finite(referencePrice)
  const fill = finite(fillPrice)
  if (!(reference > 0) || !(fill > 0)) return null
  const direction = String(side).toLowerCase() === 'sell' ? -1 : 1
  return ((fill - reference) / reference) * 10_000 * direction
}

export class SessionTapeStore {
  constructor({ file = DEFAULT_FILE, maxEntries = 300 } = {}) {
    this.file = file
    this.maxEntries = maxEntries
    this.entries = []
    this.writeQueue = Promise.resolve()
    this.persistenceError = null
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8'))
      if (Array.isArray(parsed)) this.entries = parsed.slice(0, maxEntries).map((entry) => this.#normalizeLoaded(entry)).filter(Boolean)
    } catch (error) {
      if (error?.code !== 'ENOENT') this.persistenceError = 'Session Tape 本地记录无法读取'
    }
  }

  #normalizeLoaded(entry) {
    if (!entry || typeof entry !== 'object' || !entry.id) return null
    return {
      id: text(entry.id, 80), sessionId: text(entry.sessionId, 160), callId: text(entry.callId, 160),
      startedAt: finite(entry.startedAt), finishedAt: finite(entry.finishedAt), status: text(entry.status, 40) || 'unknown',
      command: {
        exchange: text(entry.command?.exchange, 32), action: text(entry.command?.action, 32), market: text(entry.command?.market, 32),
        instrument: text(entry.command?.instrument, 80), side: text(entry.command?.side, 16), orderType: text(entry.command?.orderType, 32),
        size: text(entry.command?.size, 48), requestedPrice: finite(entry.command?.requestedPrice), referencePrice: finite(entry.command?.referencePrice),
        clientOrderId: text(entry.command?.clientOrderId, 80),
      },
      result: safeDetails(entry.result),
      metrics: { responseTimeMs: finite(entry.metrics?.responseTimeMs), approvalTimeMs: finite(entry.metrics?.approvalTimeMs), exchangeAckTimeMs: finite(entry.metrics?.exchangeAckTimeMs), slippageBps: finite(entry.metrics?.slippageBps) },
      stages: Array.isArray(entry.stages) ? entry.stages.slice(0, 20).map((stage) => ({ name: text(stage.name, 40), label: text(stage.label, 80), status: text(stage.status, 32), at: finite(stage.at), offsetMs: finite(stage.offsetMs), latencyMs: finite(stage.latencyMs), details: safeDetails(stage.details) })) : [],
    }
  }

  #persist() {
    const snapshot = JSON.stringify(this.entries, null, 2)
    this.writeQueue = this.writeQueue.catch(() => {}).then(async () => {
      await mkdir(dirname(this.file), { recursive: true, mode: 0o700 })
      const temporary = `${this.file}.${randomUUID()}.tmp`
      await writeFile(temporary, snapshot, { mode: 0o600 })
      await rename(temporary, this.file)
      this.persistenceError = null
    }).catch(() => { this.persistenceError = 'Session Tape 本地记录无法保存' })
  }

  start(input = {}) {
    const startedAt = Date.now()
    const entry = {
      id: randomUUID(),
      sessionId: text(input.sessionId, 160),
      callId: text(input.callId, 160),
      startedAt,
      finishedAt: null,
      status: 'received',
      command: {
        exchange: text(input.exchange ?? 'okx', 32), action: text(input.action, 32), market: text(input.market, 32),
        instrument: text(input.instrument, 80).toUpperCase(), side: text(input.side, 16).toLowerCase(), orderType: text(input.orderType, 32),
        size: text(input.size, 48), requestedPrice: finite(input.requestedPrice), referencePrice: finite(input.referencePrice),
        clientOrderId: text(input.clientOrderId, 80),
      },
      result: {},
      metrics: { responseTimeMs: null, approvalTimeMs: null, exchangeAckTimeMs: null, slippageBps: null },
      stages: [{ name: 'received', label: '指令已接收', status: 'ok', at: startedAt, offsetMs: 0, latencyMs: null, details: {} }],
    }
    this.entries.unshift(entry)
    if (this.entries.length > this.maxEntries) this.entries = this.entries.slice(0, this.maxEntries)
    this.#persist()
    return clone(entry)
  }

  stage(id, input = {}) {
    const entry = this.entries.find((item) => item.id === id)
    if (!entry) return null
    const at = finite(input.at) ?? Date.now()
    entry.stages.push({ name: text(input.name, 40), label: text(input.label, 80), status: text(input.status ?? 'ok', 32), at, offsetMs: Math.max(0, at - entry.startedAt), latencyMs: finite(input.latencyMs), details: safeDetails(input.details) })
    if (entry.stages.length > 20) entry.stages = entry.stages.slice(-20)
    if (input.metric === 'approval') entry.metrics.approvalTimeMs = finite(input.latencyMs)
    if (input.metric === 'exchange-ack') entry.metrics.exchangeAckTimeMs = finite(input.latencyMs)
    this.#persist()
    return clone(entry)
  }

  finish(id, input = {}) {
    const entry = this.entries.find((item) => item.id === id)
    if (!entry) return null
    const finishedAt = finite(input.finishedAt) ?? Date.now()
    entry.finishedAt = finishedAt
    entry.status = text(input.status ?? 'unknown', 40)
    entry.result = safeDetails(input.result)
    entry.metrics.responseTimeMs = Math.max(0, finishedAt - entry.startedAt)
    const reference = finite(input.result?.referencePrice) ?? entry.command.referencePrice
    const fill = finite(input.result?.fillPrice)
    entry.metrics.slippageBps = finite(input.result?.slippageBps) ?? slippageBps(reference, fill, entry.command.side)
    this.stage(id, { name: 'completed', label: text(input.label ?? '指令处理完成', 80), status: entry.status, at: finishedAt, details: entry.result })
    this.#persist()
    return clone(entry)
  }

  reconcileByClientOrderId(clientOrderId, input = {}) {
    const target = text(clientOrderId, 80)
    const entry = this.entries.find((item) => item.command.clientOrderId === target)
    if (!entry) return null
    const result = { ...entry.result, ...safeDetails(input) }
    entry.result = result
    entry.status = text(input.status ?? entry.status, 40)
    const reference = finite(result.referencePrice) ?? entry.command.referencePrice
    const fill = finite(result.fillPrice)
    entry.metrics.slippageBps = finite(result.slippageBps) ?? slippageBps(reference, fill, entry.command.side)
    this.stage(entry.id, { name: 'reconciled', label: '交易所状态已核对', status: entry.status, details: result })
    this.#persist()
    return clone(entry)
  }

  list({ sessionId, limit = 40 } = {}) {
    const normalizedSession = text(sessionId, 160)
    const bounded = Math.min(100, Math.max(1, Number(limit) || 40))
    const rows = this.entries.filter((entry) => !normalizedSession || entry.sessionId === normalizedSession).slice(0, bounded)
    const responseTimes = rows.map((entry) => entry.metrics.responseTimeMs).filter(Number.isFinite)
    const slippages = rows.map((entry) => entry.metrics.slippageBps).filter(Number.isFinite)
    return {
      entries: clone(rows),
      metrics: {
        commands: rows.length,
        completed: rows.filter((entry) => ['ok', 'accepted', 'filled', 'reconciled'].includes(entry.status)).length,
        rejected: rows.filter((entry) => ['rejected', 'denied', 'error'].includes(entry.status)).length,
        unknown: rows.filter((entry) => ['unknown', 'reconciling'].includes(entry.status)).length,
        responseP50Ms: percentile(responseTimes, 0.5),
        responseP95Ms: percentile(responseTimes, 0.95),
        averageMeasuredSlippageBps: slippages.length ? slippages.reduce((total, value) => total + value, 0) / slippages.length : null,
        measuredSlippageSamples: slippages.length,
      },
      persistence: { file: this.file, retainedEntries: this.entries.length, persistenceError: this.persistenceError },
    }
  }

  async flush() { await this.writeQueue }
}

export const sessionTapeContract = Object.freeze({ file: DEFAULT_FILE, metricMeaning: '滑点仅在交易所返回可核验成交均价时计算；正值表示相对提交参考价的不利滑点。' })
