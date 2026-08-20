import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'
import { BinanceExecutionAdapter, BinanceExecutionError } from '../src/binance-execution.js'

function response(status, payload, headers = {}) {
  return { ok: status >= 200 && status < 300, status, headers: { get(name) { return headers[String(name).toLowerCase()] ?? null } }, async text() { return JSON.stringify(payload) } }
}

test('signs a Binance Spot order without exposing the API secret', async () => {
  const calls = []
  const adapter = new BinanceExecutionAdapter({
    credentials: { apiKey: 'key-sentinel', secretKey: 'secret-sentinel' }, now: () => 1_700_000_000_000,
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options })
      return response(200, { symbol: 'BTCUSDT', orderId: 42, clientOrderId: 'clstr-safe-1', status: 'FILLED', side: 'BUY', type: 'MARKET', origQty: '0.01', executedQty: '0.01', cummulativeQuoteQty: '650', transactTime: 1_700_000_000_010 })
    },
  })
  const order = await adapter.placeOrder({ market: 'spot', instId: 'BTCUSDT', side: 'buy', ordType: 'market', size: '0.01', clientOrderId: 'clstr-safe-1' })
  const call = calls[0]
  const parsed = new URL(call.url)
  const signature = parsed.searchParams.get('signature')
  parsed.searchParams.delete('signature')
  const expected = createHmac('sha256', 'secret-sentinel').update(parsed.searchParams.toString()).digest('hex')
  assert.equal(signature, expected)
  assert.equal(call.options.method, 'POST')
  assert.equal(call.options.headers['X-MBX-APIKEY'], 'key-sentinel')
  assert.equal(call.url.includes('secret-sentinel'), false)
  assert.equal(JSON.stringify(call.options).includes('secret-sentinel'), false)
  assert.equal(order.status, 'FILLED')
  assert.equal(order.averageFillPrice, 65_000)
})

test('maps exchange filters into deterministic risk metadata', async () => {
  const adapter = new BinanceExecutionAdapter({ credentials: { apiKey: 'k', secretKey: 's' }, fetchImpl: async () => response(200, { symbols: [{ symbol: 'ETHUSDT', status: 'TRADING', baseAsset: 'ETH', quoteAsset: 'USDT', filters: [{ filterType: 'PRICE_FILTER', minPrice: '0.01', maxPrice: '999999', tickSize: '0.01' }, { filterType: 'LOT_SIZE', minQty: '0.001', maxQty: '1000', stepSize: '0.001' }, { filterType: 'MIN_NOTIONAL', minNotional: '5' }] }] }) })
  const metadata = await adapter.instrument('spot', 'ETHUSDT', 'limit')
  assert.deepEqual({ minSz: metadata.minSz, maxSz: metadata.maxSz, lotSz: metadata.lotSz, tickSz: metadata.tickSz, minNotional: metadata.minNotional }, { minSz: '0.001', maxSz: '1000', lotSz: '0.001', tickSz: '0.01', minNotional: '5' })
})

test('maps USD-M hedge mode without sending reduceOnly in LONG/SHORT mode', async () => {
  let requestUrl = ''
  const adapter = new BinanceExecutionAdapter({ credentials: { apiKey: 'k', secretKey: 's' }, fetchImpl: async (url) => { requestUrl = String(url); return response(200, { symbol: 'BTCUSDT', orderId: 7, clientOrderId: 'clstr-futures', status: 'NEW', side: 'SELL', positionSide: 'LONG', type: 'LIMIT', origQty: '0.01', executedQty: '0' }) } })
  await adapter.placeOrder({ market: 'usd-m-futures', instId: 'BTCUSDT', side: 'sell', posSide: 'long', ordType: 'post_only', size: '0.01', price: '65000', reduceOnly: true, clientOrderId: 'clstr-futures' })
  const query = new URL(requestUrl).searchParams
  assert.equal(query.get('positionSide'), 'LONG')
  assert.equal(query.get('timeInForce'), 'GTX')
  assert.equal(query.has('reduceOnly'), false)
})

test('distinguishes unknown submission outcomes from explicit exchange rejection', async () => {
  const unknown = new BinanceExecutionAdapter({ credentials: { apiKey: 'k', secretKey: 's' }, fetchImpl: async () => response(504, { code: -1007 }) })
  await assert.rejects(unknown.placeOrder({ market: 'spot', instId: 'BTCUSDT', side: 'buy', ordType: 'market', size: '0.01', clientOrderId: 'clstr-unknown' }), (error) => error instanceof BinanceExecutionError && error.outcomeUnknown === true && error.code === '-1007')
  const rejected = new BinanceExecutionAdapter({ credentials: { apiKey: 'k', secretKey: 's' }, fetchImpl: async () => response(400, { code: -2010 }) })
  await assert.rejects(rejected.placeOrder({ market: 'spot', instId: 'BTCUSDT', side: 'buy', ordType: 'market', size: '0.01', clientOrderId: 'clstr-rejected' }), (error) => error instanceof BinanceExecutionError && error.outcomeUnknown === false && error.code === '-2010')
})

test('query and cancel always require a stable order identifier', async () => {
  const adapter = new BinanceExecutionAdapter({ credentials: { apiKey: 'k', secretKey: 's' }, fetchImpl: async () => response(200, {}) })
  await assert.rejects(adapter.queryOrder({ market: 'spot', instId: 'BTCUSDT' }), /orderId 或 clientOrderId/)
  await assert.rejects(adapter.cancelOrder({ market: 'spot', instId: 'BTCUSDT' }), /orderId 或 clientOrderId/)
})

test('fails closed on excessive clock skew and sanitizes permission errors', async () => {
  const skewed = new BinanceExecutionAdapter({ credentials: { apiKey: 'k', secretKey: 'secret-sentinel' }, now: () => 1_000, fetchImpl: async () => response(200, { serverTime: 70_001 }) })
  await assert.rejects(skewed.syncTime('spot'), /相差超过一分钟/)
  const denied = new BinanceExecutionAdapter({ credentials: { apiKey: 'key-sentinel', secretKey: 'secret-sentinel' }, fetchImpl: async () => response(401, { code: -2015, msg: 'secret-sentinel key-sentinel' }) })
  await assert.rejects(denied.account('spot'), (error) => error.code === '-2015' && !error.message.includes('sentinel'))
})

test('surfaces Binance rate limits without classifying them as unknown fills', async () => {
  const adapter = new BinanceExecutionAdapter({ credentials: { apiKey: 'k', secretKey: 's' }, fetchImpl: async () => response(429, { code: -1003 }, { 'retry-after': '2' }) })
  await assert.rejects(adapter.placeOrder({ market: 'spot', instId: 'BTCUSDT', side: 'buy', ordType: 'market', size: '0.01', clientOrderId: 'clstr-rate' }), (error) => error.code === 'RATE_LIMITED' && error.retryAfterMs === 2000 && error.outcomeUnknown === false)
})

test('classifies regional HTTP 451 separately from credential failure', async () => {
  const adapter = new BinanceExecutionAdapter({ credentials: { apiKey: 'k', secretKey: 's' }, fetchImpl: async () => response(451, { code: 0, msg: 'restricted location' }) })
  await assert.rejects(adapter.syncTime('spot'), (error) => error.code === 'REGION_RESTRICTED' && error.status === 451 && /地区或网络/.test(error.message))
})
