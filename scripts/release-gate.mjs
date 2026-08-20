import { access, readFile, readdir, stat } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CLUSTR_PACKAGE_NAME, CLUSTR_VERSION } from '../src/version.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const failures = []

function fail(message) {
  failures.push(message)
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

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else if (entry.isFile()) files.push(path)
  }
  return files
}

function portable(path) {
  return relative(root, path).split(sep).join('/')
}

const requiredFiles = [
  'bin/clustr-console.js',
  'lib/client.js',
  'cordis.patch.yml',
  'presets/crypto-trader/agent.cordis.yml',
  'presets/crypto-trader/preset.yml',
  'scripts/keychain-helper.swift',
  'scripts/windows-credential-helper.ps1',
  'README.md',
  'INSTALLATION.md',
  'SECURITY.md',
  'PLATFORM_SUPPORT.md',
  'ANALYSIS_METHODS.md',
  'LICENSE',
]

for (const path of requiredFiles) if (!await exists(join(root, path))) fail(`缺少发布文件：${path}`)
if (manifest.name !== CLUSTR_PACKAGE_NAME) fail(`package name 必须是 ${CLUSTR_PACKAGE_NAME}`)
if (manifest.version !== CLUSTR_VERSION) fail(`package.json 与 src/version.js 的版本不一致`)
if (manifest.private !== undefined) fail('公开包不能保留 private 字段')
if (manifest.license !== 'Apache-2.0') fail('许可证必须与 LICENSE 文件一致')
if (manifest.publishConfig?.access !== 'public') fail('scoped package 必须显式设置 public access')
if (manifest.bin?.['clustr-console'] !== 'bin/clustr-console.js') fail('clustr-console CLI 必须使用 npm 可发布的相对路径')
if (manifest.dsh?.bundle?.patch !== './cordis.patch.yml') fail('缺少正式 DSH bundle patch')
for (const lifecycle of ['preinstall', 'install', 'postinstall', 'prepare']) {
  if (manifest.scripts?.[lifecycle]) fail(`禁止在用户安装阶段自动执行脚本：${lifecycle}`)
}

const published = [
  join(root, 'package.json'),
  ...await walk(join(root, 'bin')),
  ...(await readdir(join(root, 'src'), { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith('.js')).map((entry) => join(root, 'src', entry.name)),
  join(root, 'lib/client.js'),
  ...await walk(join(root, 'presets')),
  join(root, 'scripts/keychain-helper.swift'),
  join(root, 'scripts/windows-credential-helper.ps1'),
  ...['README.md', 'INSTALLATION.md', 'SECURITY.md', 'PLATFORM_SUPPORT.md', 'CLUST_TRADING_CONSOLE_PRODUCT_MANUAL_ZH.md', 'ANALYSIS_METHODS.md', 'CHANGELOG.md', 'RELEASING.md', 'LICENSE'].map((path) => join(root, path)),
].filter((path, index, list) => list.indexOf(path) === index)

const secretLiteral = /(?:api[_-]?key|secret[_-]?key|passphrase|private[_-]?key)\s*(?:=|:)\s*["'][^"'\n]{12,}["']/i
for (const path of published) {
  const rel = portable(path)
  const info = await stat(path)
  if (info.size > 8 * 1024 * 1024) fail(`发布文件异常过大：${rel}`)
  const text = await readFile(path, 'utf8')
  if (text.includes('dsh-crypto-okx')) fail(`仍包含旧包名：${rel}`)
  if (/\/Users\/[^/]+\//.test(text) || /[A-Za-z]:\\Users\\[^\\]+\\/.test(text)) fail(`包含开发机绝对路径：${rel}`)
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) fail(`包含私钥材料：${rel}`)
  if (secretLiteral.test(text)) fail(`疑似包含硬编码凭证：${rel}`)
}

const bundle = await readFile(join(root, 'lib/client.js'), 'utf8')
if (!bundle.startsWith(`window.__ModuleLoader__.load({ id: "${CLUSTR_PACKAGE_NAME}"`)) fail('浏览器 bundle 注册 ID 与 npm 包名不一致')
const patch = await readFile(join(root, 'cordis.patch.yml'), 'utf8')
if (!patch.includes(`name: '${CLUSTR_PACKAGE_NAME}'`)) fail('Cordis patch 没有加载正式 npm 包名')
const preset = await readFile(join(root, 'presets/crypto-trader/agent.cordis.yml'), 'utf8')
if (!preset.includes(`${CLUSTR_PACKAGE_NAME}/agent-prompt`)) fail('Clustr preset 没有加载包内 agent prompt')
const installer = await readFile(join(root, 'bin/clustr-console.js'), 'utf8')
if (!installer.includes("'add', '-w', spec, '--ignore-scripts'")) fail('安装器必须明确把插件添加到 DSH profile 工作区根目录')

if (process.env.GITHUB_ACTIONS === 'true') {
  const repository = typeof manifest.repository === 'string' ? manifest.repository : manifest.repository?.url
  if (!repository) fail('GitHub 发布前必须在 package.json 填写准确的 repository')
}

if (failures.length > 0) {
  process.stderr.write(`Clustr release gate failed:\n${failures.map((item) => `- ${item}`).join('\n')}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(`Clustr release gate passed (${published.length} publishable files checked).\n`)
}
