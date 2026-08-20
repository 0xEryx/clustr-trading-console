import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { CredentialVault } from '../src/vault.js'
import { createPlatformVaultBackend, __test as backendTest } from '../src/vault-backends.js'

class MemoryIndex {
  constructor() { this.rows = [] }
  async list() { return this.rows.map((row) => ({ ...row })) }
  async add(exchange, profile) {
    if (!this.rows.some((row) => row.exchange === exchange && row.profile === profile)) this.rows.push({ exchange, profile })
  }
  async remove(exchange, profile) {
    this.rows = this.rows.filter((row) => row.exchange !== exchange || row.profile !== profile)
  }
}

function memoryRunner(values = new Map()) {
  return async (request) => {
    if (request.operation === 'save') { values.set(request.account, request.secret); return { ok: true, found: true } }
    if (request.operation === 'get') return { ok: true, found: values.has(request.account), secret: values.get(request.account) }
    if (request.operation === 'remove') { values.delete(request.account); return { ok: true, found: false } }
    if (request.operation === 'list') return { ok: true, accounts: [...values.keys()] }
    throw new Error('unsupported')
  }
}

function captureSpawn(response) {
  const calls = []
  const spawnImpl = (command, args, options) => {
    const child = new EventEmitter()
    child.stdin = new PassThrough()
    child.stdout = new PassThrough()
    child.stderr = new PassThrough()
    const call = { command, args: [...args], options, stdin: '' }
    calls.push(call)
    child.stdin.setEncoding('utf8')
    child.stdin.on('data', (chunk) => { call.stdin += chunk })
    child.stdin.on('end', () => {
      child.stdout.end(JSON.stringify(response))
      queueMicrotask(() => child.emit('close', 0))
    })
    return child
  }
  return { calls, spawnImpl }
}

test('vault failure never returns credential material', async () => {
  const secret = 'vault-secret-sentinel'
  const vault = new CredentialVault({
    runner: async (request) => { throw Object.assign(new Error(`failed ${request.secret ?? secret}`), { code: 'VAULT_OPERATION_FAILED' }) },
    backend: 'Injected Credential Vault',
    index: new MemoryIndex(),
  })
  await assert.rejects(
    vault.save('okx', 'sentinel', { apiKey: secret, secretKey: secret, passphrase: secret }),
    (error) => error.message === '系统凭证保险库操作失败' && !error.message.includes(secret),
  )
})

test('failed deletion never claims that credentials were removed', async () => {
  const vault = new CredentialVault({
    runner: async (request) => {
      if (request.operation === 'get') return { ok: true, found: true, secret: '{}' }
      throw new Error('delete failed with secret-sentinel')
    },
    index: new MemoryIndex(),
  })
  await assert.rejects(vault.remove('okx', 'sentinel'), (error) => error.message === '系统凭证保险库操作失败' && !error.message.includes('sentinel'))
})

test('legacy Hyperliquid private keys are removed during read', async () => {
  const values = new Map([['hyperliquid:default', JSON.stringify({ accountAddress: '0x1111111111111111111111111111111111111111', privateKey: `0x${'2'.repeat(64)}` })]])
  const vault = new CredentialVault({ runner: memoryRunner(values), index: new MemoryIndex() })
  const value = await vault.get('hyperliquid', 'default')
  assert.deepEqual(value, { accountAddress: '0x1111111111111111111111111111111111111111' })
  assert.equal(values.get('hyperliquid:default').includes('privateKey'), false)
  assert.equal((await vault.status([]))[0].credentialState, 'private-key-removed')
})

test('Hyperliquid account connection is rejected while unavailable', async () => {
  const vault = new CredentialVault({ runner: memoryRunner(new Map()) })
  assert.throws(
    () => vault.validate('hyperliquid', { accountAddress: '0x1111111111111111111111111111111111111111' }),
    /账户连接未开放/,
  )
  await assert.rejects(
    vault.save('hyperliquid', 'default', { accountAddress: '0x1111111111111111111111111111111111111111' }),
    /账户连接未开放/,
  )
})

