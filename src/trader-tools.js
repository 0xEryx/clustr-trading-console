import { ANALYSIS_METHODS } from './analysis.js'

function schema(properties, required = []) {
  return { type: 'object', properties, required, additionalProperties: false }
}

const objectOutput = {
  schema: { type: 'object', additionalProperties: true },
  render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
}

function ok(data) { return { status: 'ok', data } }
function rejected(reason) { return { status: 'rejected', reason } }
function preserveStatus(value) { return value && typeof value === 'object' && typeof value.status === 'string' ? value : ok(value) }
function concludeIfRequested(args, exec) {
  if (args?.direct === true && typeof exec?.concludeTurn === 'function') exec.concludeTurn()
}
function number(value) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null }

export function registerTraderTools(toolsSvc, services = {}) {
  if (!toolsSvc) return []
  const core = services.core ?? {}
  const definitions = [
    {
      name: 'clustr_context',
      description: '[Clustr 上下文 · 只读] 读取当前会话状态或全部已连接账户。snapshot 返回 Console 标的、能力、执行保护与待核对订单；accounts 返回分交易所余额、持仓、权限风险与执行边界。精确事实查询可设置 direct=true 直接结束本轮。',
      parameters: schema({ action: { type: 'string', enum: ['snapshot', 'accounts'] }, direct: { type: 'boolean' } }, ['action']),
      timeoutMs: 35_000,
      isConcurrencySafe: () => true,
      async execute(args, exec) {
        const data = args.action === 'accounts'
          ? await services.accountsOverview()
          : await services.contextSnapshot({ sessionId: exec?.agent?.id })
        concludeIfRequested(args, exec)
        return ok(data)
      },
    },
    {
      name: 'clustr_market',
      description: '[Clustr 市场数据包 · 只读] 从指定交易所读取紧凑行情证据包，包含价格、数据年龄、趋势、ATR、波动、支撑阻力、量能异常、点差、深度与失衡；不会把整段原始 K 线塞入上下文。action=consensus 时比较多交易所价格但不混合来源。',
      parameters: schema({ action: { type: 'string', enum: ['packet', 'consensus'] }, exchange: { type: 'string', enum: ['okx', 'binance', 'bybit', 'hyperliquid'] }, instId: { type: 'string' }, marketType: { type: 'string' }, bar: { type: 'string' }, limit: { type: 'number' }, direct: { type: 'boolean' } }, ['action', 'instId']),
      timeoutMs: 35_000,
      isConcurrencySafe: () => true,
      async execute(args, exec) {
        const data = args.action === 'consensus'
          ? await services.marketConsensus({ instId: String(args.instId).toUpperCase() })
          : await services.marketPacket({ exchange: args.exchange ?? 'okx', instId: String(args.instId).toUpperCase(), marketType: args.marketType, bar: args.bar ?? '15m', limit: args.limit })
        concludeIfRequested(args, exec)
        return ok(data)
      },
    },
    {
      name: 'clustr_analysis',
      description: '[Clustr 按需分析工具库 · 只读] 仅在用户主动指定方法时运行。支持威科夫、艾略特波浪、江恩角度、道氏、一目均衡、斐波那契、成交量分布、SMC、海龟突破以及三套指标组合。统一返回结构匹配、证据、反证、关键位和失效条件；不会随 K 线预览自动运行。',
      parameters: schema({ method: { type: 'string', enum: ANALYSIS_METHODS.map((item) => item.id) }, exchange: { type: 'string', enum: ['okx', 'binance', 'bybit', 'hyperliquid'] }, instId: { type: 'string' }, marketType: { type: 'string' }, bar: { type: 'string' }, limit: { type: 'number' } }, ['method', 'instId']),
      timeoutMs: 35_000,
      isConcurrencySafe: () => true,
      execute: async (args) => ok(await services.marketAnalysis({ method: args.method, exchange: args.exchange ?? 'okx', instId: String(args.instId).toUpperCase(), marketType: args.marketType, bar: args.bar ?? '1H', limit: Math.min(Math.max(number(args.limit) || 200, 40), 300) })),
    },
    {
      name: 'clustr_risk',
      description: '[Clustr 确定性风险内核] action=position_size 计算风险仓位；expectancy 计算期望值；pretrade 检查数据时效、滑点、规模、止损、单笔风险和日亏损，并在通过时生成短时单次执行许可。模型信心不能改变硬限制。',
      parameters: schema({
        action: { type: 'string', enum: ['position_size', 'expectancy', 'pretrade'] }, instId: { type: 'string' }, exchange: { type: 'string' }, side: { type: 'string', enum: ['buy', 'sell'] },
        equityUsdt: { type: 'number' }, riskPercent: { type: 'number' }, entryPrice: { type: 'number' }, stopPrice: { type: 'number' }, quantity: { type: 'number' }, leverage: { type: 'number' }, dataAgeMs: { type: 'number' }, slippageBps: { type: 'number' }, dailyLossPercent: { type: 'number' },
        winRate: { type: 'number' }, averageWinR: { type: 'number' }, averageLossR: { type: 'number' }, trades: { type: 'number' },
      }, ['action']),
      timeoutMs: 10_000,
      isConcurrencySafe: (args) => args?.action !== 'pretrade',
      async execute(args) {
        if (args.action === 'position_size') {
          const equity = number(args.equityUsdt), risk = number(args.riskPercent), entry = number(args.entryPrice), stop = number(args.stopPrice)
          if (![equity, risk, entry, stop].every(Number.isFinite) || equity <= 0 || risk <= 0 || risk > 10 || entry <= 0 || stop <= 0 || entry === stop) return rejected('参数无效；riskPercent 必须在 0–10 之间，且入场价不能等于止损价。')
          const riskBudgetUsdt = equity * risk / 100
          const quantity = riskBudgetUsdt / Math.abs(entry - stop)
          return ok({ riskBudgetUsdt, quantity, notionalUsdt: quantity * entry, stopDistancePercent: Math.abs(entry - stop) / entry * 100 })
        }
        if (args.action === 'expectancy') {
          const winRate = number(args.winRate), averageWinR = number(args.averageWinR), averageLossR = Math.abs(number(args.averageLossR)), trades = Math.max(1, number(args.trades) || 100)
          if (![winRate, averageWinR, averageLossR].every(Number.isFinite) || winRate < 0 || winRate > 1 || averageWinR < 0 || averageLossR <= 0) return rejected('参数无效；winRate 使用 0–1 小数形式。')
          const expectancyR = winRate * averageWinR - (1 - winRate) * averageLossR
          return ok({ expectancyR, breakEvenWinRate: averageLossR / (averageWinR + averageLossR), estimatedR: expectancyR * trades, trades })
        }
        return ok(await core.recordRiskEvaluation(args))
      },
    },
    {
      name: 'clustr_order',
      description: '[Clustr 订单生命周期] 显式支持 OKX 现货/永续、Binance 现货/U 本位永续，以及 Bybit 现货/线性/反向合约的 place、cancel、close 与 status。必须明确 exchange，模型不得猜测执行账户。新增风险必须携带 clustr_risk 单次许可，并经过账户验证、授权范围、确定性风控和 Harness 逐笔审批；超时进入状态核对中，禁止盲目重试。Hyperliquid 当前不通过此工具执行。',
      parameters: schema({
        exchange: { type: 'string', enum: ['okx', 'binance', 'bybit'] }, profile: { type: 'string' }, action: { type: 'string', enum: ['place', 'cancel', 'close', 'status'] }, market: { type: 'string', enum: ['spot', 'swap', 'usd-m-futures', 'linear', 'inverse'] }, instId: { type: 'string' },
        tdMode: { type: 'string', enum: ['cash', 'cross', 'isolated'] }, side: { type: 'string', enum: ['buy', 'sell'] }, posSide: { type: 'string', enum: ['long', 'short', 'net'] }, ordType: { type: 'string', enum: ['market', 'limit', 'post_only', 'fok', 'ioc'] }, size: { type: 'string' }, targetCurrency: { type: 'string', enum: ['base_ccy', 'quote_ccy', 'margin'] }, price: { type: 'string' }, reduceOnly: { type: 'boolean' },
        timeInForce: { type: 'string', enum: ['GTC', 'IOC', 'FOK', 'GTX'] }, takeProfitTrigger: { type: 'string' }, takeProfitPrice: { type: 'string' }, stopLossTrigger: { type: 'string' }, stopLossPrice: { type: 'string' }, orderId: { type: 'string' }, clientOrderId: { type: 'string' }, riskPermit: { type: 'string' }, autoCancel: { type: 'boolean' },
      }, ['exchange', 'action', 'market', 'instId']),
      timeoutMs: 45_000,
      isConcurrencySafe: (args) => args?.action === 'status',
      execute: async (args, exec) => preserveStatus(await services.executeOrder(args, exec)),
    },
    {
      name: 'clustr_thesis',
      description: '[Clustr 交易论点] create/list/transition/decision 管理带入场条件、反证、失效条件、期限和审计记录的交易论点；不会执行订单。',
      parameters: schema({ action: { type: 'string', enum: ['create', 'list', 'transition', 'decision'] }, thesisId: { type: 'string' }, status: { type: 'string' }, reason: { type: 'string' }, actor: { type: 'string' }, instId: { type: 'string' }, exchange: { type: 'string' }, timeframe: { type: 'string' }, direction: { type: 'string', enum: ['long', 'short', 'neutral'] }, statement: { type: 'string' }, entryCondition: { type: 'string' }, invalidation: { type: 'string' }, expectedPath: { type: 'string' }, expiresAt: { type: 'string' }, riskBudgetPercent: { type: 'number' }, confidence: { type: 'number' }, opinions: { type: 'array', items: { type: 'object', additionalProperties: true } }, limit: { type: 'number' } }, ['action']),
      timeoutMs: 10_000,
      isConcurrencySafe: (args) => args?.action === 'list',
      async execute(args) {
        if (args.action === 'list') return ok(await core.listTheses(args))
        if (args.action === 'transition') return ok(await core.transitionThesis(String(args.thesisId), args))
        if (args.action === 'decision') return ok(await core.decisionRoom(String(args.thesisId), { opinions: args.opinions }))
        return ok(await core.createThesis(args))
      },
    },
    {
      name: 'clustr_simulation',
      description: '[Clustr 对照与回放] action=shadow 创建不下真实订单的对照方案；replay 创建按事件时间逐步开放的 K 线回放。',
      parameters: schema({ action: { type: 'string', enum: ['shadow', 'replay'] }, thesisId: { type: 'string' }, exchange: { type: 'string', enum: ['okx', 'binance', 'bybit', 'hyperliquid'] }, instId: { type: 'string' }, marketType: { type: 'string' }, bar: { type: 'string' }, limit: { type: 'number' }, initialBars: { type: 'number' } }, ['action']),
      timeoutMs: 35_000,
      isConcurrencySafe: () => false,
      execute: async (args) => ok(args.action === 'shadow' ? await core.createShadow(String(args.thesisId), {}) : await services.startReplay(args)),
    },
    {
      name: 'clustr_memory',
      description: '[Clustr 交易记忆] record 记录结果与人工复盘标签；review 在样本充分时汇总计划遵循度、R 倍数和重复错误。模型自报不能冒充已验证事实。',
      parameters: schema({ action: { type: 'string', enum: ['record', 'review'] }, thesisId: { type: 'string' }, instId: { type: 'string' }, instrument: { type: 'string' }, outcomeR: { type: 'number' }, pnlUsdt: { type: 'number' }, followedPlan: { type: 'boolean' }, analysisQuality: { type: 'number' }, executionQuality: { type: 'number' }, lesson: { type: 'string' }, errorTags: { type: 'array', items: { type: 'string' } }, limit: { type: 'number' } }, ['action']),
      timeoutMs: 10_000,
      isConcurrencySafe: (args) => args?.action === 'review',
      execute: async (args) => ok(args.action === 'review' ? await core.memoryReview(args) : await core.recordMemory(args)),
    },
    {
      name: 'clustr_provenance',
      description: '[Clustr 决策溯源 · 只读] 查询事实来源、数据时间、模型判断、规则版本、审批、订单与状态变化记录。',
      parameters: schema({ entityType: { type: 'string' }, entityId: { type: 'string' }, limit: { type: 'number' } }),
      timeoutMs: 10_000,
      isConcurrencySafe: () => true,
      execute: async (args) => ok(await core.provenance(args)),
    },
    {
      name: 'clustr_operating_status',
      description: '[Clustr 运行状态 · 只读] action=core 查看统一操作内核与能力边界；autonomy 查看当前自主等级、作用域、到期和已使用订单数。',
      parameters: schema({ action: { type: 'string', enum: ['core', 'autonomy'] }, direct: { type: 'boolean' } }, ['action']),
      timeoutMs: 10_000,
      isConcurrencySafe: () => true,
      async execute(args, exec) {
        const data = args.action === 'autonomy' ? await core.autonomyStatus() : await core.status()
        concludeIfRequested(args, exec)
        return ok(data)
      },
    },
  ]
  return definitions.map((definition) => toolsSvc.register({ ...definition, output: objectOutput }))
}
