import test from 'node:test'
import assert from 'node:assert/strict'
import { checkWrite } from '../src/risk.js'

const autonomy = { definition: { level: 3 } }
const config = { readOnly: false, risk: { maxOrderNotionalUsdt: 5000 } }

test('risk gate uses verified spot precision and fresh price', () => {
  const state = {
    lastPrices: new Map([['BTC-USDT', 50000]]), lastPriceAt: new Map([['BTC-USDT', Date.now()]]),
    instrumentMetadata: new Map([['BTC-USDT', { instId: 'BTC-USDT', minSz: '0.0001', lotSz: '0.0001', tickSz: '0.1' }]]),
    dailyNotional: 0,
  }
  const result = checkWrite({ toolName: 'spot_place_order', args: { instId: 'BTC-USDT', sz: '0.01', px: '50000.0' }, config, state, autonomy })
  assert.equal(result.ok, true)
  assert.equal(result.notional, 500)
})

test('risk gate calculates linear swap notional using contract value', () => {
  const state = {
    lastPrices: new Map([['BTC-USDT-SWAP', 50000]]), lastPriceAt: new Map([['BTC-USDT-SWAP', Date.now()]]),
    instrumentMetadata: new Map([['BTC-USDT-SWAP', { instId: 'BTC-USDT-SWAP', minSz: '1', lotSz: '1', tickSz: '0.1', ctVal: '0.01', ctValCcy: 'BTC', quoteCcy: 'USDT' }]]),
    dailyNotional: 0,
  }
  const result = checkWrite({ toolName: 'swap_place_order', args: { instId: 'BTC-USDT-SWAP', sz: '2', px: '50000.0' }, config, state, autonomy })
  assert.equal(result.ok, true)
  assert.equal(result.notional, 1000)
})

test('risk gate fails closed on missing metadata or invalid precision', () => {
  const base = { lastPrices: new Map([['BTC-USDT', 50000]]), lastPriceAt: new Map([['BTC-USDT', Date.now()]]), instrumentMetadata: new Map(), dailyNotional: 0 }
  assert.equal(checkWrite({ toolName: 'spot_place_order', args: { instId: 'BTC-USDT', sz: '0.01' }, config, state: base, autonomy }).ok, false)
  base.instrumentMetadata.set('BTC-USDT', { minSz: '0.001', lotSz: '0.001', tickSz: '0.1' })
  assert.equal(checkWrite({ toolName: 'spot_place_order', args: { instId: 'BTC-USDT', sz: '0.0009' }, config, state: base, autonomy }).ok, false)
})

test('risk gate enforces Binance quantity, price and notional filters', () => {
  const state = {
    lastPrices: new Map([['BTCUSDT', 50000]]), lastPriceAt: new Map([['BTCUSDT', Date.now()]]),
    instrumentMetadata: new Map([['BTCUSDT', { minSz: '0.001', maxSz: '2', lotSz: '0.001', minPx: '100', maxPx: '100000', tickSz: '0.1', minNotional: '10', maxNotional: '6000' }]]), dailyNotional: 0,
  }
  assert.equal(checkWrite({ toolName: 'binance_place_order', args: { instId: 'BTCUSDT', sz: '0.001', px: '50000' }, config, state, autonomy }).ok, true)
  assert.match(checkWrite({ toolName: 'binance_place_order', args: { instId: 'BTCUSDT', sz: '0.0001', px: '50000' }, config, state, autonomy }).reason, /最小值/)
  assert.match(checkWrite({ toolName: 'binance_place_order', args: { instId: 'BTCUSDT', sz: '0.001', px: '99.9' }, config, state, autonomy }).reason, /价格低于/)
  assert.match(checkWrite({ toolName: 'binance_place_order', args: { instId: 'BTCUSDT', sz: '0.001', px: '500.0' }, config, state, autonomy }).reason, /名义价值低于/)
})

test('risk gate distinguishes Bybit linear base quantity from inverse USD contracts', () => {
  const now = Date.now()
  const linear = {
    lastPrices: new Map([['BTCUSDT', 50000]]), lastPriceAt: new Map([['BTCUSDT', now]]),
    instrumentMetadata: new Map([['BTCUSDT', { market: 'linear', contractMultiplier: 1, minSz: '0.001', lotSz: '0.001', tickSz: '0.1' }]]), dailyNotional: 0,
  }
  const inverse = {
    lastPrices: new Map([['BTCUSD', 50000]]), lastPriceAt: new Map([['BTCUSD', now]]),
    instrumentMetadata: new Map([['BTCUSD', { market: 'inverse', contractMultiplier: 1, minSz: '1', lotSz: '1', tickSz: '0.5' }]]), dailyNotional: 0,
  }
  assert.equal(checkWrite({ toolName: 'bybit_place_order', args: { instId: 'BTCUSDT', sz: '0.01', px: '50000' }, config, state: linear, autonomy }).notional, 500)
  assert.equal(checkWrite({ toolName: 'bybit_place_order', args: { instId: 'BTCUSD', sz: '500', px: '50000' }, config, state: inverse, autonomy }).notional, 500)
})
