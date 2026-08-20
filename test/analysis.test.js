import assert from 'node:assert/strict'
import test from 'node:test'

import { analysisCatalog, analyzeMarket } from '../src/analysis.js'

function fixture(length = 220) {
  return Array.from({ length }, (_, index) => {
    const base = 100 + index * 0.13 + Math.sin(index / 6) * 4
    return [String(1_700_000_000_000 + index * 60_000), String(base - 0.4), String(base + 1), String(base - 1), String(base + 0.4), String(1_000 + index * 3), '0', '0', '1']
  })
}

test('analysis catalog exposes twelve user-activated methods with traceable references', () => {
  const catalog = analysisCatalog()
  assert.equal(catalog.policy, 'user-activated')
  assert.equal(catalog.methods.length, 12)
  assert.equal(new Set(catalog.methods.map((item) => item.id)).size, 12)
  for (const method of catalog.methods) {
    assert.ok(method.minCandles >= 40)
    assert.ok(method.summary.length > 10)
    assert.ok(method.references.length >= 1)
    assert.ok(method.references.every((reference) => /^https:\/\//.test(reference.url)))
  }
})

test('every analysis method returns the standardized evidence contract', () => {
  for (const method of analysisCatalog().methods) {
    const result = analyzeMarket(method.id, fixture(), { instId: 'BTC-USDT', bar: '15m' })
    assert.equal(result.ok, true, method.id)
    assert.equal(result.method, method.id)
    assert.ok(['bullish', 'bearish', 'neutral'].includes(result.signal))
    assert.ok(result.structureMatchScore >= 0 && result.structureMatchScore <= 0.92)
    assert.ok(Array.isArray(result.evidence))
    assert.ok(Array.isArray(result.counterEvidence))
    assert.ok(Array.isArray(result.levels))
    assert.equal(typeof result.invalidation, 'string')
    assert.match(result.disclaimer, /不是.*概率/)
  }
})

test('analysis fails honestly when the selected method lacks enough candles', () => {
  const result = analyzeMarket('elliott-wave', fixture(24), { instId: 'BTC-USDT', bar: '15m' })
  assert.equal(result.ok, false)
  assert.equal(result.method, 'elliott-wave')
  assert.match(result.reason, /至少需要 80 根/)
})

test('unknown analysis methods are rejected instead of falling back silently', () => {
  assert.throws(() => analyzeMarket('magic-alpha', fixture(), {}), /不支持的市场分析方法/)
})
