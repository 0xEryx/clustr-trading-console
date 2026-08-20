import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { SessionBindingStore } from '../src/session-binding.js'

test('the explicit trading-session binding survives service restart and keeps private permissions', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'clustr-session-binding-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const file = join(directory, 'binding.json')

  await new SessionBindingStore(file).bind('clustr-a')
  const restarted = new SessionBindingStore(file)
  assert.equal((await restarted.read()).sessionId, 'clustr-a')
  assert.match(await readFile(file, 'utf8'), /clustr-a/)
  assert.equal((await stat(file)).mode & 0o777, 0o600)
})

test('the store never replaces or clears a different binding implicitly', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'clustr-session-binding-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const store = new SessionBindingStore(join(directory, 'binding.json'))
  await store.bind('clustr-a')

  await assert.rejects(() => store.bind('clustr-b'), /明确确认/)
  await assert.rejects(() => store.clear('clustr-b'), /不是当前启用/)
  assert.equal((await store.read()).sessionId, 'clustr-a')

  await store.bind('clustr-b', { replace: true })
  assert.equal((await store.read()).sessionId, 'clustr-b')
  await store.clear('clustr-b')
  assert.equal(await store.read(), null)
})

test('a damaged binding file fails closed instead of selecting another session', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'clustr-session-binding-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const file = join(directory, 'binding.json')
  await writeFile(file, '{broken', { mode: 0o600 })

  await assert.rejects(() => new SessionBindingStore(file).read(), /不会自动改绑/)
})