test('cross-platform vault protocol saves, verifies, lists and removes without returning secrets', async () => {
  const values = new Map()
  const index = new MemoryIndex()
  const vault = new CredentialVault({ runner: memoryRunner(values), backend: 'Test OS Vault', platform: 'test', arch: 'x64', index })
  const secret = 'cross-platform-secret-sentinel'
  const saved = await vault.save('binance', 'primary', { apiKey: 'api-key-sentinel', secretKey: secret })
  assert.deepEqual(saved, { exchange: 'binance', profile: 'primary', connected: true })
  assert.equal(JSON.stringify(saved).includes(secret), false)
  assert.deepEqual(await vault.list(), [{ exchange: 'binance', profile: 'primary' }])
  assert.equal((await vault.status([]))[0].connected, true)
  const removed = await vault.remove('binance', 'primary')
  assert.equal(removed.removed, true)
  assert.deepEqual(await vault.list(), [])
})

test('unsupported platforms fail closed without a plaintext fallback', async () => {
  const backend = createPlatformVaultBackend({ platform: 'aix', arch: 'x64' })
  const vault = new CredentialVault({ runner: backend.runner, backend: backend.name, platform: backend.platform, arch: backend.arch, index: new MemoryIndex() })
  await assert.rejects(
    vault.save('binance', 'default', { apiKey: 'api-key-sentinel', secretKey: 'secret-sentinel' }),
    (error) => error.code === 'VAULT_UNAVAILABLE' && /没有可用/.test(error.message),
  )
  assert.equal(vault.diagnostics().state, 'unavailable')
})

test('platform selection keeps one plugin surface with native vault backends', () => {
  assert.equal(createPlatformVaultBackend({ platform: 'darwin', arch: 'arm64' }).name, 'macOS Keychain')
  assert.equal(createPlatformVaultBackend({ platform: 'win32', arch: 'x64' }).name, 'Windows Credential Manager')
  assert.equal(createPlatformVaultBackend({ platform: 'linux', arch: 'x64' }).name, 'Linux Secret Service')
  assert.equal(createPlatformVaultBackend({ platform: 'freebsd', arch: 'x64' }).name, 'Unavailable')
})

test('Linux Secret Service receives secret through stdin and never argv', () => {
  const secret = 'linux-secret-sentinel'
  const invocation = backendTest.linuxInvocation({ operation: 'save', service: 'service', account: 'binance:default', secret })
  assert.equal(invocation.command, 'secret-tool')
  assert.equal(invocation.input.includes(secret), true)
  assert.equal(JSON.stringify(invocation.args).includes(secret), false)
})

test('Windows Credential Manager helper invocation never contains credentials', () => {
  const invocation = backendTest.windowsInvocation({ SystemRoot: 'C:\\Windows' })
  assert.match(invocation.command, /powershell\.exe$/i)
  assert.equal(invocation.args.includes('-File'), true)
  assert.equal(JSON.stringify(invocation).includes('secret-sentinel'), false)
})

test('macOS and Windows helpers receive credential payload only through stdin', async () => {
  const secret = 'process-boundary-secret-sentinel'
  for (const platform of ['darwin', 'win32']) {
    const captured = captureSpawn({ ok: true, found: true })
    const backend = createPlatformVaultBackend({ platform, arch: 'x64', spawnImpl: captured.spawnImpl, environment: { SystemRoot: 'C:\\Windows' } })
    await backend.runner({ operation: 'save', service: 'service', account: 'okx:default', secret })
    assert.equal(captured.calls.length, 1)
    assert.equal(captured.calls[0].stdin.includes(secret), true)
    assert.equal(JSON.stringify({ command: captured.calls[0].command, args: captured.calls[0].args, options: captured.calls[0].options }).includes(secret), false)
  }
})
