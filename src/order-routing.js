const EXECUTION_EXCHANGES = new Set(['okx', 'binance', 'bybit'])

function atom(value) { return String(value ?? '').trim().toLowerCase() }

export function routeOrderIntent(input = {}, executionMode = {}) {
  const exchange = atom(input.exchange)
  if (!exchange) throw new Error('交易指令必须明确指定 exchange；Clustr 不会猜测执行账户')
  if (!EXECUTION_EXCHANGES.has(exchange)) throw new Error(`${exchange} 当前不支持交易执行`)
  const profile = atom(input.profile || executionMode.profile || (exchange === 'okx' ? 'demo' : 'default'))
  if (!profile || profile.length > 64 || !/^[a-z0-9._-]+$/.test(profile)) throw new Error('执行账户名称无效')
  if (executionMode.readOnly === false) {
    if (atom(executionMode.exchange) !== exchange || atom(executionMode.profile) !== profile) {
      throw new Error('交易指令与当前获授权的执行账户不一致')
    }
  }
  return { exchange, profile }
}

export const EXECUTION_EXCHANGE_IDS = Object.freeze([...EXECUTION_EXCHANGES])
