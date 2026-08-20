const HARD_BLOCKED_PATTERNS = [
  /(^|_)withdraw(al)?($|_)/i,
  /(^|_)transfer($|_)/i,
  /(^|_)sub_?account.*(transfer|move)/i,
  /(^|_)(deposit|address_?whitelist)($|_)/i,
]

export function classifyTool(tool) {
  const name = String(tool?.name ?? '')
  const annotations = tool?.annotations && typeof tool.annotations === 'object' ? tool.annotations : {}
  if (HARD_BLOCKED_PATTERNS.some((pattern) => pattern.test(name))) {
    return { capability: 'funds', write: true, blocked: true, reason: '资金转移与提现能力在 Clustr Trading Console 中永久禁用' }
  }
  if (annotations.readOnlyHint === true) return { capability: 'read', write: false, blocked: false }
  if (annotations.readOnlyHint === false) return { capability: annotations.destructiveHint === true ? 'destructive' : 'trade', write: true, blocked: false }
  return { capability: 'unknown', write: true, blocked: true, reason: '工具缺少可信的只读/写入能力声明（fail-closed）' }
}

export function moduleOf(name) {
  const match = String(name ?? '').match(/^([a-z0-9]+)_/i)
  return match ? match[1].toLowerCase() : null
}

export function summarize(name, args) {
  const a = args ?? {}
  const side = a.side ? String(a.side).toUpperCase() : '—'
  const inst = a.instId ?? a.symbol ?? ''
  const sz = a.sz ?? a.quantity ?? ''
  const px = a.px ?? a.price ?? '市价'
  return `${name} | ${side} ${inst} ${sz} @ ${px}`
}
