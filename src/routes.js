function json(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(text)
}

function query(req) {
  return new URL(req.url ?? '/', 'http://127.0.0.1').searchParams
}

function sameOrigin(req) {
  const host = String(req.headers?.host ?? '')
  const origin = String(req.headers?.origin ?? '')
  return Boolean(host) && (origin === `http://${host}` || origin === `https://${host}`)
}

function samePageRequest(req) {
  if (sameOrigin(req)) return true
  const host = String(req.headers?.host ?? '')
  const referer = String(req.headers?.referer ?? '')
  const fetchSite = String(req.headers?.['sec-fetch-site'] ?? '')
  return fetchSite === 'same-origin' || referer.startsWith(`http://${host}/`) || referer.startsWith(`https://${host}/`)
}

function loopbackRequest(req) {
  const host = String(req.headers?.host ?? '')
  const remote = String(req.socket?.remoteAddress ?? '')
  const trustedHost = /^(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/i.test(host)
  const trustedRemote = !remote || remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1'
  return trustedHost && trustedRemote
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    let finished = false
    req.setEncoding('utf8')
    const onData = (chunk) => {
      if (finished) return
      raw += chunk
      if (raw.length > 16 * 1024) {
        finished = true
        raw = ''
        req.removeListener('data', onData)
        req.resume()
        reject(new Error('请求内容过大'))
      }
    }
    req.on('data', onData)
    req.on('end', () => {
      if (finished) return
      finished = true
      try { resolve(raw ? JSON.parse(raw) : {}) } catch { reject(new Error('JSON 格式无效')) }
    })
    req.on('error', (error) => { if (!finished) { finished = true; reject(error) } })
  })
}

