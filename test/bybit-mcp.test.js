import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import test from 'node:test'
import { BybitMcpBridge, BybitTradingAdapter, normalizeBybitOrder, __test } from '../src/bybit-mcp.js'

class FakeBridge {
  constructor(handler) { this.handler = handler; this.calls = [] }
  async callTool(name, args) { this.calls.push({ name, args }); return this.handler(name, args, this.calls) }
}

function ok(result) { return { retCode: 0, retMsg: 'OK', result, time: Date.now() } }

test('Bybit order mapping uses official MCP schema and stable orderLinkId', () => {
  const args = __test.orderArguments({ market: 'linear', instId: 'BTCUSDT', side: 'buy', posSide: 'long', ordType: 'post_only', size: '0.001', price: '60000', clientOrderId: 'clstr_abc-1', reduceOnly: false })
  assert.deepEqual(args, {
    category: 'linear', symbol: 'BTCUSDT', side: 'Buy', orderType: 'Limit', qty: '0.001', orderLinkId: 'clstr_abc-1', timeInForce: 'PostOnly', price: '60000', positionIdx: '1', reduceOnly: false,
  })
  assert.throws(() => __test.orderArguments({ market: 'option', instId: 'BTC', side: 'buy', ordType: 'market', size: '1', clientOrderId: 'x' }), /spot、linear 或 inverse/)
})

test('Bybit adapter places through official createOrder and keeps ACK distinct from fill', async () => {
  const bridge = new FakeBridge((name, args) => {
    assert.equal(name, 'createOrder')
    assert.equal(args.orderLinkId, 'clstr123')
    return ok({ orderId: 'exchange-1', orderLinkId: 'clstr123' })
  })
  const adapter = new BybitTradingAdapter({ bridge })
  const row = await adapter.placeOrder({ market: 'spot', instId: 'BTCUSDT', side: 'buy', ordType: 'market', size: '0.01', clientOrderId: 'clstr123' })
  assert.equal(row.status, 'Acknowledged')
  assert.equal(row.orderId, 'exchange-1')
  assert.equal(row.filledSize, null)
})

test('Bybit adapter checks realtime then history without creating a replacement order', async () => {
  const bridge = new FakeBridge((name) => name === 'getOpenOrders'
    ? ok({ list: [] })
    : ok({ list: [{ symbol: 'BTCUSDT', orderId: '42', orderLinkId: 'clstr42', orderStatus: 'Filled', qty: '0.01', cumExecQty: '0.01', avgPrice: '61000' }] }))
  const adapter = new BybitTradingAdapter({ bridge })
  const row = await adapter.queryOrder({ market: 'linear', instId: 'BTCUSDT', clientOrderId: 'clstr42' })
  assert.equal(row.status, 'Filled')
  assert.equal(row.averageFillPrice, 61000)
  assert.deepEqual(bridge.calls.map((call) => call.name), ['getOpenOrders', 'getOrderHistory'])
  assert.equal(bridge.calls.some((call) => call.name === 'createOrder'), false)
})

test('Bybit linear orders use official pre-check and instrument/ticker facts', async () => {
  const bridge = new FakeBridge((name) => {
    if (name === 'getInstrumentsInfo') return ok({ list: [{ symbol: 'BTCUSDT', status: 'Trading', baseCoin: 'BTC', quoteCoin: 'USDT', settleCoin: 'USDT', lotSizeFilter: { minOrderQty: '0.001', qtyStep: '0.001' }, priceFilter: { tickSize: '0.1' } }] })
    if (name === 'getTickers') return ok({ list: [{ symbol: 'BTCUSDT', lastPrice: '60000' }] })
    if (name === 'preCheckOrder') return ok({ preImrE4: '100', postImrE4: '110' })
    throw new Error(`unexpected ${name}`)
  })
  const adapter = new BybitTradingAdapter({ bridge })
  const metadata = await adapter.instrument('linear', 'BTCUSDT')
  const ticker = await adapter.ticker('linear', 'BTCUSDT')
  const precheck = await adapter.preCheckOrder({ market: 'linear', instId: 'BTCUSDT', side: 'buy', posSide: 'net', ordType: 'limit', size: '0.001', price: '60000', clientOrderId: 'clstrpre' })
  assert.equal(metadata.market, 'linear')
  assert.equal(metadata.lotSz, '0.001')
  assert.equal(ticker.price, 60000)
  assert.equal(precheck.postImrE4, '110')
})

