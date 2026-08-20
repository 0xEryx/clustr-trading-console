import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { chmod, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'

const DEFAULT_FILE = join(homedir(), '.dsh', 'clustr', 'execution-policy.json')

function clone(value) { return structuredClone(value) }

function actor(value) {
  const result = String(value ?? 'user').trim()
  if (!result || result.length > 80) throw new Error('执行模式操作者无效')
  return result
}

function reason(value, required = false) {
  const result = String(value ?? '').trim()
  if (required && !result) throw new Error('请说明执行模式变更原因')
  if (result.length > 300) throw new Error('执行模式变更原因不能超过 300 个字符')
  return result || null
}

function duration(value, maximum) {
  const minutes = Number(value)
  if (!Number.isInteger(minutes) || minutes < 15 || minutes > maximum) {
    throw new Error(`逐笔审批交易的有效期必须在 15–${maximum} 分钟之间`)
  }
  return minutes
}

function executionAccount(exchangeValue, profileValue) {
  const exchange = String(exchangeValue ?? '').trim().toLowerCase()
  const profile = String(profileValue ?? '').trim().toLowerCase()
  if (!['okx', 'binance', 'bybit'].includes(exchange)) throw new Error('执行交易所必须是 OKX、Binance 或 Bybit')
  if (!profile || profile.length > 64 || !/^[a-z0-9._-]+$/.test(profile)) throw new Error('执行账户名称无效')
  return { exchange, profile }
}

export class ExecutionPolicyStore {
  constructor({ file = DEFAULT_FILE, defaultReadOnly = true, allowUnlock = true, maxUnlockMinutes = 480 } = {}) {
    this.file = file
    this.defaultReadOnly = defaultReadOnly !== false
    this.allowUnlock = allowUnlock !== false
    this.maxUnlockMinutes = Math.min(1440, Math.max(15, Number(maxUnlockMinutes) || 480))
    this.writeQueue = Promise.resolve()
  }

  async status() {
    const current = await this.#read()
    if (current.readOnly === false && current.expiresAt && Date.parse(current.expiresAt) <= Date.now()) {
      return this.#enqueue(async () => {
        const latest = await this.#read()
        if (latest.readOnly !== false || !latest.expiresAt || Date.parse(latest.expiresAt) > Date.now()) return this.#public(latest)
        const locked = {
          schemaVersion: 2,
          readOnly: true,
          exchange: null,
          profile: null,
          updatedAt: new Date().toISOString(),
          unlockedAt: null,
          expiresAt: null,
          actor: 'system',
          reason: '逐笔审批交易授权已到期，系统自动恢复只读保护',
        }
        await this.#write(locked)
        return this.#public(locked, { expired: true })
      })
    }
    return this.#public(current)
  }

  async set({ readOnly, confirmed, durationMinutes, actor: changedBy, reason: changeReason, exchange, profile } = {}) {
    if (confirmed !== true) throw new Error('执行模式变更需要明确确认')
    const nextReadOnly = readOnly !== false
    if (!nextReadOnly && !this.allowUnlock) throw new Error('此安装已由管理员锁定为只读模式')
    const changedAt = new Date()
    const account = nextReadOnly ? { exchange: null, profile: null } : executionAccount(exchange, profile)
    const next = {
      schemaVersion: 2,
      readOnly: nextReadOnly,
      ...account,
      updatedAt: changedAt.toISOString(),
      unlockedAt: nextReadOnly ? null : changedAt.toISOString(),
      expiresAt: nextReadOnly ? null : new Date(changedAt.getTime() + duration(durationMinutes, this.maxUnlockMinutes) * 60_000).toISOString(),
      actor: actor(changedBy),
      reason: reason(changeReason, !nextReadOnly),
    }
    return this.#enqueue(async () => {
      await this.#write(next)
      return this.#public(next)
    })
  }

  async #read() {
    try {
      const parsed = JSON.parse(await readFile(this.file, 'utf8'))
      if (![1, 2].includes(parsed?.schemaVersion) || typeof parsed?.readOnly !== 'boolean') throw new Error('invalid')
      if (parsed.readOnly === false && (!parsed.expiresAt || !Number.isFinite(Date.parse(parsed.expiresAt)))) throw new Error('invalid')
      if (parsed.schemaVersion === 1) {
        if (parsed.readOnly === false) throw new Error('legacy-unlocked')
        return { ...parsed, schemaVersion: 2, exchange: null, profile: null }
      }
      if (parsed.readOnly === false) executionAccount(parsed.exchange, parsed.profile)
      return parsed
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return {
          schemaVersion: 2,
          readOnly: this.defaultReadOnly,
          exchange: null,
          profile: null,
          updatedAt: null,
          unlockedAt: null,
          expiresAt: null,
          actor: 'configuration',
          reason: this.defaultReadOnly ? '默认只读保护' : '安装配置允许交易执行',
        }
      }
      throw new Error('Clustr 执行模式状态无法读取；系统保持拒绝写操作，原文件已保留。')
    }
  }

  #public(value, extra = {}) {
    return {
      readOnly: value.readOnly !== false,
      mode: value.readOnly === false ? 'approval-trading' : 'read-only',
      allowUnlock: this.allowUnlock,
      maxUnlockMinutes: this.maxUnlockMinutes,
      updatedAt: value.updatedAt ?? null,
      unlockedAt: value.unlockedAt ?? null,
      expiresAt: value.expiresAt ?? null,
      actor: value.actor ?? null,
      reason: value.reason ?? null,
      exchange: value.readOnly === false ? value.exchange ?? null : null,
      profile: value.readOnly === false ? value.profile ?? null : null,
      ...extra,
    }
  }

  #enqueue(operation) {
    const next = this.writeQueue.catch(() => {}).then(operation)
    this.writeQueue = next.then(() => undefined, () => undefined)
    return next
  }

  async #write(value) {
    await mkdir(dirname(this.file), { recursive: true, mode: 0o700 })
    const temporary = `${this.file}.${randomUUID()}.tmp`
    try {
      await writeFile(temporary, JSON.stringify(value, null, 2), { mode: 0o600 })
      await chmod(temporary, 0o600).catch(() => {})
      await rename(temporary, this.file)
    } catch {
      await unlink(temporary).catch(() => {})
      throw new Error('无法保存 Clustr 执行模式；现有保护状态保持不变。')
    }
  }
}
