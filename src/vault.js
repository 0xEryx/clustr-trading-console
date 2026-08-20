import { CredentialIndex } from './credential-index.js'
import { createPlatformVaultBackend } from './vault-backends.js'

const SERVICE = 'com.clustr.trading-console.credentials'
const SUPPORTED = new Set(['okx', 'binance', 'bybit', 'hyperliquid'])

function account(exchange, profile) {
  const ex = String(exchange ?? '').trim().toLowerCase()
  const pf = String(profile ?? '').trim().toLowerCase()
  if (!SUPPORTED.has(ex)) throw new Error('该交易所不受支持')
  if (!/^[a-z0-9_-]{1,32}$/.test(pf)) throw new Error('账户名称只允许字母、数字、下划线和短横线')
  return `${ex}:${pf}`
}

function requireSecret(value, key, label) {
  if (typeof value?.[key] !== 'string' || value[key].trim().length < 6) throw new Error(`${label}缺失或格式不正确`)
  return value[key].trim()
}

function validate(exchange, value) {
  if (exchange === 'okx') return { apiKey: requireSecret(value, 'apiKey', 'OKX API Key'), secretKey: requireSecret(value, 'secretKey', 'OKX Secret Key'), passphrase: requireSecret(value, 'passphrase', 'OKX Passphrase') }
  if (exchange === 'binance') return { apiKey: requireSecret(value, 'apiKey', 'Binance API Key'), secretKey: requireSecret(value, 'secretKey', 'Binance Secret Key') }
  if (exchange === 'bybit') return { apiKey: requireSecret(value, 'apiKey', 'Bybit API Key'), secretKey: requireSecret(value, 'secretKey', 'Bybit Secret Key'), testnet: value?.testnet === true }
  if (exchange === 'hyperliquid') {
    throw new Error('Hyperliquid 账户连接未开放；请勿提交私钥或助记词')
  }
  throw new Error('该交易所不受支持')
}

function sanitizedVaultError(cause) {
  const code = typeof cause?.code === 'string' && /^VAULT_[A-Z_]+$/.test(cause.code) ? cause.code : 'VAULT_OPERATION_FAILED'
  const error = new Error(code === 'VAULT_UNAVAILABLE' ? '当前系统没有可用的安全凭证保险库' : '系统凭证保险库操作失败')
  error.code = code
  return error
}

function rowsFromAccounts(accounts) {
  return (Array.isArray(accounts) ? accounts : []).flatMap((id) => {
    const separator = String(id).indexOf(':')
    if (separator <= 0) return []
    const exchange = String(id).slice(0, separator)
    const profile = String(id).slice(separator + 1)
    if (!SUPPORTED.has(exchange) || !/^[a-z0-9_-]{1,32}$/.test(profile)) return []
    return [{ exchange, profile }]
  })
}

export class CredentialVault {
  constructor({ runner = null, backend = null, platform = process.platform, arch = process.arch, index = null } = {}) {
    const selected = runner ? { name: backend ?? 'Injected Credential Vault', platform, arch, runner } : createPlatformVaultBackend({ platform, arch })
    this.backend = selected.name
    this.platform = selected.platform
    this.arch = selected.arch
    this.runner = selected.runner
    this.index = index ?? new CredentialIndex()
    this.securityActions = new Map()
    this.health = { state: 'unknown', lastSuccessAt: null, lastErrorAt: null, reason: null }
  }

  validate(exchange, value) {
    return validate(String(exchange ?? '').toLowerCase(), value)
  }

  diagnostics() {
    return { backend: this.backend, platform: this.platform, arch: this.arch, ...this.health }
  }

  async run(request) {
    try {
      const result = await this.runner(request)
      this.health = { state: 'ready', lastSuccessAt: Date.now(), lastErrorAt: null, reason: null }
      return result
    } catch (cause) {
      const error = sanitizedVaultError(cause)
      this.health = { ...this.health, state: error.code === 'VAULT_UNAVAILABLE' ? 'unavailable' : 'error', lastErrorAt: Date.now(), reason: error.message }
      throw error
    }
  }

  async findSecret(id) {
    const result = await this.run({ operation: 'get', service: SERVICE, account: id })
    return { found: Boolean(result.found), value: result.secret ?? null }
  }

