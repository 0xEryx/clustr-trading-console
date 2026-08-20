#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

import { defaultDshHome, inspectPreset, installPreset, presetInstallerContract, removePreset } from '../src/preset-installer.js'

function usage() {
  return `Clustr Trading Console ${presetInstallerContract.version}

用法：
  clustr-console install [--profile web] [--dsh-home PATH] [--force]
  clustr-console uninstall [--profile web] [--dsh-home PATH] [--force]
  clustr-console setup [--dsh-home PATH] [--force]
  clustr-console doctor [--dsh-home PATH]

install  安装当前精确版本的 DSH 插件，并配置 Clustr 专属预设
uninstall 移除 DSH 插件及未修改的 Clustr 专属预设
setup    只配置 Clustr 专属预设
doctor   检查预设安装状态
`
}

function parseArgs(argv) {
  const options = { command: 'help', profile: 'web', dshHome: defaultDshHome(), force: false, packageSpec: null }
  const args = [...argv]
  if (args.length > 0 && !args[0].startsWith('-')) options.command = args.shift()
  while (args.length > 0) {
    const arg = args.shift()
    if (arg === '--force') options.force = true
    else if (arg === '--profile') options.profile = String(args.shift() ?? '')
    else if (arg === '--dsh-home') options.dshHome = String(args.shift() ?? '')
    else if (arg === '--package-spec') options.packageSpec = String(args.shift() ?? '')
    else if (arg === '--help' || arg === '-h') options.command = 'help'
    else throw new Error(`无法识别的参数：${arg}`)
  }
  if (!options.profile) throw new Error('--profile 需要一个值')
  if (!options.dshHome) throw new Error('--dsh-home 需要一个值')
  return options
}

function assertPresetCanInstall(state, force) {
  if ((state.state === 'unmanaged' || state.state === 'modified') && !force) {
    throw new Error(`${state.target} 已存在且不能安全覆盖：${state.reason}。请先备份并移走该目录，或明确使用 --force。`)
  }
}

function runDshPlugin({ profile, dshHome, operation, packageSpec }) {
  const spec = packageSpec || `${presetInstallerContract.packageName}@${presetInstallerContract.version}`
  const args = operation === 'remove'
    ? ['plugin', '--profile', profile, 'remove', presetInstallerContract.packageName]
    : ['plugin', '--profile', profile, 'add', '-w', spec, '--ignore-scripts']
  const result = spawnSync('dsh', args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, DSH_HOME: dshHome },
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`DeepSeek Harness 插件${operation === 'remove' ? '移除' : '安装'}失败（退出码 ${result.status ?? 'unknown'}）`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.command === 'help') {
    process.stdout.write(usage())
    return
  }
  if (options.command === 'doctor') {
    const state = await inspectPreset({ dshHome: options.dshHome })
    process.stdout.write(`${JSON.stringify(state, null, 2)}\n`)
    if (state.state === 'modified' || state.state === 'unmanaged') process.exitCode = 2
    return
  }
  if (options.command === 'setup') {
    const result = await installPreset({ dshHome: options.dshHome, force: options.force })
    process.stdout.write(`Clustr 预设${result.state === 'current' ? '已是当前版本' : '配置完成'}：${result.target}\n`)
    if (result.backup) process.stdout.write(`原预设已保留：${result.backup}\n`)
    return
  }
  if (options.command === 'install') {
    const before = await inspectPreset({ dshHome: options.dshHome })
    assertPresetCanInstall(before, options.force)
    runDshPlugin({ ...options, operation: 'add' })
    const result = await installPreset({ dshHome: options.dshHome, force: options.force })
    process.stdout.write(`Clustr Trading Console ${presetInstallerContract.version} 安装完成。\n预设：${result.target}\n\n下一步：\n1. 重启 DeepSeek Harness Web。\n2. 新建会话，并在 Agent Preset 中选择 Clustr Trading Console。\n3. 在 Clustr Settings 中先测试交易所连接，再验证并保存。\n`)
    if (result.backup) process.stdout.write(`原预设已保留：${result.backup}\n`)
    return
  }
  if (options.command === 'uninstall') {
    runDshPlugin({ ...options, operation: 'remove' })
    const result = await removePreset({ dshHome: options.dshHome, force: options.force })
    process.stdout.write('Clustr Trading Console 已从 DeepSeek Harness 移除。\n')
    if (result.backup) process.stdout.write(`本地预设已保留：${result.backup}\n`)
    return
  }
  throw new Error(`不支持的命令：${options.command}`)
}

main().catch((error) => {
  process.stderr.write(`Clustr 安装未完成：${String(error?.message ?? error)}\n`)
  process.exitCode = 1
})
