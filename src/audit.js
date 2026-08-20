import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import { mkdir, rename, writeFile } from 'node:fs/promises'

const FILE = join(homedir(), '.dsh', 'clustr', 'decision-tape.json')
const SECRET_KEY = /api.?key|secret|passphrase|private.?key|mnemonic|seed|signature|authorization/i
let ring = []
let writeQueue = Promise.resolve()
let persistenceError = null

function redact(value, key = '') {
  if (SECRET_KEY.test(key)) return '[REDACTED]'
  if (Array.isArray(value)) return value.map((item) => redact(item))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, redact(child, childKey)]))
  return value
}

try {
  const parsed = JSON.parse(readFileSync(FILE, 'utf8'))
  if (Array.isArray(parsed)) ring = parsed.slice(0, 500).map((item) => redact(item))
} catch (error) {
  if (error?.code !== 'ENOENT') persistenceError = '本地决策记录无法读取'
}

function persist() {
  const snapshot = JSON.stringify(ring, null, 2)
  writeQueue = writeQueue.catch(() => {}).then(async () => {
    await mkdir(dirname(FILE), { recursive: true, mode: 0o700 })
    const temporary = `${FILE}.${randomUUID()}.tmp`
    await writeFile(temporary, snapshot, { mode: 0o600 })
    await rename(temporary, FILE)
    persistenceError = null
  }).catch(() => { persistenceError = '本地决策记录无法保存' })
}

export function append(entry) {
  ring.unshift(redact({ id: entry?.id ?? randomUUID(), ...entry }))
  if (ring.length > 500) ring = ring.slice(0, 500)
  persist()
}

export function entries() { return ring.map((item) => structuredClone(item)) }
export function status() { return { file: FILE, retainedEntries: ring.length, persistenceError } }
