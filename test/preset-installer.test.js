import assert from 'node:assert/strict'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { inspectPreset, installPreset, presetPath, removePreset } from '../src/preset-installer.js'

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'clustr-preset-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return root
}

test('preset installer creates a managed preset and is idempotent', async (t) => {
  const dshHome = await fixture(t)
  const first = await installPreset({ dshHome })
  assert.equal(first.state, 'installed')
  assert.match(await readFile(join(first.target, 'agent.cordis.yml'), 'utf8'), /@clustrai\/trading-console\/agent-prompt/)
  assert.equal((await inspectPreset({ dshHome })).state, 'managed')
  assert.equal((await installPreset({ dshHome })).state, 'current')
})

test('preset installer refuses to overwrite an unmanaged preset', async (t) => {
  const dshHome = await fixture(t)
  const target = presetPath(dshHome)
  await mkdir(target, { recursive: true })
  await writeFile(join(target, 'agent.cordis.yml'), '[]\n')
  await assert.rejects(() => installPreset({ dshHome }), (error) => error?.code === 'PRESET_EXISTS')
})

test('preset installer refuses modified managed files and force retains a backup', async (t) => {
  const dshHome = await fixture(t)
  const installed = await installPreset({ dshHome })
  await writeFile(join(installed.target, 'agent.cordis.yml'), '[]\n')
  assert.equal((await inspectPreset({ dshHome })).state, 'modified')
  await assert.rejects(() => installPreset({ dshHome }), (error) => error?.code === 'PRESET_MODIFIED')
  const forced = await installPreset({ dshHome, force: true })
  assert.equal(forced.state, 'updated')
  assert.ok(forced.backup)
  await access(forced.backup)
  assert.match(await readFile(join(forced.target, 'agent.cordis.yml'), 'utf8'), /@clustrai\/trading-console\/agent-prompt/)
})

test('preset remover deletes only an unmodified managed preset', async (t) => {
  const dshHome = await fixture(t)
  await installPreset({ dshHome })
  assert.equal((await removePreset({ dshHome })).state, 'removed')
  assert.equal((await inspectPreset({ dshHome })).state, 'missing')

  await installPreset({ dshHome })
  await writeFile(join(presetPath(dshHome), 'agent.cordis.yml'), '[]\n')
  await assert.rejects(() => removePreset({ dshHome }), (error) => error?.code === 'PRESET_MODIFIED')
  const forced = await removePreset({ dshHome, force: true })
  assert.equal(forced.state, 'retained')
  await access(forced.backup)
})