  async save(exchange, profile, value) {
    const ex = String(exchange).toLowerCase()
    const pf = String(profile).toLowerCase()
    const id = account(ex, pf)
    const secret = JSON.stringify(validate(ex, value))
    await this.run({ operation: 'save', service: SERVICE, account: id, secret })
    const verification = await this.findSecret(id)
    if (!verification.found || verification.value !== secret) throw new Error('系统凭证保险库写入验证失败')
    try {
      await this.index.add(ex, pf)
    } catch {
      try { await this.run({ operation: 'remove', service: SERVICE, account: id }) } catch {}
      throw new Error('本地凭证索引保存失败，保险库写入已回滚')
    }
    return { exchange: ex, profile: pf, connected: true }
  }

  async get(exchange, profile) {
    const ex = String(exchange ?? '').toLowerCase()
    const id = account(ex, profile)
    const result = await this.findSecret(id)
    if (!result.found) return null
    try {
      const parsed = JSON.parse(result.value)
      if (ex === 'hyperliquid' && parsed?.privateKey) {
        const accountAddress = String(parsed.accountAddress ?? '').trim()
        if (!/^0x[a-fA-F0-9]{40}$/.test(accountAddress)) throw new Error('系统凭证保险库中的凭证格式无效')
        const sanitized = JSON.stringify({ accountAddress })
        await this.run({ operation: 'save', service: SERVICE, account: id, secret: sanitized })
        const verification = await this.findSecret(id)
        if (!verification.found || verification.value !== sanitized) throw new Error('系统凭证保险库安全清理验证失败')
        this.securityActions.set(id, { kind: 'private-key-removed', at: Date.now() })
        return JSON.parse(sanitized)
      }
      return parsed
    } catch (error) {
      if (/安全清理验证失败/.test(String(error?.message ?? ''))) throw error
      throw new Error('系统凭证保险库中的凭证格式无效')
    }
  }

  async remove(exchange, profile) {
    const ex = String(exchange).toLowerCase()
    const pf = String(profile).toLowerCase()
    const id = account(ex, pf)
    const before = await this.findSecret(id)
    if (!before.found) {
      await this.index.remove(ex, pf)
      return { exchange: ex, profile: pf, connected: false, removed: false }
    }
    await this.run({ operation: 'remove', service: SERVICE, account: id })
    const after = await this.findSecret(id)
    if (after.found) throw new Error('系统凭证保险库删除验证失败')
    await this.index.remove(ex, pf)
    return { exchange: ex, profile: pf, connected: false, removed: true }
  }

  async list() {
    const [backendResult, indexResult] = await Promise.allSettled([
      this.run({ operation: 'list', service: SERVICE }),
      this.index.list(),
    ])
    if (backendResult.status === 'rejected' && indexResult.status === 'rejected') throw backendResult.reason
    const rows = [
      ...rowsFromAccounts(backendResult.status === 'fulfilled' ? backendResult.value.accounts : []),
      ...(indexResult.status === 'fulfilled' ? indexResult.value : []),
    ]
    const unique = new Map(rows.map((item) => [`${item.exchange}:${item.profile}`, item]))
    return [...unique.values()].sort((a, b) => a.exchange.localeCompare(b.exchange) || a.profile.localeCompare(b.profile))
  }

  async status(accounts = []) {
    let listed = []
    try { listed = await this.list() } catch {}
    const requested = Array.isArray(accounts) ? accounts : []
    const unique = new Map([...requested, ...listed].map((item) => [`${item.exchange}:${item.profile}`, item]))
    const rows = []
    for (const item of unique.values()) {
      try {
        const credentials = await this.get(item.exchange, item.profile)
        rows.push({ ...item, connected: Boolean(credentials), hasSigner: false, credentialState: this.securityActions.get(`${item.exchange}:${item.profile}`)?.kind ?? 'ready', backend: this.backend })
      } catch (error) {
        rows.push({ ...item, connected: false, hasSigner: false, credentialState: error?.code === 'VAULT_UNAVAILABLE' ? 'unavailable' : 'invalid', backend: this.backend })
      }
    }
    return rows.sort((a, b) => a.exchange.localeCompare(b.exchange) || a.profile.localeCompare(b.profile))
  }
}

export const __test = { validate, rowsFromAccounts, sanitizedVaultError }
