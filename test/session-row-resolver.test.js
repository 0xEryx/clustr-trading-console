import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveSessionIdsForRow } from '../src/client/session-row-resolver.js'

const list = {
  ids: ['clustr-a', 'clustr-b', 'code-a', 'archived'],
  current: 'clustr-b',
  byId: {
    'clustr-a': { title: '你好' },
    'clustr-b': { title: '你好' },
    'code-a': { title: '普通会话' },
    archived: { title: '历史会话' },
  },
}
const workspaces = [
  { workspaceId: 'one', title: 'Alpha', sessionIds: ['clustr-a', 'code-a'] },
  { workspaceId: 'two', title: 'Beta', sessionIds: ['clustr-b', 'archived'] },
]

test('duplicate session titles resolve inside their visible workspace', () => {
  assert.deepEqual(resolveSessionIdsForRow({ title: '你好', workspaceTitle: 'Alpha', selected: false }, list, workspaces), ['clustr-a'])
  assert.deepEqual(resolveSessionIdsForRow({ title: '你好', workspaceTitle: 'Beta', selected: false }, list, workspaces), ['clustr-b'])
})

test('the selected row resolves to the exact current session when titles collide', () => {
  assert.deepEqual(resolveSessionIdsForRow({ title: '你好', workspaceTitle: '', selected: true }, list, workspaces), ['clustr-b'])
})

test('archived sessions are never decorated', () => {
  assert.deepEqual(resolveSessionIdsForRow({ title: '历史会话', workspaceTitle: 'Beta', selected: false }, list, workspaces, ['archived']), [])
})

