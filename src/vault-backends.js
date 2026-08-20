import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const MACOS_HELPER = fileURLToPath(new URL('../scripts/keychain-helper.swift', import.meta.url))
const WINDOWS_HELPER = fileURLToPath(new URL('../scripts/windows-credential-helper.ps1', import.meta.url))
const OUTPUT_LIMIT = 128 * 1024

function vaultError(code = 'VAULT_OPERATION_FAILED') {
  return Object.assign(new Error(code === 'VAULT_UNAVAILABLE' ? '系统凭证保险库不可用' : '系统凭证保险库操作失败'), { code })
}

function runProcess(command, args, input, { spawnImpl = spawn, allowNotFound = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawnImpl(command, args, { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true })
    let stdout = ''
    let stderrBytes = 0
    let exceeded = false
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      if (stdout.length + chunk.length <= OUTPUT_LIMIT) stdout += chunk
      else exceeded = true
    })
    child.stderr.on('data', (chunk) => {
      stderrBytes += chunk.length
      if (stderrBytes > OUTPUT_LIMIT) exceeded = true
    })
    child.on('error', (error) => reject(vaultError(error?.code === 'ENOENT' ? 'VAULT_UNAVAILABLE' : 'VAULT_OPERATION_FAILED')))
    child.on('close', (code) => {
      if (exceeded) return reject(vaultError('VAULT_OUTPUT_LIMIT'))
      if (allowNotFound && code === 1 && !stdout.trim() && stderrBytes === 0) return resolve({ code, stdout: '' })
      if (code !== 0) return reject(vaultError('VAULT_OPERATION_FAILED'))
      resolve({ code, stdout })
    })
    child.stdin.on('error', () => {})
    child.stdin.end(input)
  })
}

async function runJsonHelper(command, args, request, options) {
  const result = await runProcess(command, args, JSON.stringify(request), options)
  try {
    const parsed = JSON.parse(result.stdout)
    if (parsed?.ok !== true) throw new Error('invalid response')
    return parsed
  } catch {
    throw vaultError('VAULT_INVALID_RESPONSE')
  }
}

function macosRunner(request, options = {}) {
  return runJsonHelper('/usr/bin/swift', [MACOS_HELPER], request, options)
}

function windowsPowerShellPath(environment = process.env) {
  const root = String(environment.SystemRoot ?? environment.WINDIR ?? 'C:\\Windows')
  return join(root, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
}

function windowsInvocation(environment = process.env) {
  return {
    command: windowsPowerShellPath(environment),
    args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', WINDOWS_HELPER],
  }
}

function windowsRunner(request, options = {}) {
  const invocation = windowsInvocation(options.environment)
  return runJsonHelper(invocation.command, invocation.args, request, options)
}

function linuxInvocation(request) {
  const service = String(request.service ?? '')
  const account = String(request.account ?? '')
  if (request.operation === 'save') return { command: 'secret-tool', args: ['store', '--label=Clustr Trading Console', 'service', service, 'account', account], input: `${String(request.secret ?? '')}\n`, allowNotFound: false }
  if (request.operation === 'get') return { command: 'secret-tool', args: ['lookup', 'service', service, 'account', account], input: '', allowNotFound: true }
  if (request.operation === 'remove') return { command: 'secret-tool', args: ['clear', 'service', service, 'account', account], input: '', allowNotFound: true }
  if (request.operation === 'list') return null
  throw vaultError('VAULT_OPERATION_FAILED')
}

async function linuxRunner(request, options = {}) {
  const invocation = linuxInvocation(request)
  if (!invocation) return { ok: true, found: false, accounts: [] }
  const result = await runProcess(invocation.command, invocation.args, invocation.input, { ...options, allowNotFound: invocation.allowNotFound })
  if (request.operation === 'save') return { ok: true, found: true }
  if (request.operation === 'get') {
    if (result.code === 1 || !result.stdout) return { ok: true, found: false, secret: null }
    return { ok: true, found: true, secret: result.stdout.replace(/\r?\n$/, '') }
  }
  return { ok: true, found: false }
}

function unavailableRunner() {
  return Promise.reject(vaultError('VAULT_UNAVAILABLE'))
}

export function createPlatformVaultBackend({ platform = process.platform, arch = process.arch, spawnImpl = spawn, environment = process.env } = {}) {
  const options = { spawnImpl, environment }
  if (platform === 'darwin') return { name: 'macOS Keychain', platform, arch, runner: (request) => macosRunner(request, options) }
  if (platform === 'win32') return { name: 'Windows Credential Manager', platform, arch, runner: (request) => windowsRunner(request, options) }
  if (platform === 'linux') return { name: 'Linux Secret Service', platform, arch, runner: (request) => linuxRunner(request, options) }
  return { name: 'Unavailable', platform, arch, runner: unavailableRunner }
}

export const __test = {
  linuxInvocation,
  windowsInvocation,
  windowsPowerShellPath,
}
