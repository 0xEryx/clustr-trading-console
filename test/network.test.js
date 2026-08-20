import test from 'node:test'
import assert from 'node:assert/strict'
import { __test } from '../src/network.js'

test('parses enabled macOS HTTP and HTTPS proxies', () => {
  const value = __test.parseScutilProxy(`
    HTTPEnable : 1
    HTTPPort : 10900
    HTTPProxy : 127.0.0.1
    HTTPSEnable : 1
    HTTPSPort : 10901
    HTTPSProxy : localhost
  `)
  assert.deepEqual(value, { httpProxy: 'http://127.0.0.1:10900', httpsProxy: 'http://localhost:10901' })
})

test('always bypasses proxy for loopback and redacts proxy credentials', () => {
  const noProxy = __test.mergeNoProxy('example.test')
  assert.match(noProxy, /127\.0\.0\.1/)
  assert.match(noProxy, /localhost/)
  assert.equal(__test.safeEndpoint('http://user:secret@proxy.test:8080/path'), 'http://proxy.test:8080')
})
