import { createHash, randomBytes } from 'node:crypto'
import { access, cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CLUSTR_PACKAGE_NAME, CLUSTR_VERSION } from './version.js'

const MANAGED_FILE = '.clustr-managed.json'
const PRESET_ID = 'crypto-trader'
const DEFAULT_SOURCE = fileURLToPath(new URL('../presets/crypto-trader/', import.meta.url))

function installError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

function portablePath(path) {
  return path.split(sep).join('/')
}

async function listFiles(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name === MANAGED_FILE) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await listFiles(root, path))
    else if (entry.isFile()) files.push(portablePath(relative(root, path)))
    else throw installError('PRESET_UNSUPPORTED_ENTRY', `预设包含不支持的文件类型：${entry.name}`)
  }
  return files.sort()
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex')
}

async function snapshot(root) {
  const result = {}
  for (const path of await listFiles(root)) result[path] = await sha256(join(root, path))
  return result
}

function equalSnapshots(left, right) {
  const leftKeys = Object.keys(left).sort()
  const rightKeys = Object.keys(right).sort()
  return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key])
}

export function defaultDshHome(env = process.env) {
  const configured = String(env.DSH_HOME ?? '').trim()
  return configured ? resolve(configured) : join(homedir(), '.dsh')
}

export function presetPath(dshHome = defaultDshHome()) {
  return join(resolve(dshHome), '.agent-presets', PRESET_ID)
}

export async function inspectPreset({ dshHome = defaultDshHome() } = {}) {
  const target = presetPath(dshHome)
  if (!await exists(target)) return { state: 'missing', target }
  const info = await stat(target)
  if (!info.isDirectory()) return { state: 'unmanaged', target, reason: '目标路径不是目录' }

  let managed
  try {
    managed = JSON.parse(await readFile(join(target, MANAGED_FILE), 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT' || error instanceof SyntaxError) return { state: 'unmanaged', target, reason: '缺少有效的 Clustr 管理记录' }
    throw error
  }
  if (managed?.package !== CLUSTR_PACKAGE_NAME || managed?.preset !== PRESET_ID || typeof managed?.files !== 'object' || managed.files === null) {
    return { state: 'unmanaged', target, reason: '管理记录不属于当前 Clustr 包' }
  }
  const current = await snapshot(target)
  if (!equalSnapshots(current, managed.files)) return { state: 'modified', target, version: managed.version, reason: '预设文件已被本地修改' }
  return { state: 'managed', target, version: managed.version, files: current }
}

async function stagePreset({ source, target, files }) {
  const token = randomBytes(6).toString('hex')
  const stage = join(dirname(target), `.${PRESET_ID}.stage-${process.pid}-${token}`)
  await cp(source, stage, { recursive: true, errorOnExist: true, force: false })
  await writeFile(join(stage, MANAGED_FILE), `${JSON.stringify({
    schema: 1,
    package: CLUSTR_PACKAGE_NAME,
    version: CLUSTR_VERSION,
    preset: PRESET_ID,
    files,
  }, null, 2)}\n`, { mode: 0o600 })
  return stage
}

export async function installPreset({ dshHome = defaultDshHome(), force = false, source = DEFAULT_SOURCE } = {}) {
  const target = presetPath(dshHome)
  const state = await inspectPreset({ dshHome })
  if ((state.state === 'unmanaged' || state.state === 'modified') && !force) {
    throw installError(
      state.state === 'modified' ? 'PRESET_MODIFIED' : 'PRESET_EXISTS',
      `${target} 已存在且不能安全覆盖：${state.reason}。请先备份并移走该目录，或明确使用 --force。`,
    )
  }

  const sourceFiles = await snapshot(source)
  if (state.state === 'managed' && equalSnapshots(state.files, sourceFiles) && state.version === CLUSTR_VERSION) {
    return { state: 'current', target, version: CLUSTR_VERSION }
  }

  await mkdir(dirname(target), { recursive: true, mode: 0o700 })
  const stage = await stagePreset({ source, target, files: sourceFiles })
  if (state.state === 'missing') {
    try {
      await rename(stage, target)
      return { state: 'installed', target, version: CLUSTR_VERSION }
    } catch (error) {
      await rm(stage, { recursive: true, force: true }).catch(() => {})
      throw error
    }
  }

  const token = randomBytes(6).toString('hex')
  const backup = join(dirname(target), `${PRESET_ID}.backup-${Date.now()}-${token}`)
  await rename(target, backup)
  try {
    await rename(stage, target)
  } catch (error) {
    await rename(backup, target).catch(() => {})
    await rm(stage, { recursive: true, force: true }).catch(() => {})
    throw error
  }

  if (!force) await rm(backup, { recursive: true, force: true })
  return {
    state: 'updated',
    target,
    version: CLUSTR_VERSION,
    ...(force ? { backup } : {}),
  }
}

export async function removePreset({ dshHome = defaultDshHome(), force = false } = {}) {
  const state = await inspectPreset({ dshHome })
  if (state.state === 'missing') return { state: 'missing', target: state.target }
  if (state.state === 'managed') {
    await rm(state.target, { recursive: true, force: false })
    return { state: 'removed', target: state.target }
  }
  if (!force) {
    throw installError(
      state.state === 'modified' ? 'PRESET_MODIFIED' : 'PRESET_EXISTS',
      `${state.target} ${state.reason}，为保护本地内容没有删除。请先备份并移走该目录，或明确使用 --force。`,
    )
  }
  const token = randomBytes(6).toString('hex')
  const backup = join(dirname(state.target), `${PRESET_ID}.backup-${Date.now()}-${token}`)
  await rename(state.target, backup)
  return { state: 'retained', target: state.target, backup }
}

export const presetInstallerContract = Object.freeze({
  packageName: CLUSTR_PACKAGE_NAME,
  version: CLUSTR_VERSION,
  presetId: PRESET_ID,
  managedFile: MANAGED_FILE,
})
