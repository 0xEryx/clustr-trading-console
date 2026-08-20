import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { mkdir, rename, writeFile } from 'node:fs/promises'

const DEFAULT_FILE = join(homedir(), '.dsh', 'clustr', 'credential-index.json')

function normalizeRows(value) {
  if (!Array.isArray(value)) return []
  const unique = new Map()
  for (const row of value) {
    const exchange = String(row?.exchange ?? '').trim().toLowerCase()
    const profile = String(row?.profile ?? '').trim().toLowerCase()
    if (!/^[a-z0-9_-]{1,24}$/.test(exchange) || !/^[a-z0-9_-]{1,32}$/.test(profile)) continue
    unique.set(`${exchange}:${profile}`, { exchange, profile })
  }
  return [...unique.values()].sort((a, b) => a.exchange.localeCompare(b.exchange) || a.profile.localeCompare(b.profile))
}

export class CredentialIndex {
  constructor({ file = DEFAULT_FILE } = {}) {
    this.file = file
    this.writeQueue = Promise.resolve()
  }

  async readNow() {
    try {
      const parsed = JSON.parse(await readFile(this.file, 'utf8'))
      return normalizeRows(parsed?.accounts ?? parsed)
    } catch (error) {
      if (error?.code === 'ENOENT') return []
      throw new Error('本地凭证索引无法读取')
    }
  }

  async list() {
    await this.writeQueue.catch(() => {})
    return this.readNow()
  }

  async writeNow(accounts) {
    const payload = JSON.stringify({ version: 1, accounts: normalizeRows(accounts) }, null, 2)
    await mkdir(dirname(this.file), { recursive: true, mode: 0o700 })
    const temporary = `${this.file}.${randomUUID()}.tmp`
    await writeFile(temporary, payload, { mode: 0o600 })
    await rename(temporary, this.file)
  }

  async write(accounts) {
    this.writeQueue = this.writeQueue.catch(() => {}).then(() => this.writeNow(accounts))
    return this.writeQueue
  }

  async update(transform) {
    this.writeQueue = this.writeQueue.catch(() => {}).then(async () => {
      const current = await this.readNow()
      await this.writeNow(transform(current))
    })
    return this.writeQueue
  }

  async add(exchange, profile) {
    await this.update((accounts) => [...accounts, { exchange, profile }])
  }

  async remove(exchange, profile) {
    await this.update((accounts) => accounts.filter((row) => row.exchange !== exchange || row.profile !== profile))
  }
}

export const __test = { normalizeRows }
