import assert from 'node:assert/strict'
import test from 'node:test'
import { routeOrderIntent } from '../src/order-routing.js'

test('requires an explicit supported exchange', () => {
  assert.throws(() => routeOrderIntent({ market: 'spot' }, { readOnly: true }), /明确指定 exchange/)
  assert.deepEqual(routeOrderIntent({ exchange: 'bybit', profile: 'primary' }, { readOnly: true }), { exchange: 'bybit', profile: 'primary' })
  assert.throws(() => routeOrderIntent({ exchange: 'hyperliquid' }, { readOnly: true }), /不支持交易执行/)
})

test('binds every write intent to the exact authorized exchange and profile', () => {
  const mode = { readOnly: false, exchange: 'binance', profile: 'primary' }
  assert.deepEqual(routeOrderIntent({ exchange: 'binance', profile: 'primary' }, mode), { exchange: 'binance', profile: 'primary' })
  assert.throws(() => routeOrderIntent({ exchange: 'okx', profile: 'demo' }, mode), /不一致/)
  assert.throws(() => routeOrderIntent({ exchange: 'binance', profile: 'other' }, mode), /不一致/)
})
