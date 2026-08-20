import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CredentialIndex } from '../src/credential-index.js'

test('credential index serializes concurrent account updates without storing secrets', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'clustr-credential-index-'))
  const index = new CredentialIndex({ file: join(directory, 'index.json') })
  try {
    await Promise.all([
      index.add('okx', 'primary'),
      index.add('binance', 'primary'),
      index.add('bybit', 'secondary'),
    ])
    assert.deepEqual(await index.list(), [
      { exchange: 'binance', profile: 'primary' },
      { exchange: 'bybit', profile: 'secondary' },
      { exchange: 'okx', profile: 'primary' },
    ])
    await Promise.all([
      index.remove('binance', 'primary'),
      index.add('hyperliquid', 'public'),
    ])
    const serialized = JSON.stringify(await index.list())
    assert.equal(serialized.includes('secret'), false)
    assert.deepEqual(JSON.parse(serialized), [
      { exchange: 'bybit', profile: 'secondary' },
      { exchange: 'hyperliquid', profile: 'public' },
      { exchange: 'okx', profile: 'primary' },
    ])
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
