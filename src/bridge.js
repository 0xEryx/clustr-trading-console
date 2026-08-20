// Minimal MCP stdio client over newline-delimited JSON-RPC (no SDK dependency).
import { spawn } from 'node:child_process'
import { CLUSTR_VERSION } from './version.js'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)

function unwrapToolPayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  // OKX Agent Trade Kit wraps successful calls as
  // { tool, ok, data: { endpoint, requestTime, data: [...] }, capabilities }.
  // Keep the endpoint envelope (the rest of this plugin already consumes its
  // `data` array), but remove the MCP result envelope in one central place.
  if (value.ok === true && Object.hasOwn(value, 'data') && (value.tool || value.capabilities)) return value.data
  return value
}

function resolveKitBin() {
  const pkgPath = require.resolve('@okx_ai/okx-trade-mcp/package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.['okx-trade-mcp'] ?? pkg.bin?.mcp
  if (!bin) throw new Error('okx-trade-mcp package has no usable bin field')
  return join(dirname(pkgPath), bin)
}

export class OkxBridge {
  constructor({ profile = 'demo', modules = ['market', 'account', 'spot', 'swap'], timeoutMs = 30000, readOnly = true, credentials = null, proxyEnv = null } = {}) {
    this.profile = profile
    this.modules = modules
    this.timeoutMs = timeoutMs
    this.readOnly = readOnly
    this.credentials = credentials
    this.proxyEnv = proxyEnv
    this.child = null
    this.stderrTail = ''
    this.nextId = 1
    this.pending = new Map()
    this.ready = false
    this.lastError = null
    this.health = 'stopped'
  }

  async start() {
    if (this.ready) return
    this.health = 'starting'
    const bin = resolveKitBin()
    const args = ['--profile', this.profile, '--modules', this.modules.join(',')]
    if (this.readOnly) args.push('--read-only')
    const secret = typeof this.credentials === 'function' ? await this.credentials() : null
    const extraEnv = typeof this.proxyEnv === 'function' ? this.proxyEnv() : (this.proxyEnv ?? {})
    const env = { ...process.env, ...extraEnv }
    if (secret?.apiKey && secret?.secretKey && secret?.passphrase) {
      env.OKX_API_KEY = secret.apiKey
      env.OKX_SECRET_KEY = secret.secretKey
      env.OKX_PASSPHRASE = secret.passphrase
    }
    this.child = spawn(bin, args, { stdio: ['pipe', 'pipe', 'pipe'], env })
    let buffer = ''
    this.child.stdout.setEncoding('utf8')
    this.child.stdout.on('data', (chunk) => {
      buffer += chunk
      let idx
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx).trim()
        buffer = buffer.slice(idx + 1)
        if (!line) continue
        let msg
        try { msg = JSON.parse(line) } catch { continue }
        this.onMessage(msg)
      }
    })
    this.child.stderr.on('data', (chunk) => { this.stderrTail = (this.stderrTail + String(chunk)).slice(-2000) })
    this.child.on('error', (err) => { this.lastError = String(err?.message ?? err); this.health = 'failed' })
    this.child.on('exit', (code) => {
      this.ready = false
      this.health = 'stopped'
      const pending = [...this.pending.values()]
      this.pending.clear()
      for (const p of pending) p.reject(new Error(`okx-trade-mcp exited (code ${code})`))
    })
    await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'clustr-trading-console', version: CLUSTR_VERSION },
    })
    this.notify('notifications/initialized', {})
    this.ready = true
    this.health = 'ready'
  }

  onMessage(msg) {
    if (msg.id != null && this.pending.has(msg.id)) {
      const { resolve, reject } = this.pending.get(msg.id)
      this.pending.delete(msg.id)
      if (msg.error) reject(new Error(msg.error?.message ?? 'MCP error'))
      else resolve(msg.result)
    }
  }

  notify(method, params) {
    try { this.child?.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n') } catch {}
  }

  request(method, params) {
    if (!this.child) return Promise.reject(new Error('bridge not started'))
    const id = this.nextId++
    const payload = { jsonrpc: '2.0', id, method, params }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`MCP request ${method} timed out`))
      }, this.timeoutMs)
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timer); resolve(v) },
        reject: (e) => { clearTimeout(timer); reject(e) },
      })
      try { this.child.stdin.write(JSON.stringify(payload) + '\n') }
      catch (e) { clearTimeout(timer); this.pending.delete(id); reject(e) }
    })
  }

  async listTools() {
    if (!this.ready) await this.start()
    const result = await this.request('tools/list', {})
    return result?.tools ?? []
  }

  async callTool(name, args) {
    if (!this.ready) await this.start()
    const result = await this.request('tools/call', { name, arguments: args ?? {} })
    if (result?.isError) {
      const text = (result.content ?? []).filter((c) => c.type === 'text').map((c) => c.text).join('\n')
      throw new Error(text || `tool ${name} failed`)
    }
    const texts = (result?.content ?? []).filter((c) => c.type === 'text').map((c) => c.text)
    if (texts.length === 1) {
      try { return unwrapToolPayload(JSON.parse(texts[0])) } catch { return { text: texts[0] } }
    }
    return { content: result?.content ?? [] }
  }

  async dispose() {
    this.health = 'stopped'
    this.ready = false
    if (this.child) {
      try { this.child.kill() } catch {}
      this.child = null
      this.stderrTail = ''
    }
  }
}
