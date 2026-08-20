import { execFileSync } from 'node:child_process'
import { isIP } from 'node:net'
import { fetch as undiciFetch, EnvHttpProxyAgent } from 'undici'

const LOOPBACK_NO_PROXY = ['127.0.0.1', 'localhost', '::1', '[::1]']
const ALLOWED_PROXY_PROTOCOLS = new Set(['http:', 'https:'])

function parseScutilProxy(text) {
  const values = new Map()
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z]+)\s*:\s*(.*?)\s*$/)
    if (match) values.set(match[1], match[2])
  }
  const endpoint = (prefix) => {
    if (values.get(`${prefix}Enable`) !== '1') return null
    const host = values.get(`${prefix}Proxy`)
    const port = Number(values.get(`${prefix}Port`))
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535) return null
    return `http://${host}:${port}`
  }
  return { httpsProxy: endpoint('HTTPS'), httpProxy: endpoint('HTTP') }
}

function systemProxy() {
  if (process.platform !== 'darwin') return null
  try {
    return parseScutilProxy(execFileSync('/usr/sbin/scutil', ['--proxy'], {
      encoding: 'utf8',
      timeout: 2000,
      stdio: ['ignore', 'pipe', 'ignore'],
    }))
  } catch {
    return null
  }
}

function normalizeProxy(value) {
  if (!value) return null
  let url
  try { url = new URL(String(value)) } catch { throw new Error('代理地址格式无效') }
  if (!ALLOWED_PROXY_PROTOCOLS.has(url.protocol)) throw new Error('代理仅支持 HTTP 或 HTTPS 协议')
  if (!url.hostname) throw new Error('代理地址缺少主机名')
  return url.toString()
}

function mergeNoProxy(value) {
  const entries = String(value ?? '').split(/[\s,]+/).filter(Boolean)
  for (const host of LOOPBACK_NO_PROXY) if (!entries.includes(host)) entries.push(host)
  return entries.join(',')
}

function safeEndpoint(value) {
  if (!value) return null
  const url = new URL(value)
  return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`
}

function selectProxy({ proxyUrl, useSystemProxy = true } = {}) {
  if (proxyUrl) {
    const normalized = normalizeProxy(proxyUrl)
    return { source: 'explicit', httpProxy: normalized, httpsProxy: normalized }
  }
  const envHttp = process.env.http_proxy ?? process.env.HTTP_PROXY
  const envHttps = process.env.https_proxy ?? process.env.HTTPS_PROXY
  if (envHttp || envHttps) return {
    source: 'environment',
    httpProxy: normalizeProxy(envHttp || envHttps),
    httpsProxy: normalizeProxy(envHttps || envHttp),
  }
  if (useSystemProxy) {
    const detected = systemProxy()
    if (detected?.httpProxy || detected?.httpsProxy) return {
      source: 'system',
      httpProxy: normalizeProxy(detected.httpProxy || detected.httpsProxy),
      httpsProxy: normalizeProxy(detected.httpsProxy || detected.httpProxy),
    }
  }
  return { source: 'direct', httpProxy: null, httpsProxy: null }
}

export class ClustrNetwork {
  constructor(options = {}) {
    const selected = selectProxy(options)
    this.source = selected.source
    this.httpProxy = selected.httpProxy
    this.httpsProxy = selected.httpsProxy
    this.noProxy = mergeNoProxy(options.noProxy ?? process.env.no_proxy ?? process.env.NO_PROXY)
    this.dispatcher = new EnvHttpProxyAgent({
      httpProxy: this.httpProxy || undefined,
      httpsProxy: this.httpsProxy || undefined,
      noProxy: this.noProxy,
      connect: { timeout: Math.min(Math.max(Number(options.connectTimeoutMs) || 10000, 1000), 30000) },
    })
    this.closed = false
    this.egressCache = null
  }

  fetch(input, init = {}) {
    if (this.closed) return Promise.reject(new Error('网络通道已关闭'))
    return undiciFetch(input, { ...init, dispatcher: this.dispatcher })
  }

  childEnv() {
    if (!this.httpProxy && !this.httpsProxy) return {
      NO_PROXY: this.noProxy,
      no_proxy: this.noProxy,
      NODE_USE_ENV_PROXY: '1',
    }
    return {
      HTTP_PROXY: this.httpProxy,
      HTTPS_PROXY: this.httpsProxy,
      http_proxy: this.httpProxy,
      https_proxy: this.httpsProxy,
      NO_PROXY: this.noProxy,
      no_proxy: this.noProxy,
      NODE_USE_ENV_PROXY: '1',
    }
  }

  status() {
    return {
      enabled: Boolean(this.httpProxy || this.httpsProxy),
      source: this.source,
      httpProxy: safeEndpoint(this.httpProxy),
      httpsProxy: safeEndpoint(this.httpsProxy),
    }
  }

  async probe(url, timeoutMs = 8000) {
    const startedAt = Date.now()
    try {
      const response = await this.fetch(url, {
        method: 'GET',
        headers: { accept: 'application/json', 'user-agent': 'Clustr-Trading-Console/0.2' },
        signal: AbortSignal.timeout(Math.min(Math.max(Number(timeoutMs) || 8000, 1000), 30000)),
      })
      await response.body?.cancel().catch(() => {})
      return { ok: response.ok, status: response.status, latencyMs: Date.now() - startedAt }
    } catch (error) {
      return {
        ok: false,
        status: null,
        latencyMs: Date.now() - startedAt,
        reason: error?.name === 'TimeoutError' ? '连接超时' : '连接异常',
      }
    }
  }

  async egressIp() {
    if (this.egressCache && Date.now() - this.egressCache.at < 5 * 60_000) return { ip: this.egressCache.ip, checkedAt: this.egressCache.at }
    let response
    try {
      response = await this.fetch('https://api.ipify.org?format=json', {
        headers: { accept: 'application/json', 'user-agent': 'Clustr-Trading-Console/0.2' },
        signal: AbortSignal.timeout(8000),
      })
    } catch { throw new Error('无法查询当前网络出口') }
    if (!response.ok) throw new Error('无法查询当前网络出口')
    const payload = await response.json().catch(() => null)
    const ip = String(payload?.ip ?? '').trim()
    if (!isIP(ip)) throw new Error('网络出口查询结果无效')
    this.egressCache = { ip, at: Date.now() }
    return { ip, checkedAt: this.egressCache.at }
  }

  async close() {
    if (this.closed) return
    this.closed = true
    await this.dispatcher.close()
  }
}

export const __test = { parseScutilProxy, mergeNoProxy, selectProxy, safeEndpoint }
