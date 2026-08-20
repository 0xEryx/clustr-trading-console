import test from 'node:test'
import assert from 'node:assert/strict'
import { readExchangeAccount } from '../src/account-adapters.js'

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } })
}

test('OKX account verification detects unsafe permissions without exposing credentials', async () => {
  const seen = []
  const fetchImpl = async (url, options) => {
    seen.push({ path: new URL(url).pathname, authorization: options.headers['OK-ACCESS-KEY'] })
    if (new URL(url).pathname.endsWith('/balance')) return jsonResponse({ code: '0', data: [{ totalEq: '10', details: [] }] })
    if (new URL(url).pathname.endsWith('/positions')) return jsonResponse({ code: '0', data: [] })
    if (new URL(url).pathname.endsWith('/orders-pending')) return jsonResponse({ code: '0', data: [{ ordId: 'order-1', clOrdId: 'clstr-1', instId: 'BTC-USDT', instType: 'SPOT', side: 'buy', ordType: 'limit', sz: '0.01', accFillSz: '0', px: '50000', state: 'live' }] })
    return jsonResponse({ code: '0', data: [{ perm: 'read_only,trade,withdraw' }] })
  }
  const result = await readExchangeAccount('okx', { apiKey: 'api-sentinel', secretKey: 'secret-sentinel', passphrase: 'pass-sentinel' }, { fetchImpl })
  assert.equal(result.readStatus, 'ready')
  assert.equal(result.security.canTrade, true)
  assert.equal(result.security.highRisk, true)
  assert.equal(result.orders.length, 1)
  assert.equal(result.orders[0].clientOrderId, 'clstr-1')
  assert.equal(JSON.stringify(result).includes('sentinel'), false)
  assert.equal(seen.length, 4)
})

test('network failures produce an actionable sanitized account state', async () => {
  const result = await readExchangeAccount('okx', { apiKey: 'api-sentinel', secretKey: 'secret-sentinel', passphrase: 'pass-sentinel' }, { fetchImpl: async () => { throw new Error('socket failed with secret-sentinel') } })
  assert.equal(result.readStatus, 'error')
  assert.equal(result.errors.every((item) => item.reason === '交易所连接异常'), true)
  assert.equal(JSON.stringify(result).includes('sentinel'), false)
})

test('OKX passphrase rejection is translated into a safe user action', async () => {
  const result = await readExchangeAccount('okx', { apiKey: 'api-sentinel', secretKey: 'secret-sentinel', passphrase: 'pass-sentinel' }, { fetchImpl: async () => jsonResponse({ code: '50105' }, 401) })
  assert.equal(result.readStatus, 'error')
  assert.equal(result.errors[0].reason, 'API Passphrase 与创建该 API Key 时设置的 Passphrase 不一致')
  assert.equal(JSON.stringify(result).includes('sentinel'), false)
})

test('OKX IP rejection is translated into a safe user action', async () => {
  const result = await readExchangeAccount('okx', { apiKey: 'api-sentinel', secretKey: 'secret-sentinel', passphrase: 'pass-sentinel' }, { fetchImpl: async () => jsonResponse({ code: '50110' }, 401) })
  assert.equal(result.readStatus, 'error')
  assert.equal(result.errors[0].reason, '当前网络出口未加入 API Key 的 IP 白名单')
  assert.equal(JSON.stringify(result).includes('sentinel'), false)
})

test('Binance reports spot-only credentials as partially readable', async () => {
  const fetchImpl = async (url) => {
    const path = new URL(url).pathname
    if (path === '/api/v3/account') return jsonResponse({ canTrade: false, canWithdraw: false, permissions: ['SPOT'], balances: [{ asset: 'USDT', free: '2', locked: '0' }] })
    return jsonResponse({ code: -2015 }, 401)
  }
  const result = await readExchangeAccount('binance', { apiKey: 'api-sentinel', secretKey: 'secret-sentinel' }, { fetchImpl })
  assert.equal(result.readStatus, 'partial')
  assert.equal(result.balances.length, 1)
  assert.equal(result.security.highRisk, false)
  assert.equal(JSON.stringify(result).includes('sentinel'), false)
})

test('Bybit unified account maps wallet, positions and permissions', async () => {
  const fetchImpl = async (url) => {
    const path = new URL(url).pathname
    if (path === '/v5/account/wallet-balance') return jsonResponse({ retCode: 0, result: { list: [{ totalEquity: '12', coin: [{ coin: 'USDT', walletBalance: '12', usdValue: '12' }] }] } })
    if (path === '/v5/user/query-api') return jsonResponse({ retCode: 0, result: { readOnly: 1, permissions: { ContractTrade: ['Order'] } } })
    return jsonResponse({ retCode: 0, result: { list: [] } })
  }
  const result = await readExchangeAccount('bybit', { apiKey: 'api-sentinel', secretKey: 'secret-sentinel' }, { fetchImpl })
  assert.equal(result.readStatus, 'ready')
  assert.equal(result.balances.length, 1)
  assert.equal(result.security.canTrade, false)
  assert.equal(JSON.stringify(result).includes('sentinel'), false)
})

test('Hyperliquid reads public account state from an address only', async () => {
  const fetchImpl = async (_url, options) => {
    const body = JSON.parse(options.body)
    if (body.type === 'clearinghouseState') return jsonResponse({ marginSummary: { accountValue: '20' }, assetPositions: [] })
    if (body.type === 'spotClearinghouseState') return jsonResponse({ balances: [{ coin: 'USDC', total: '20', hold: '1' }] })
    return jsonResponse([])
  }
  const result = await readExchangeAccount('hyperliquid', { accountAddress: '0x1111111111111111111111111111111111111111' }, { fetchImpl })
  assert.equal(result.readStatus, 'ready')
  assert.equal(result.balances.length, 1)
  assert.equal(result.openOrderCount, 0)
})

test('non-JSON regional rejection is not misreported as a credential leak', async () => {
  const result = await readExchangeAccount('bybit', { apiKey: 'api-sentinel', secretKey: 'secret-sentinel' }, { fetchImpl: async () => new Response('<html>blocked</html>', { status: 403 }) })
  assert.equal(result.readStatus, 'error')
  assert.equal(result.errors[0].reason, '交易所拒绝当前地区或网络访问')
  assert.equal(JSON.stringify(result).includes('sentinel'), false)
})