export function registerRoutes(ctx, api) {
  const ws = ctx.get('webServer')
  if (!ws) return () => {}
  const disposers = []
  const get = (path, handler) => {
    disposers.push(ws.register({
      kind: 'exact',
      path,
      handler: (req, res) => {
        if (!loopbackRequest(req)) return json(res, 403, { error: '仅允许本机访问' })
        if (!samePageRequest(req)) return json(res, 403, { error: '请求不是来自当前页面' })
        Promise.resolve()
          .then(() => handler(query(req), req))
          .then((body) => json(res, 200, body ?? {}))
          .catch((e) => json(res, 500, { error: String(e?.message ?? e) }))
      },
    }))
  }
  const post = (path, handler) => {
    disposers.push(ws.register({
      kind: 'exact',
      path,
      handler: (req, res) => {
        if (req.method !== 'POST') return json(res, 405, { error: '请求方式不正确' })
        if (!loopbackRequest(req)) return json(res, 403, { error: '仅允许本机访问' })
        if (!sameOrigin(req)) return json(res, 403, { error: '请求来源被拒绝' })
        const csrf = String(req.headers?.['x-clustr-csrf'] ?? '')
        if (!api.verifyCsrf(csrf)) return json(res, 403, { error: '安全令牌无效，请刷新页面后重试' })
        Promise.resolve()
          .then(() => readBody(req))
          .then((body) => handler(body, req))
          .then((body) => json(res, 200, body ?? {}))
          .catch((e) => json(res, 400, { error: String(e?.message ?? e) }))
      },
    }))
  }
  get('/api/crypto/status', () => api.status())
  get('/api/crypto/tickers', () => api.tickers())
  get('/api/crypto/klines', (q) => api.klines({ instId: q.get('instId'), bar: q.get('bar') ?? '15m', limit: Number(q.get('limit') ?? 200) }))
  get('/api/crypto/account', () => api.account())
  get('/api/crypto/audit', () => api.audit())
  get('/api/clustr/session-tape', (q) => api.sessionTape({ sessionId: q.get('sessionId') || '', limit: Number(q.get('limit') ?? 40) }))
  get('/api/crypto/session', (q) => api.traderSession({ sessionId: q.get('sessionId') || undefined }))
  get('/api/crypto/session-modes', (q) => api.traderSessionModes({ sessionIds: String(q.get('ids') || '').split(',') }))
  get('/api/clustr/context', (q) => api.getSessionContext({ sessionId: q.get('sessionId') || '' }))
  post('/api/crypto/session/bind', (body) => api.bindTraderSession(body))
  post('/api/crypto/session/unbind', (body) => api.unbindTraderSession(body))
  post('/api/clustr/context/update', (body) => api.setSessionContext(body))
  get('/api/clustr/exchanges', () => api.exchanges())
  get('/api/clustr/analysis/catalog', () => api.analysisCatalog())
  get('/api/clustr/analysis/run', (q) => api.marketAnalysis({ method: q.get('method') || 'wyckoff', exchange: q.get('exchange') || 'okx', instId: q.get('instId'), bar: q.get('bar') ?? '1H', limit: Number(q.get('limit') ?? 200), marketType: q.get('marketType') || undefined }))
  get('/api/clustr/analysis/wyckoff', (q) => api.wyckoff({ exchange: q.get('exchange') || 'okx', instId: q.get('instId'), bar: q.get('bar') ?? '1H', limit: Number(q.get('limit') ?? 200), marketType: q.get('marketType') || undefined }))
  get('/api/clustr/market/instruments', (q) => api.searchInstruments({ exchange: q.get('exchange') || 'okx', marketType: q.get('marketType') || undefined, query: q.get('query') || '', limit: Number(q.get('limit') ?? 20) }))
  get('/api/clustr/market/ticker', (q) => api.publicTicker({ exchange: q.get('exchange'), instId: q.get('instId'), marketType: q.get('marketType') || undefined }))
  get('/api/clustr/market/klines', (q) => api.publicKlines({ exchange: q.get('exchange'), instId: q.get('instId'), bar: q.get('bar') ?? '15m', limit: Number(q.get('limit') ?? 200), marketType: q.get('marketType') || undefined }))
  get('/api/clustr/market/book', (q) => api.publicBook({ exchange: q.get('exchange'), instId: q.get('instId'), limit: Number(q.get('limit') ?? 20), marketType: q.get('marketType') || undefined }))
  get('/api/clustr/market/consensus', (q) => api.marketConsensus({ instId: q.get('instId') }))
  get('/api/clustr/core', () => api.coreStatus())
  get('/api/clustr/theses', (q) => api.listTheses({ status: q.get('status') || undefined, limit: Number(q.get('limit') ?? 50) }))
  get('/api/clustr/autonomy', () => api.autonomyStatus())
  get('/api/clustr/kill-switch', () => api.killSwitchStatus())
  get('/api/clustr/memory/review', (q) => api.memoryReview({ instrument: q.get('instrument') || undefined, limit: Number(q.get('limit') ?? 200) }))
  get('/api/clustr/provenance', (q) => api.provenance({ entityType: q.get('entityType') || undefined, entityId: q.get('entityId') || undefined, limit: Number(q.get('limit') ?? 100) }))
  post('/api/clustr/credentials/save', (body) => api.saveCredentials(body))
  post('/api/clustr/credentials/verify', (body) => api.verifyCredentials(body))
  post('/api/clustr/credentials/remove', (body) => api.removeCredentials(body))
  post('/api/clustr/accounts/overview', () => api.accountsOverview())
  post('/api/clustr/trading/workspace', (body) => api.tradingWorkspace(body))
  post('/api/clustr/trading/reconcile', (body) => api.reconcileTradingOrders(body))
  post('/api/clustr/theses/create', (body) => api.createThesis(body))
  post('/api/clustr/thesis/transition', (body) => api.transitionThesis(body))
  post('/api/clustr/thesis/evidence', (body) => api.addThesisEvidence(body))
  post('/api/clustr/decision-room', (body) => api.decisionRoom(body))
  post('/api/clustr/shadows', (body) => api.createShadow(body))
  post('/api/clustr/replay/start', (body) => api.startReplay(body))
  post('/api/clustr/replay/advance', (body) => api.advanceReplay(body))
  post('/api/clustr/risk/evaluate', (body) => api.evaluateRisk(body))
  post('/api/clustr/autonomy/set', (body) => api.setAutonomy(body))
  post('/api/clustr/execution-mode/set', (body) => api.setExecutionMode(body))
  post('/api/clustr/kill-switch/set', (body) => api.setKillSwitch(body))
  post('/api/clustr/network/egress', () => api.networkEgress())
  post('/api/clustr/memory', (body) => api.recordMemory(body))
  return () => disposers.forEach((d) => d())
}
