import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { chmod, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'

const DEFAULT_FILE = join(homedir(), '.dsh', 'clustr', 'trading-session.json')

function normalizeSessionId(value) {
  const sessionId = String(value ?? '').trim()
  if (!sessionId) throw new Error('请选择要启用的交易会话')
  if (sessionId.length > 256 || !/^[a-zA-Z0-9._:-]+$/.test(sessionId)) throw new Error('交易会话标识无效')
  return sessionId
}

function clone(value) { return value == null ? value : structuredClone(value) }

export class SessionBindingStore {
  constructor(file = DEFAULT_FILE) {
    this.file = file
    this.writeQueue = Promise.resolve()
  }

  async read() {
    let parsed
    try {
      parsed = JSON.parse(await readFile(this.file, 'utf8'))
    } catch (error) {
      if (error?.code === 'ENOENT') return null
      throw new Error('Clustr 专属交易会话绑定无法读取；原文件已保留，系统不会自动改绑。')
    }
    if (parsed?.schemaVersion !== 1 || typeof parsed?.sessionId !== 'string' || !parsed.sessionId) {
      throw new Error('Clustr 专属交易会话绑定格式无效；系统不会自动改绑。')
    }
    return clone(parsed)
  }

  async bind(sessionId, { replace = false } = {}) {
    const id = normalizeSessionId(sessionId)
    return this.#enqueue(async () => {
      const current = await this.read()
      if (current?.sessionId && current.sessionId !== id && replace !== true) {
        const error = new Error('另一个 Clustr 交易会话已启用；需要明确确认后才能切换。')
        error.code = 'TRADING_SESSION_ALREADY_BOUND'
        throw error
      }
      if (current?.sessionId === id) return current
      const timestamp = new Date().toISOString()
      const next = {
        schemaVersion: 1,
        sessionId: id,
        boundAt: current?.boundAt ?? timestamp,
        updatedAt: timestamp,
      }
      await this.#write(next)
      return clone(next)
    })
  }

  async clear(expectedSessionId = null) {
    const expected = expectedSessionId == null || expectedSessionId === '' ? null : normalizeSessionId(expectedSessionId)
    return this.#enqueue(async () => {
      const current = await this.read()
      if (!current) return false
      if (expected && current.sessionId !== expected) {
        const error = new Error('目标会话不是当前启用的 Clustr 交易会话')
        error.code = 'TRADING_SESSION_BINDING_CHANGED'
        throw error
      }
      try {
        await unlink(this.file)
      } catch (error) {
        if (error?.code !== 'ENOENT') throw new Error('无法解除 Clustr 专属交易会话；现有绑定保持不变。')
      }
      return true
    })
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
    } catch (error) {
      await unlink(temporary).catch(() => {})
      throw new Error('无法保存 Clustr 专属交易会话；现有绑定保持不变。')
    }
  }
}

