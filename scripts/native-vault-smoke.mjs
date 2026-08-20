import assert from 'node:assert/strict'
import { CredentialVault } from '../src/vault.js'

const vault = new CredentialVault()
const profile = `ci-${Date.now().toString(36)}`.slice(0, 32)
const credentials = {
  apiKey: `clustr-api-${Date.now().toString(36)}`,
  secretKey: `clustr-secret-${Date.now().toString(36)}`,
}
let saved = false

try {
  const result = await vault.save('binance', profile, credentials)
  saved = result.connected === true
  assert.equal(saved, true)
  assert.deepEqual(await vault.get('binance', profile), credentials)
  const listed = await vault.list()
  assert.equal(listed.some((row) => row.exchange === 'binance' && row.profile === profile), true)
  const removed = await vault.remove('binance', profile)
  saved = false
  assert.equal(removed.removed, true)
  assert.equal(await vault.get('binance', profile), null)
  process.stdout.write(`${JSON.stringify({ ok: true, diagnostics: vault.diagnostics() })}\n`)
} finally {
  if (saved) await vault.remove('binance', profile).catch(() => {})
}
