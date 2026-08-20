import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { ExecutionPolicyStore } from '../src/execution-policy.js'

async function fixture(options = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'clustr-execution-policy-'))
  const file = join(directory, 'policy.json')
  return { directory, file, store: new ExecutionPolicyStore({ file, ...options }) }
}

test('defaults to read-only and requires an explicit confirmation to unlock', async (t) => {
  const value = await fixture()
  t.after(() => rm(value.directory, { recursive: true, force: true }))
  assert.equal((await value.store.status()).readOnly, true)
  await assert.rejects(value.store.set({ readOnly: false, durationMinutes: 60, reason: 'test', exchange: 'binance', profile: 'default' }), /明确确认/)
  assert.equal((await value.store.status()).readOnly, true)
})

test('persists a time-bounded approval-trading mode with private permissions', async (t) => {
  const value = await fixture()
  t.after(() => rm(value.directory, { recursive: true, force: true }))
  const unlocked = await value.store.set({ readOnly: false, confirmed: true, durationMinutes: 60, actor: 'user', reason: '逐笔审批测试', exchange: 'binance', profile: 'primary' })
  assert.equal(unlocked.mode, 'approval-trading')
  assert.equal(unlocked.exchange, 'binance')
  assert.equal(unlocked.profile, 'primary')
  assert.ok(Date.parse(unlocked.expiresAt) > Date.now())
  const stat = await readFile(value.file, 'utf8')
  assert.match(stat, /"readOnly": false/)
})

test('expired authorization fails closed and is written back as read-only', async (t) => {
  const value = await fixture()
  t.after(() => rm(value.directory, { recursive: true, force: true }))
  await writeFile(value.file, JSON.stringify({ schemaVersion: 2, readOnly: false, exchange: 'binance', profile: 'default', updatedAt: new Date(0).toISOString(), unlockedAt: new Date(0).toISOString(), expiresAt: new Date(1).toISOString(), actor: 'user', reason: 'expired' }))
  const status = await value.store.status()
  assert.equal(status.readOnly, true)
  assert.equal(status.expired, true)
  assert.equal(JSON.parse(await readFile(value.file, 'utf8')).readOnly, true)
})

test('administrator lock refuses user unlock', async (t) => {
  const value = await fixture({ allowUnlock: false })
  t.after(() => rm(value.directory, { recursive: true, force: true }))
  await assert.rejects(value.store.set({ readOnly: false, confirmed: true, durationMinutes: 60, reason: 'test', exchange: 'binance', profile: 'default' }), /管理员锁定/)
})

test('persists an explicitly selected Bybit execution account', async (t) => {
  const value = await fixture()
  t.after(() => rm(value.directory, { recursive: true, force: true }))
  const unlocked = await value.store.set({ readOnly: false, confirmed: true, durationMinutes: 30, actor: 'user', reason: 'Bybit MCP execution', exchange: 'bybit', profile: 'primary' })
  assert.equal(unlocked.exchange, 'bybit')
  assert.equal(unlocked.profile, 'primary')
})

test('corrupt state is preserved and fails closed', async (t) => {
  const value = await fixture()
  t.after(() => rm(value.directory, { recursive: true, force: true }))
  await writeFile(value.file, '{broken')
  await assert.rejects(value.store.status(), /保持拒绝写操作/)
  assert.equal(await readFile(value.file, 'utf8'), '{broken')
})

test('legacy unlocked policy cannot silently authorize an unspecified account', async (t) => {
  const value = await fixture()
  t.after(() => rm(value.directory, { recursive: true, force: true }))
  await writeFile(value.file, JSON.stringify({ schemaVersion: 1, readOnly: false, updatedAt: new Date().toISOString(), unlockedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), actor: 'user', reason: 'legacy' }))
  await assert.rejects(value.store.status(), /保持拒绝写操作/)
})
