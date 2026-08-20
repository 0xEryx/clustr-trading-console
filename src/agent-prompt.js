import {
  CLUSTR_IDENTITY,
  CLUSTR_OPERATING_PROTOCOL,
  CLUSTR_EXECUTION_ROUTING,
  CLUSTR_SAFETY_CONSTITUTION,
} from './prompt-contract.js'
import { installReasoningRouter } from './reasoning-router.js'
import { markClustrAgentScope } from './tool-scope.js'

export const inject = ['systemPrompt', 'clustrConsole']

export function apply(ctx) {
  const systemPrompt = ctx.get('systemPrompt')
  const clustr = ctx.get('clustrConsole')
  if (!systemPrompt || !clustr) throw new Error('Clustr Agent Prompt 缺少必要运行服务')

  const preset = ctx.agent?.session?.header?.agentPreset
  if (preset && preset !== 'crypto-trader') {
    throw new Error(`Clustr Agent Prompt 只能挂载到 crypto-trader 预设，当前为 ${preset}`)
  }

  let unmarkAgent = null
  const cleanup = [
    () => unmarkAgent?.(),
    // Agent identity is supplied by the assembly request, not while a preset
    // row is being mounted. Mark it before the host's post-waterfall filter
    // evaluates the final tool catalog, then retain it for execution guards.
    ctx.on('system-prompt/assemble', async (_assembly, context, next) => {
      if (!unmarkAgent) unmarkAgent = markClustrAgentScope(context.agent ?? context.scope)
      return next()
    }),
    installReasoningRouter(ctx),
    systemPrompt.section({ name: 'deployment:persona', order: 0, text: CLUSTR_IDENTITY }),
    systemPrompt.section({ name: 'clustr:operating-protocol', order: 145, text: CLUSTR_OPERATING_PROTOCOL }),
    systemPrompt.section({ name: 'clustr:execution-routing', order: 147, text: CLUSTR_EXECUTION_ROUTING }),
    systemPrompt.section({ name: 'clustr:safety-constitution', order: 150, text: CLUSTR_SAFETY_CONSTITUTION }),
    systemPrompt.context({
      name: 'clustr:runtime',
      order: 121,
      text: (context) => clustr.runtimeContextFor(context.agent ?? ctx.agent),
    }),
  ]
  return () => cleanup.reverse().forEach((dispose) => dispose())
}
