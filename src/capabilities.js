const BASE_CAPABILITIES = Object.freeze([
  Object.freeze({
    id: 'okx',
    name: 'OKX',
    accountConnection: 'api-key',
    accountReadAvailable: true,
    executionAvailable: true,
    executionPath: 'OKX Agent Trade Kit',
    marketScopes: Object.freeze(['spot', 'swap']),
  }),
  Object.freeze({
    id: 'binance',
    name: 'Binance',
    accountConnection: 'api-key',
    accountReadAvailable: true,
    executionAvailable: true,
    executionPath: 'Binance Spot / USDⓈ-M REST API',
    marketScopes: Object.freeze(['spot', 'usd-m-futures']),
  }),
  Object.freeze({
    id: 'bybit',
    name: 'Bybit',
    accountConnection: 'api-key',
    accountReadAvailable: true,
    executionAvailable: true,
    executionPath: 'Bybit Official Trading MCP',
    marketScopes: Object.freeze(['spot', 'linear', 'inverse']),
  }),
  Object.freeze({
    id: 'hyperliquid',
    name: 'Hyperliquid',
    availability: 'unavailable',
    accountConnection: 'unavailable',
    accountReadAvailable: false,
    executionAvailable: false,
    executionPath: '未开放',
    marketScopes: Object.freeze(['perpetual', 'spot']),
  }),
])

export function accountProviders({ readOnly = true, executionExchange = null, executionProfile = null } = {}) {
  return BASE_CAPABILITIES.map((provider) => {
    if (provider.availability === 'unavailable') {
      return {
        ...provider,
        marketScopes: [...provider.marketScopes],
        executionEnabled: false,
        executionState: 'unavailable',
        executionLabel: '未开放',
      }
    }
    if (!provider.executionAvailable) {
      return {
        ...provider,
        marketScopes: [...provider.marketScopes],
        executionEnabled: false,
        executionState: 'read-only',
        executionLabel: '仅账户读取',
      }
    }
    const selected = readOnly || provider.id === executionExchange
    return {
      ...provider,
      marketScopes: [...provider.marketScopes],
      executionEnabled: !readOnly && selected,
      executionState: readOnly ? 'protected' : selected ? 'ready' : 'not-selected',
      executionLabel: readOnly ? '只读保护' : selected ? '逐笔审批交易' : '非执行账户',
      executionProfile: !readOnly && selected ? executionProfile : null,
    }
  })
}

export function capabilityManifest({ readOnly = true, executionExchange = null, executionProfile = null } = {}) {
  return accountProviders({ readOnly, executionExchange, executionProfile }).map((provider) => ({
    exchange: provider.id,
    name: provider.name,
    publicMarketData: true,
    marketScopes: provider.marketScopes,
    privateAccountRead: provider.accountReadAvailable,
    executionAvailable: provider.executionAvailable,
    executionEnabled: provider.executionEnabled,
    executionState: provider.executionState,
    executionPath: provider.executionPath,
  }))
}

export function capabilityManifestText({ readOnly = true, executionExchange = null, executionProfile = null } = {}) {
  return capabilityManifest({ readOnly, executionExchange, executionProfile }).map((item) => {
    if (item.executionState === 'unavailable') return `- ${item.name}: 公共行情可用；账户连接与交易执行未开放。`
    const execution = !item.executionAvailable
      ? '不支持执行'
      : item.executionEnabled
        ? '可申请逐笔审批执行'
        : '执行受只读保护'
    return `- ${item.name}: 公共行情可用；私有账户读取视连接状态；${execution}。`
  }).join('\n')
}