test('Bybit close uses the exact official position and a reduce-only opposite order', async () => {
  const bridge = new FakeBridge((name, args) => {
    if (name === 'getPositionInfo') return ok({ list: [{ symbol: 'BTCUSDT', side: 'Buy', size: '0.02', positionIdx: 1 }] })
    if (name === 'createOrder') {
      assert.equal(args.side, 'Sell')
      assert.equal(args.qty, '0.02')
      assert.equal(args.positionIdx, '1')
      assert.equal(args.reduceOnly, true)
      return ok({ orderId: 'close-1', orderLinkId: args.orderLinkId })
    }
    throw new Error(`unexpected ${name}`)
  })
  const adapter = new BybitTradingAdapter({ bridge })
  const row = await adapter.closePosition({ market: 'linear', instId: 'BTCUSDT', posSide: 'long', clientOrderId: 'clstrclose' })
  assert.equal(row.orderId, 'close-1')
})

test('Bybit MCP bridge rejects every non-whitelisted official tool before startup', async () => {
  const bridge = new BybitMcpBridge({ credentials: { apiKey: 'api-sentinel', secretKey: 'secret-sentinel' } })
  await assert.rejects(bridge.callTool('createInternalTransfer', {}), /安全白名单/)
})

test('Bybit MCP credentials travel only in the child environment and are redacted from failures', async () => {
  const apiKey = 'BYBIT-API-SENTINEL'
  const secretKey = 'BYBIT-SECRET-SENTINEL'
  let spawnRecord
  const spawnImpl = (command, args, options) => {
    spawnRecord = { command, args, options }
    const child = new EventEmitter()
    child.stdout = new PassThrough()
    child.stderr = new PassThrough()
    child.stdin = {
      write(line) {
        const request = JSON.parse(line)
        queueMicrotask(() => {
          if (request.method === 'initialize') child.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: request.id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'fake', version: '1' } } }) + '\n')
          if (request.method === 'tools/list') child.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: request.id, result: { tools: __test.REQUIRED_TOOLS.map((name) => ({ name })) } }) + '\n')
          if (request.method === 'tools/call') child.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: request.id, result: { isError: true, content: [{ type: 'text', text: `rejected ${apiKey} ${secretKey}` }] } }) + '\n')
        })
        return true
      },
    }
    child.kill = () => { queueMicrotask(() => child.emit('exit', 0)); return true }
    return child
  }
  const bridge = new BybitMcpBridge({ credentials: { apiKey, secretKey }, spawnImpl, binResolver: () => '/safe/bybit-server', baseEnv: {} })
  await bridge.start()
  assert.doesNotMatch(JSON.stringify([spawnRecord.command, spawnRecord.args]), new RegExp(`${apiKey}|${secretKey}`))
  assert.equal(spawnRecord.options.env.BYBIT_API_KEY, apiKey)
  assert.equal(spawnRecord.options.env.BYBIT_API_SECRET, secretKey)
  await assert.rejects(bridge.callTool('queryAPIKey', {}), (error) => {
    assert.doesNotMatch(`${error.message} ${error.detail}`, new RegExp(`${apiKey}|${secretKey}`))
    assert.match(error.detail, /\[REDACTED\]/)
    return true
  })
  await bridge.dispose()
})

test('Bybit order normalization does not confuse acknowledgment with execution', () => {
  const row = normalizeBybitOrder({ orderId: '1', orderLinkId: 'c1', orderStatus: 'PartiallyFilled', qty: '2', cumExecQty: '0.5', avgPrice: '10' }, 'inverse')
  assert.equal(row.market, 'inverse')
  assert.equal(row.status, 'PartiallyFilled')
  assert.equal(row.filledSize, 0.5)
})
