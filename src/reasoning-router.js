const MAX_PATTERNS = /(?:深度|对抗式|压力测试|全面推演|极端情景|最强反方|maximum|max\b|deep\s+analysis)/i
const HIGH_PATTERNS = /(?:分析|威科夫|趋势|结构|支撑|阻力|论点|反证|失效|计划|策略|复盘|相关性|情景|风险收益|下单|买入|卖出|开仓|平仓|减仓|撤单|止损|止盈|交易意图|执行订单|execute|place\s+order|buy|sell|position)/i
const OFF_PATTERNS = /(?:价格|行情|ticker|报价|多少钱|余额|持仓|订单状态|权限|连接|账户|健康状态|当前状态|price|quote|balance|holdings?|permission|connected|account|status|你好|在吗)/i

function contentText(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map((block) => {
    if (typeof block === 'string') return block
    if (!block || typeof block !== 'object') return ''
    return typeof block.text === 'string' ? block.text : ''
  }).filter(Boolean).join('\n')
}

export function latestPromptText(messages = []) {
  return [...messages].reverse().map((message) => contentText(message?.content)).find(Boolean) ?? ''
}

export function routeReasoningEffort(text) {
  const value = String(text ?? '').trim()
  if (MAX_PATTERNS.test(value)) return 'max'
  if (HIGH_PATTERNS.test(value)) return 'high'
  if (OFF_PATTERNS.test(value)) return 'off'
  return 'high'
}

export function installReasoningRouter(ctx) {
  const byAgent = new WeakMap()
  const disposePreStep = ctx.on('agent/pre-step', async ({ agent, messages, turn }, next) => {
    const decision = await next()
    if (decision.kind === 'reject') return decision
    const text = latestPromptText(messages)
    if (text) byAgent.set(agent, { turn, effort: routeReasoningEffort(text) })
    return decision
  })
  const disposeRequest = ctx.on('agent/request', async ({ agent, turn }, next) => {
    const config = await next()
    const route = byAgent.get(agent)
    if (!route || route.turn !== turn) return config
    const target = `${config.provider ?? ''}/${config.model ?? ''}`
    if (!/deepseek/i.test(target)) return config
    const maxTokens = route.effort === 'off' ? 1200 : route.effort === 'high' ? 2600 : 4096
    return {
      ...config,
      reasoningEffort: route.effort,
      ...(maxTokens === undefined ? {} : { maxTokens }),
    }
  })
  return () => {
    disposeRequest()
    disposePreStep()
  }
}
