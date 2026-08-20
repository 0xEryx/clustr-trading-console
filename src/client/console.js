import * as React from 'react'
import {
  RiBarChartBoxAiLine,
  RiBrainAi3Line,
  RiDatabase2Line,
  RiHistoryLine,
  RiLineChartLine,
  RiLock2Line,
  RiRadarLine,
  RiSafe2Line,
  RiSearchLine,
  RiShieldCheckLine,
  RiWallet3Line,
} from 'react-icons/ri'
import { KLineSvg, normalizeCandles } from './kline.js'
import clustrMark from './assets/clustr-mark.png'
import binanceWordmark from './assets/binance-wordmark.png'
import okxWordmark from './assets/okx-wordmark.svg'
import bybitWordmark from './assets/bybit-wordmark.svg'
import hyperliquidWordmark from './assets/hyperliquid-wordmark.svg'

const h = React.createElement
const C = {
  bg: 'rgba(5,4,10,.48)', panel: 'rgba(12, 10, 21, .72)', panelStrong: 'rgba(16, 13, 28, .9)',
  border: 'rgba(255,255,255,.105)', borderBright: 'rgba(196,190,255,.34)', text: '#f4f1f7',
  sub: '#c6bfce', dim: '#91899c', purple: '#a69fff', indigo: '#8580e6', yellow: '#f2d45c',
  green: '#8be0ba', red: '#ef8f9d',
}
const FONT = { fontFamily: 'Geist Sans, Geist, Inter, -apple-system, BlinkMacSystemFont, sans-serif' }
const EXCHANGE_NAMES = { okx: 'OKX', binance: 'Binance', bybit: 'Bybit', hyperliquid: 'Hyperliquid' }
const MARKET_LABELS = { spot: '现货', swap: '永续', linear: 'U 本位', inverse: '币本位', perpetual: '永续', 'usd-m-futures': 'U 本位永续' }

const CSS = `
  .clustr-shell{position:relative;overflow:hidden;color:${C.text};background:linear-gradient(180deg,rgba(8,7,14,.38),rgba(5,4,10,.62));border:1px solid ${C.border};border-radius:12px;padding:14px;min-height:560px;box-shadow:inset 0 1px rgba(255,255,255,.035),0 24px 80px rgba(0,0,0,.22);backdrop-filter:blur(7px)}
  .clustr-shell:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.55),transparent 72%)}
  .clustr-layer{position:relative;z-index:1}.clustr-glass{background:${C.panel};border:1px solid ${C.border};box-shadow:inset 0 1px rgba(255,255,255,.045),0 16px 42px rgba(0,0,0,.16);backdrop-filter:blur(20px) saturate(112%)}
  .clustr-grid{display:grid;grid-template-columns:minmax(190px,220px) minmax(440px,1fr) minmax(250px,310px);gap:10px}.clustr-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:13px;flex-wrap:wrap}
  .clustr-brand{display:flex;align-items:center;gap:11px}.clustr-mark{width:32px;height:32px;display:grid;place-items:center;background:transparent;border:0;box-shadow:none}.clustr-mark img{width:25px;height:25px;object-fit:contain;filter:drop-shadow(0 5px 16px rgba(166,159,255,.24))}
  .clustr-section-label{display:flex;align-items:center;gap:7px}.clustr-section-label svg{color:${C.purple};font-size:14px;flex:none}.clustr-exchange-logo{display:block;object-fit:contain;object-position:left center;max-width:78px;max-height:22px}.clustr-exchange-logo.okx{filter:invert(1);width:48px}.clustr-exchange-logo.binance{width:76px;height:18px;object-fit:cover;object-position:center}.clustr-exchange-logo.bybit{width:58px;height:22px}.clustr-exchange-logo.hyperliquid{width:78px;height:14px}.clustr-logo-clip{display:flex;align-items:center;width:78px;height:22px;overflow:hidden;transform-origin:left center}
  .clustr-card{border-radius:10px;padding:12px;min-width:0}.clustr-eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:${C.dim}}.clustr-pills{display:flex;gap:6px;flex-wrap:wrap}.clustr-pill{border-radius:999px;padding:4px 9px;font-size:11px;border:1px solid ${C.border};background:rgba(255,255,255,.035);color:${C.sub}}.clustr-pill.ok{border-color:rgba(139,224,186,.28);color:${C.green}}.clustr-pill.warn{border-color:rgba(242,212,92,.28);color:${C.yellow}}
  .clustr-row{display:flex;justify-content:space-between;gap:8px;padding:7px 8px;border-radius:7px;cursor:pointer;transition:background-color .16s ease}.clustr-row:hover,.clustr-row.active{background:rgba(166,159,255,.1)}.clustr-btn{appearance:none;border:1px solid ${C.border};border-radius:8px;background:rgba(255,255,255,.045);color:${C.text};padding:7px 11px;cursor:pointer;font:inherit;transition:background-color .16s ease,border-color .16s ease,transform .16s ease}.clustr-btn:hover{border-color:${C.borderBright};background:rgba(166,159,255,.11);transform:translateY(-1px)}.clustr-btn:disabled{opacity:.48;cursor:not-allowed;transform:none}.clustr-btn.primary{background:${C.purple};color:#090710;border-color:${C.purple};font-weight:680}.clustr-btn.primary:hover{background:#bbb5ff}.clustr-btn.danger{color:${C.red}}
  .clustr-input,.clustr-select{box-sizing:border-box;width:100%;background:rgba(4,3,9,.42);color:${C.text};border:1px solid ${C.border};border-radius:8px;padding:10px 11px;outline:none}.clustr-input:focus,.clustr-select:focus{border-color:${C.purple};box-shadow:0 0 0 3px rgba(166,159,255,.1)}.clustr-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.clustr-field label{display:block;color:${C.dim};font-size:11px;margin:0 0 6px}
  .clustr-market-picker{display:grid;grid-template-columns:110px 120px minmax(180px,1fr);gap:7px;position:relative;margin:10px 0}.clustr-search-wrap{position:relative}.clustr-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:${C.dim};pointer-events:none}.clustr-search-wrap .clustr-input{padding-left:31px}.clustr-results{position:absolute;z-index:12;left:0;right:0;top:calc(100% + 6px);max-height:310px;overflow:auto;padding:6px;border-radius:9px;background:rgba(10,8,18,.98);border:1px solid ${C.borderBright};box-shadow:0 24px 70px rgba(0,0,0,.48)}.clustr-result{width:100%;display:grid;grid-template-columns:1fr auto;gap:8px;text-align:left;border:0;border-radius:7px;background:transparent;color:${C.text};padding:9px;cursor:pointer}.clustr-result:hover,.clustr-result:focus{background:rgba(166,159,255,.12);outline:none}.clustr-result small{color:${C.dim}}
  .clustr-account-scroll{max-height:420px;overflow:auto;padding-right:2px}.clustr-account-card{border:1px solid rgba(255,255,255,.09);border-radius:8px;padding:10px;background:rgba(255,255,255,.023);margin-top:8px}.clustr-account-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.clustr-account-metric{font-size:19px;margin-top:7px}.clustr-mini-row{display:grid;grid-template-columns:1fr auto;gap:8px;color:${C.sub};font-size:10px;padding:4px 0;border-top:1px solid rgba(255,255,255,.055)}.clustr-cap-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:8px}.clustr-cap{border:1px solid rgba(255,255,255,.08);border-radius:7px;padding:7px;background:rgba(255,255,255,.023)}.clustr-cap small{display:block;color:${C.dim};font-size:9px;margin-bottom:3px}.clustr-cap strong{font-size:10px;font-weight:580}
  .clustr-analysis{margin-top:10px;padding:12px;border-radius:9px;border:1px solid rgba(166,159,255,.2);background:linear-gradient(135deg,rgba(166,159,255,.075),rgba(242,212,92,.025))}.clustr-analysis-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.clustr-analysis ul{margin:7px 0 0;padding-left:17px;color:${C.sub};font-size:11px;line-height:1.65}.clustr-analysis-controls{display:grid;grid-template-columns:minmax(220px,1fr) auto auto;gap:8px;align-items:center;margin-top:10px}.clustr-analysis-status{margin-top:9px;color:${C.sub};font-size:11px;line-height:1.6}.clustr-analysis-status.error{color:${C.red}}.clustr-method-brief{display:grid;grid-template-columns:auto 1fr;gap:5px 10px;margin-top:9px;padding:9px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(5,4,10,.28)}.clustr-method-brief>span{grid-row:1/3;align-self:start;border:1px solid rgba(166,159,255,.22);border-radius:999px;padding:3px 7px;color:${C.purple};font-size:9px}.clustr-method-brief p{margin:0;color:${C.sub};font-size:11px;line-height:1.5}.clustr-method-brief small{color:${C.dim};font-size:9px}.clustr-analysis-result{margin-top:10px}.clustr-analysis-summary{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:9px}.clustr-analysis-summary strong{font-size:13px}.clustr-evidence-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.clustr-evidence-box{border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:8px;background:rgba(255,255,255,.02)}.clustr-evidence-box>small{color:${C.dim};font-size:9px;letter-spacing:.08em}.clustr-levels{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.clustr-level{border:1px solid rgba(255,255,255,.09);border-radius:6px;padding:4px 7px;color:${C.sub};font-size:9px;background:rgba(255,255,255,.025)}.clustr-analysis-launcher strong{display:block;font-size:18px;margin-top:2px}.clustr-analysis-launcher p{color:${C.sub};font-size:11px;line-height:1.55;margin:7px 0 10px}
  .clustr-workbench{margin-top:12px}.clustr-workbench-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}.clustr-workbench-head p{margin:5px 0 0;color:${C.sub};font-size:12px;line-height:1.55;max-width:720px}.clustr-workbench-actions{display:flex;gap:7px;flex-wrap:wrap}.clustr-workbench-metrics{display:grid;grid-template-columns:repeat(4,minmax(110px,1fr));gap:7px;margin:12px 0}.clustr-workbench-tabs{display:flex;gap:4px;border-bottom:1px solid ${C.border};margin-bottom:8px}.clustr-workbench-tab{appearance:none;border:0;border-bottom:2px solid transparent;background:transparent;color:${C.dim};padding:8px 11px;cursor:pointer;font:inherit;font-size:12px}.clustr-workbench-tab[aria-selected="true"]{color:${C.text};border-bottom-color:${C.purple}}.clustr-table-wrap{overflow:auto;max-height:300px;border:1px solid rgba(255,255,255,.07);border-radius:8px}.clustr-table{border-collapse:collapse;width:100%;min-width:780px}.clustr-table th{position:sticky;top:0;z-index:1;background:rgba(13,11,22,.98);color:${C.dim};font-size:10px;font-weight:560;letter-spacing:.04em;text-align:left;padding:8px 10px;border-bottom:1px solid ${C.border}}.clustr-table td{color:${C.sub};font-size:11px;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.05);vertical-align:middle}.clustr-table tbody tr:last-child td{border-bottom:0}.clustr-table strong{color:${C.text};font-weight:620}.clustr-status{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.clustr-empty{padding:24px 14px;text-align:center;color:${C.dim};font-size:12px;line-height:1.6}.clustr-order-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:${C.dim};font-size:10px}
  .clustr-tape{margin-top:12px}.clustr-tape-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.clustr-tape-metrics{display:grid;grid-template-columns:repeat(4,minmax(96px,1fr));gap:7px;margin:10px 0}.clustr-tape-metric{border:1px solid rgba(255,255,255,.075);border-radius:8px;padding:8px;background:rgba(255,255,255,.022)}.clustr-tape-metric small{display:block;color:${C.dim};font-size:9px;margin-bottom:3px}.clustr-tape-metric strong{font-size:14px}.clustr-tape-list{display:grid;gap:6px;max-height:240px;overflow:auto}.clustr-tape-entry{border:1px solid rgba(255,255,255,.075);border-radius:8px;background:rgba(5,4,10,.28);overflow:hidden}.clustr-tape-entry summary{display:grid;grid-template-columns:72px minmax(160px,1fr) 86px 90px 86px;gap:8px;align-items:center;padding:8px 10px;cursor:pointer;font-size:10px;list-style:none}.clustr-tape-entry summary::-webkit-details-marker{display:none}.clustr-tape-entry summary:hover{background:rgba(166,159,255,.06)}.clustr-tape-stages{padding:0 10px 9px 24px;border-top:1px solid rgba(255,255,255,.06)}.clustr-tape-stage{display:grid;grid-template-columns:60px 110px 1fr;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.045);color:${C.sub};font-size:9px}.clustr-tape-note{color:${C.dim};font-size:9px;line-height:1.5;margin:7px 0 0}
  @media(max-width:1080px){.clustr-grid{grid-template-columns:200px minmax(0,1fr)}.clustr-side{grid-column:1/-1;display:grid!important;grid-template-columns:1fr 1fr}}
  @media(max-width:760px){.clustr-shell{padding:10px;border-radius:10px}.clustr-grid{grid-template-columns:1fr}.clustr-side{grid-column:auto;display:flex!important}.clustr-form{grid-template-columns:1fr}.clustr-head{align-items:flex-start}.clustr-chart-scroll{overflow-x:auto}.clustr-market-picker{grid-template-columns:1fr 1fr}.clustr-search-wrap{grid-column:1/-1}.clustr-analysis-controls{grid-template-columns:1fr 1fr}.clustr-analysis-controls .clustr-select{grid-column:1/-1}.clustr-cap-grid{grid-template-columns:1fr}.clustr-evidence-grid{grid-template-columns:1fr}.clustr-workbench-metrics{grid-template-columns:1fr 1fr}.clustr-workbench-actions{width:100%}.clustr-workbench-actions .clustr-btn{flex:1}.clustr-tape-metrics{grid-template-columns:1fr 1fr}.clustr-tape-entry summary{grid-template-columns:58px 1fr 70px}.clustr-tape-entry summary span:nth-child(4),.clustr-tape-entry summary span:nth-child(5){display:none}.clustr-tape-stage{grid-template-columns:48px 94px 1fr}}
`

async function get(path) {
  const res = await fetch(path, { cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status)
  return data
}

async function post(path, body, csrfToken) {
  const res = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-clustr-csrf': csrfToken }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

function Brand({ compact = false }) {
  return h('div', { className: 'clustr-brand' }, h('div', { className: 'clustr-mark' }, h('img', { src: clustrMark, alt: 'Clustr' })), h('div', null,
    h('div', { style: { fontFamily: 'General Sans, Geist Sans, sans-serif', fontWeight: 680, fontSize: compact ? 14 : 17 } }, 'Clustr Trading Console'),
    compact ? null : h('div', { className: 'clustr-eyebrow', style: { marginTop: 2 } }, 'AI TRADER OPERATING SYSTEM'),
  ))
}

function Styles() { return h('style', null, CSS) }
function Pill({ children, kind = '' }) { return h('span', { className: `clustr-pill ${kind}` }, children) }
function Card({ children, className = '', style }) { return h('section', { className: `clustr-card clustr-glass ${className}`, style }, children) }
function SectionLabel({ icon: Icon, children, style }) { return h('div', { className: 'clustr-eyebrow clustr-section-label', style }, h(Icon, { 'aria-hidden': true }), h('span', null, children)) }
function ExchangeLogo({ exchange }) {
  if (exchange === 'okx') return h('span', { className: 'clustr-logo-clip' }, h('img', { className: 'clustr-exchange-logo okx', src: okxWordmark, alt: 'OKX' }))
  if (exchange === 'binance') return h('span', { className: 'clustr-logo-clip' }, h('img', { className: 'clustr-exchange-logo binance', src: binanceWordmark, alt: 'Binance' }))
  if (exchange === 'bybit') return h('span', { className: 'clustr-logo-clip' }, h('img', { className: 'clustr-exchange-logo bybit', src: bybitWordmark, alt: 'Bybit' }))
  if (exchange === 'hyperliquid') return h('span', { className: 'clustr-logo-clip' }, h('img', { className: 'clustr-exchange-logo hyperliquid', src: hyperliquidWordmark, alt: 'Hyperliquid' }))
  return h('span', null, exchange)
}

export function ConsoleGate({ sessionId, inputActions, ctx }) {
  const [access, setAccess] = React.useState({ state: 'checking' })
  const [retry, setRetry] = React.useState(0)
  const [busy, setBusy] = React.useState(false)
  React.useEffect(() => {
    let alive = true
    const currentId = sessionId == null ? '' : String(sessionId)
    setAccess({ state: 'checking' })
    if (!currentId) {
      setAccess({ state: 'isolated', effectivePreset: null })
      return () => { alive = false }
    }
    get(`/api/crypto/session?sessionId=${encodeURIComponent(currentId)}`)
      .then((result) => {
        if (!alive) return
        const verified = result?.eligible === true && String(result?.sessionId ?? '') === currentId
        setAccess({ ...result, state: verified ? 'eligible' : 'isolated', effectivePreset: result?.effectivePreset ?? null })
      })
      .catch((error) => { if (alive) setAccess({ state: 'error', message: String(error?.message ?? error) }) })
    return () => { alive = false }
  }, [sessionId, retry])

  React.useEffect(() => {
    const currentId = sessionId == null ? '' : String(sessionId)
    const dispose = ctx?.remote?.$on?.('agent-preset/selected', (changedSessionId) => {
      if (String(changedSessionId ?? '') !== currentId) return
      setAccess({ state: 'checking' })
      setRetry((value) => value + 1)
    })
    return () => { if (typeof dispose === 'function') dispose() }
  }, [ctx, sessionId])

  if (access.state === 'eligible') return h(ConsoleView, { ctx, inputActions, sessionId })

  const checking = access.state === 'checking'
  const failed = access.state === 'error'
  const presetEligible = access.presetEligible === true
  const bindingState = access.bindingState
  const title = checking
    ? '正在确认会话状态'
    : failed
      ? '会话状态读取异常'
      : bindingState === 'available'
        ? '启用此交易会话'
        : bindingState === 'occupied'
          ? '另一个交易会话已启用'
          : bindingState === 'invalid'
            ? '此会话已离开 Clustr 模式'
            : '进入 Clustr 交易会话'
  const description = checking
    ? '正在核对当前会话的最新模式与专属交易会话授权。'
    : failed
      ? '当前无法读取此会话的完整状态。为保护账户、审批与交易记录，控制台暂时保持隔离。'
      : bindingState === 'available'
        ? '启用后，侧栏 Clustr 将固定返回此会话；其他模式和其他 Clustr 会话仍保持隔离。'
        : bindingState === 'occupied'
          ? 'Clustr 当前固定连接到另一个交易会话。你可以返回该会话，或明确将交易控制权切换到这里。'
          : bindingState === 'invalid'
            ? '完整控制台已立即锁定。对话记录仍然保留；如需继续，请进入另一个 Clustr 会话并明确切换。'
            : presetEligible
              ? '此会话尚未获得专属交易控制权。'
              : '当前会话不是 Clustr Trading Console 模式。请新建会话并选择该模式。'

  const openBound = async () => {
    try {
      setBusy(true)
      const result = await get('/api/crypto/session')
      if (result?.eligible && result?.sessionId) {
        ctx.get('sessions')?.open(result.sessionId)
        return
      }
      if (result?.bindingState === 'query_error') alert('已启用交易会话的状态读取异常，请稍后重试。')
      else if (result?.bindingState === 'invalid') alert('已启用的交易会话当前不在 Clustr 模式。请进入一个 Clustr 会话并明确切换。')
      else alert('尚未启用专属交易会话。请在 Clustr 会话中点击「启用此会话」。')
    } catch { alert('会话状态读取异常，请稍后重试。') }
    finally { setBusy(false) }
  }
  const bindCurrent = async (replace) => {
    const currentId = sessionId == null ? '' : String(sessionId)
    if (!currentId) return
    if (replace && !window.confirm('将 Clustr 专属交易会话切换到当前会话？原会话将保留对话记录，但不再显示完整控制台。')) return
    try {
      setBusy(true)
      const status = await get('/api/crypto/status')
      await post('/api/crypto/session/bind', { sessionId: currentId, replace }, status.csrfToken)
      setRetry((value) => value + 1)
    } catch (error) { alert(String(error?.message ?? error)) }
    finally { setBusy(false) }
  }

  let actions = null
  if (failed) actions = h('button', { className: 'clustr-btn primary', onClick: () => setRetry((value) => value + 1), disabled: busy }, '重新确认')
  else if (bindingState === 'available') actions = h('button', { className: 'clustr-btn primary', onClick: () => bindCurrent(false), disabled: busy }, busy ? '正在启用…' : '启用此会话')
  else if (bindingState === 'occupied') actions = h('div', { style: { display: 'flex', gap: 9, flexWrap: 'wrap' } },
    h('button', { className: 'clustr-btn primary', onClick: openBound, disabled: busy }, '进入已启用会话'),
    h('button', { className: 'clustr-btn', onClick: () => bindCurrent(true), disabled: busy }, '改用当前会话'))
  else if (!checking && bindingState !== 'invalid') actions = h('button', { className: 'clustr-btn primary', onClick: openBound, disabled: busy }, '进入已启用会话  →')

  return h(React.Fragment, null, h(Styles), h('div', { className: 'clustr-shell', style: { ...FONT, minHeight: 280, maxWidth: 620, margin: '24px auto' } }, h('div', { className: 'clustr-layer' }, h(Brand),
    h('h2', { style: { margin: '34px 0 8px', fontFamily: 'General Sans, Geist Sans, sans-serif', fontSize: 28 } }, title),
    h('p', { style: { color: C.sub, lineHeight: 1.7, maxWidth: 500 } }, description),
    checking ? null : actions,
  )))
}

export function ConsoleView({ ctx, inputActions, sessionId }) {
  const [data, setData] = React.useState({ tickers: [], status: null, core: null, exchangeData: null, accounts: [], analysisCatalog: { methods: [] }, sessionTape: { entries: [], metrics: {} }, tradingWorkspace: { positions: [], openOrders: [], trackedOrders: [], metrics: {} } })
  const [selected, setSelected] = React.useState({ exchange: 'okx', symbol: 'BTC-USDT', displaySymbol: 'BTC/USDT', marketType: 'spot' })
  const [bar, setBar] = React.useState('15m')
  const [candles, setCandles] = React.useState([])
  const [analysisResult, setAnalysisResult] = React.useState(null)
  const [klineState, setKlineState] = React.useState({ status: 'loading', message: '' })
  const [analysisOpen, setAnalysisOpen] = React.useState(false)
  const [analysisType, setAnalysisType] = React.useState('wyckoff')
  const [analysisState, setAnalysisState] = React.useState({ status: 'idle', message: '' })
  const [error, setError] = React.useState(null)
  const [searchExchange, setSearchExchange] = React.useState('okx')
  const [searchMarket, setSearchMarket] = React.useState('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState([])
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchState, setSearchState] = React.useState('loading')
  const [workspaceAction, setWorkspaceAction] = React.useState(null)
  const [workspaceNotice, setWorkspaceNotice] = React.useState(null)
  const klineRequest = React.useRef(0)
  const analysisRequest = React.useRef(0)
  const searchRequest = React.useRef(0)

  const loadAll = React.useCallback(async () => {
    try {
      const [tickers, status, core, exchangeData, catalog] = await Promise.all([get('/api/crypto/tickers'), get('/api/crypto/status'), get('/api/clustr/core'), get('/api/clustr/exchanges'), get('/api/clustr/analysis/catalog')])
      const [workspace, tape] = await Promise.all([
        post('/api/clustr/trading/workspace', { sessionId: String(sessionId ?? '') }, status.csrfToken).catch(() => ({ accounts: [], positions: [], openOrders: [], trackedOrders: [], metrics: {}, unavailable: true })),
        get(`/api/clustr/session-tape?sessionId=${encodeURIComponent(String(sessionId ?? ''))}&limit=40`).catch(() => ({ entries: [], metrics: {}, unavailable: true })),
      ])
      setData({ tickers: tickers?.tickers ?? [], status, core, exchangeData, accounts: workspace?.accounts ?? [], analysisCatalog: catalog, sessionTape: tape, tradingWorkspace: workspace }); setError(null)
    } catch (cause) { setError(String(cause?.message ?? cause)) }
  }, [sessionId])

  const refreshTradingWorkspace = React.useCallback(async (reconcile = false) => {
    const csrfToken = data.status?.csrfToken
    const currentSessionId = String(sessionId ?? '')
    if (!csrfToken || !currentSessionId) return
    try {
      setWorkspaceAction(reconcile ? 'reconcile' : 'refresh'); setWorkspaceNotice(null)
      const workspace = await post(reconcile ? '/api/clustr/trading/reconcile' : '/api/clustr/trading/workspace', { sessionId: currentSessionId }, csrfToken)
      setData((current) => ({ ...current, accounts: workspace.accounts ?? current.accounts, tradingWorkspace: workspace }))
      setWorkspaceNotice(reconcile
        ? workspace.reconciliation?.pending > 0 ? '仍有订单等待交易所确认。系统会继续核对。' : '待确认订单已完成核对。'
        : '账户、订单与持仓已刷新。')
    } catch (cause) {
      setWorkspaceNotice(`状态刷新失败：${String(cause?.message ?? cause)}`)
    } finally { setWorkspaceAction(null) }
  }, [data.status?.csrfToken, sessionId])

  const loadKline = React.useCallback(async (instrument, timeframe) => {
    const requestId = ++klineRequest.current
    setCandles([]); setKlineState({ status: 'loading', message: '' })
    try {
      const query = new URLSearchParams({ exchange: instrument.exchange, instId: instrument.symbol, marketType: instrument.marketType, bar: timeframe, limit: '200' })
      const market = await get(`/api/clustr/market/klines?${query}`)
      if (requestId !== klineRequest.current) return
      const nextCandles = normalizeCandles(market?.candles ?? market)
      setCandles(nextCandles); setKlineState({ status: nextCandles.length > 0 ? 'ready' : 'empty', message: '' })
    } catch (cause) {
      if (requestId !== klineRequest.current) return
      setCandles([]); setKlineState({ status: 'error', message: String(cause?.message ?? cause) })
    }
  }, [])

  const clearAnalysis = React.useCallback(() => { analysisRequest.current += 1; setAnalysisResult(null); setAnalysisState({ status: 'idle', message: '' }) }, [])
  const chooseInstrument = React.useCallback((instrument) => { clearAnalysis(); setSelected(instrument) }, [clearAnalysis])
  const chooseBar = React.useCallback((timeframe) => { if (timeframe !== bar) { clearAnalysis(); setBar(timeframe) } }, [bar, clearAnalysis])

  const runMarketAnalysis = React.useCallback(async () => {
    const requestId = ++analysisRequest.current
    const method = data.analysisCatalog?.methods?.find((item) => item.id === analysisType)
    setAnalysisResult(null); setAnalysisState({ status: 'loading', message: `正在运行${method?.label ?? '市场分析'}…` })
    try {
      const query = new URLSearchParams({ method: analysisType, exchange: selected.exchange, instId: selected.symbol, marketType: selected.marketType, bar, limit: '240' })
      const analysis = await get(`/api/clustr/analysis/run?${query}`)
      if (requestId !== analysisRequest.current) return
      if (!analysis?.ok) { setAnalysisState({ status: 'refused', message: analysis?.reason || '当前数据不足以形成可靠的结构判断。' }); return }
      setAnalysisResult(analysis); setAnalysisState({ status: 'ready', message: '' })
    } catch (cause) {
      if (requestId !== analysisRequest.current) return
      setAnalysisState({ status: 'error', message: `分析服务暂时不可用：${String(cause?.message ?? cause)}` })
    }
  }, [analysisType, bar, data.analysisCatalog?.methods, selected])

  React.useEffect(() => { loadAll(); const dispose = ctx.get('timer')?.interval(loadAll, 30000); return () => { if (dispose) dispose() } }, [ctx, loadAll])
  React.useEffect(() => { loadKline(selected, bar) }, [selected, bar, loadKline])
  React.useEffect(() => {
    const csrfToken = data.status?.csrfToken
    const currentId = String(sessionId ?? '')
    if (!csrfToken || !currentId) return
    post('/api/clustr/context/update', {
      sessionId: currentId,
      exchange: selected.exchange,
      symbol: selected.symbol,
      displaySymbol: selected.displaySymbol,
      marketType: selected.marketType,
      timeframe: bar,
    }, csrfToken).catch(() => {})
  }, [bar, data.status?.csrfToken, selected, sessionId])
  React.useEffect(() => {
    const requestId = ++searchRequest.current
    setSearchState('loading')
    setSearchResults([])
    const timerId = setTimeout(async () => {
      try {
        const query = new URLSearchParams({ exchange: searchExchange, marketType: searchMarket, query: searchQuery, limit: '24' })
        const result = await get(`/api/clustr/market/instruments?${query}`)
        if (requestId !== searchRequest.current) return
        setSearchResults(result?.instruments ?? []); setSearchState((result?.instruments ?? []).length ? 'ready' : 'empty')
      } catch {
        if (requestId !== searchRequest.current) return
        setSearchResults([]); setSearchState('error')
      }
    }, 220)
    return () => clearTimeout(timerId)
  }, [searchExchange, searchMarket, searchQuery])

  const status = data.status ?? {}
  const providers = Array.isArray(data.exchangeData?.providers) ? data.exchangeData.providers : []
  const connectedAccounts = data.accounts.filter((account) => account.connected)
  const connectedCount = connectedAccounts.length
  const analysisMethods = Array.isArray(data.analysisCatalog?.methods) ? data.analysisCatalog.methods : []
  const selectedMethod = analysisMethods.find((item) => item.id === analysisType) ?? analysisMethods[0]
  const selectSearchResult = (row) => {
    chooseInstrument({ exchange: row.exchange, symbol: row.symbol, displaySymbol: row.displaySymbol || row.symbol, marketType: row.marketType })
    setSearchExchange(row.exchange); setSearchMarket(row.marketType); setSearchQuery(row.displaySymbol || row.symbol); setSearchOpen(false)
  }

  return h(React.Fragment, null, h(Styles), h('div', { className: 'clustr-shell', style: FONT }, h('div', { className: 'clustr-layer' },
    h('header', { className: 'clustr-head' }, h(Brand), h('div', { className: 'clustr-pills' },
      h(Pill, { kind: connectedCount > 0 ? 'ok' : 'warn' }, `${connectedCount} 个账户已连接`),
      h(Pill, { kind: status.readOnly !== false ? 'warn' : 'ok' }, status.readOnly !== false ? '只读保护' : '审批交易'),
      h(Pill, null, `${data.core?.autonomy?.definition?.label ?? '观察'}权限`),
      error ? h(Pill, { kind: 'warn' }, '部分数据连接异常') : null,
    )),
    h('div', { className: 'clustr-grid' },
      h(Card, null,
        h(SectionLabel, { icon: RiRadarLine, style: { marginBottom: 10 } }, 'MARKET SIGNALS'),
        data.tickers.map((ticker) => { const up = Number(ticker.changePct) >= 0; const instrument = { exchange: 'okx', symbol: ticker.instId, displaySymbol: ticker.instId.replace(/-SWAP$/, ' 永续').replace('-', '/'), marketType: ticker.instId.endsWith('-SWAP') ? 'swap' : 'spot' }; return h('div', { key: ticker.instId, className: `clustr-row ${ticker.instId === selected.symbol && selected.exchange === 'okx' ? 'active' : ''}`, onClick: () => chooseInstrument(instrument) }, h('span', null, ticker.instId.replace('-USDT', '')), h('span', { style: { textAlign: 'right' } }, h('div', null, ticker.last ?? '—'), h('small', { style: { color: up ? C.green : C.red } }, ticker.changePct == null ? '—' : `${up ? '+' : ''}${Number(ticker.changePct).toFixed(2)}%`))) }),
        data.tickers.length === 0 ? h('p', { style: { color: C.dim } }, '正在同步市场信号…') : null,
        h('div', { style: { borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 12 } }, h(SectionLabel, { icon: RiWallet3Line }, 'CONNECTED ACCOUNTS'),
          ...providers.map((provider, index) => {
            const unavailable = provider.availability === 'unavailable'
            const rows = data.accounts.filter((account) => account.exchange === provider.id && account.connected)
            const ready = rows.some((account) => account.readStatus === 'ready' || account.readStatus === 'partial')
            const label = unavailable ? '未开放' : rows.length === 0 ? '账户未连接' : ready ? `${rows.length} 个账户可读` : '账户连接异常'
            return h('div', { key: provider.id, className: 'clustr-row', style: { marginTop: index === 0 ? 7 : 0, alignItems: 'center', cursor: 'default' } }, h(ExchangeLogo, { exchange: provider.id }), h('span', { style: { color: unavailable ? C.yellow : rows.length === 0 ? C.dim : ready ? C.green : C.red, fontSize: 10, textAlign: 'right' } }, `● ${label}`))
          }),
        ),
      ),
      h(Card, { className: 'clustr-chart-scroll' },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 10, marginBottom: 4 } }, h('div', null, h(SectionLabel, { icon: RiLineChartLine }, 'MARKET STRUCTURE'), h('h3', { style: { margin: '4px 0 0', fontSize: 18 } }, selected.displaySymbol)), h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, h('span', { style: { color: C.dim, fontSize: 11 } }, `${EXCHANGE_NAMES[selected.exchange]} · ${MARKET_LABELS[selected.marketType] ?? selected.marketType} · 近实时`), h('button', { className: 'clustr-btn', onClick: () => setAnalysisOpen((open) => !open), 'aria-expanded': analysisOpen }, analysisOpen ? '收起分析' : '市场分析'))),
        h('div', { className: 'clustr-market-picker' },
          h('select', { className: 'clustr-select', value: searchExchange, onChange: (event) => { const next = event.target.value; setSearchExchange(next); setSearchMarket(defaultMarket(next)); setSearchOpen(true) }, 'aria-label': '行情场所' }, Object.entries(EXCHANGE_NAMES).map(([id, name]) => h('option', { key: id, value: id }, name))),
          h('select', { className: 'clustr-select', value: searchMarket, onChange: (event) => { setSearchMarket(event.target.value); setSearchOpen(true) }, 'aria-label': '市场类型' }, marketOptions(searchExchange).map((item) => h('option', { key: item.value, value: item.value }, item.label))),
          h('div', { className: 'clustr-search-wrap' }, h(RiSearchLine, { className: 'clustr-search-icon', 'aria-hidden': true }), h('input', { className: 'clustr-input', value: searchQuery, placeholder: '搜索 BTC、SOL、DOGE 或任意交易对', onChange: (event) => { setSearchQuery(event.target.value); setSearchOpen(true) }, onFocus: () => setSearchOpen(true), onKeyDown: (event) => { if (event.key === 'Escape') setSearchOpen(false) }, 'aria-label': '搜索交易品种', 'aria-expanded': searchOpen }),
            searchOpen ? h('div', { className: 'clustr-results', role: 'listbox' },
              searchState === 'loading' ? h('div', { style: { padding: 10, color: C.dim, fontSize: 11 } }, '正在读取可交易品种…') : null,
              searchState === 'error' ? h('div', { role: 'alert', style: { padding: 10, color: C.red, fontSize: 11 } }, '该交易场所的品种目录暂时不可用。') : null,
              searchState === 'empty' ? h('div', { style: { padding: 10, color: C.dim, fontSize: 11 } }, '没有找到匹配的交易品种。') : null,
              ...searchResults.map((row) => h('button', { key: `${row.marketType}:${row.symbol}`, className: 'clustr-result', role: 'option', onMouseDown: (event) => event.preventDefault(), onClick: () => selectSearchResult(row) }, h('span', null, h('strong', null, row.displaySymbol || row.symbol), h('small', { style: { display: 'block', marginTop: 2 } }, row.symbol)), h('small', null, MARKET_LABELS[row.marketType] ?? row.marketType))),
            ) : null,
          )),
        h(KLineSvg, { candles, annotations: analysisState.status === 'ready' ? (analysisResult?.events ?? []) : [], bar, onBar: chooseBar, height: 340, state: klineState.status, message: klineState.message }),
        analysisOpen ? h('div', { className: 'clustr-analysis' },
          h('div', { className: 'clustr-analysis-head' }, h('div', null, h(SectionLabel, { icon: RiBrainAi3Line }, 'MARKET ANALYSIS LIBRARY'), h('strong', { style: { display: 'block', marginTop: 5, fontSize: 13 } }, analysisState.status === 'ready' ? analysisResult?.signalLabel : selectedMethod?.label ?? '正在读取分析工具库')), analysisState.status === 'ready' && analysisResult?.ok ? h(Pill, { kind: analysisResult.structureMatchScore >= 0.65 ? 'ok' : 'warn' }, `结构匹配度 ${Math.round((analysisResult.structureMatchScore ?? 0) * 100)}%`) : h(Pill, null, `${analysisMethods.length} 套方法`)),
          selectedMethod ? h('div', { className: 'clustr-method-brief' }, h('span', null, selectedMethod.category), h('p', null, selectedMethod.summary), h('small', null, `输入：${selectedMethod.inputs?.join(' + ') ?? 'OHLCV'} · 至少 ${selectedMethod.minCandles} 根 K 线 · 仅在点击运行后计算`)) : null,
          h('div', { className: 'clustr-analysis-controls' }, h('select', { className: 'clustr-select', value: analysisType, onChange: (event) => { clearAnalysis(); setAnalysisType(event.target.value) }, 'aria-label': '市场分析方法' }, analysisMethods.length ? analysisMethods.map((method) => h('option', { key: method.id, value: method.id }, `${method.category} · ${method.label}`)) : h('option', { value: 'wyckoff' }, '正在读取分析工具库…')), h('button', { className: 'clustr-btn primary', onClick: runMarketAnalysis, disabled: analysisState.status === 'loading' || analysisMethods.length === 0 }, analysisState.status === 'loading' ? '分析中…' : '运行分析'), h('button', { className: 'clustr-btn', onClick: clearAnalysis, disabled: analysisState.status === 'idle' }, '清除结果')),
          analysisState.status === 'ready' && analysisResult?.ok ? h(AnalysisResult, { result: analysisResult }) : analysisState.status !== 'idle' ? h('div', { role: analysisState.status === 'error' || analysisState.status === 'refused' ? 'alert' : 'status', className: `clustr-analysis-status ${analysisState.status === 'error' ? 'error' : ''}` }, analysisState.message) : h('div', { className: 'clustr-analysis-status' }, '请选择一种体系并主动运行。切换标的或周期会立即清除旧结果。'),
        ) : null,
      ),
      h('div', { className: 'clustr-side', style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        h(Card, null, h(SectionLabel, { icon: RiWallet3Line }, 'ACCOUNT PORTFOLIOS'), h('div', { className: 'clustr-account-scroll' },
          connectedAccounts.length === 0 ? h('p', { style: { color: C.dim, fontSize: 12, lineHeight: 1.6 } }, '在设置中连接一个或多个交易所账户后，这里会分别显示每个账户的余额与持仓。') : null,
          ...connectedAccounts.map((account) => h(AccountSummary, { key: `${account.exchange}:${account.profile}`, account })),
        )),
        h(Card, { className: 'clustr-analysis-launcher' }, h(SectionLabel, { icon: RiBrainAi3Line, style: { marginBottom: 9 } }, 'MARKET ANALYSIS'), h('strong', null, `${analysisMethods.length || 12} 套分析体系`), h('p', null, selectedMethod?.summary ?? '选择适合当前市场状态的分析方法，按需运行并保留反证与失效条件。'), h('button', { className: 'clustr-btn primary', onClick: () => setAnalysisOpen(true), style: { width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 } }, h(RiBarChartBoxAiLine, { 'aria-hidden': true }), analysisOpen ? '分析工具库已展开' : '打开分析工具库')),
      ),
    ),
    h(TradingWorkspacePanel, { workspace: data.tradingWorkspace, action: workspaceAction, notice: workspaceNotice, onRefresh: () => refreshTradingWorkspace(false), onReconcile: () => refreshTradingWorkspace(true) }),
    h(SessionTapePanel, { tape: data.sessionTape }),
  )))
}

function orderStatus(value) {
  const state = String(value ?? 'unknown').toLowerCase().replace(/_/g, '-')
  const states = {
    received: ['指令已接收', C.sub], validating: ['核验中', C.sub], 'awaiting-approval': ['等待批准', C.yellow], approved: ['已批准', C.sub],
    submitting: ['提交中', C.yellow], unknown: ['等待核对', C.yellow], reconciling: ['正在核对', C.yellow], acknowledged: ['交易所已接受', C.green],
    open: ['等待成交', C.green], live: ['等待成交', C.green], 'partially-filled': ['部分成交', C.yellow], partially_filled: ['部分成交', C.yellow],
    'cancel-pending': ['撤单处理中', C.yellow], filled: ['已成交', C.green], canceled: ['已撤销', C.dim], cancelled: ['已撤销', C.dim],
    rejected: ['被拒绝', C.red], denied: ['未批准', C.yellow], failed: ['处理失败', C.red], 'manual-review': ['需要人工核对', C.red],
  }
  const [label, color] = states[state] ?? ['状态待确认', C.yellow]
  return { state, label, color }
}

function sideLabel(value) {
  return ({ buy: '买入', sell: '卖出', long: '多头', short: '空头' })[String(value ?? '').toLowerCase()] ?? String(value ?? '—')
}

function compactId(value) {
  const text = String(value ?? '')
  if (!text) return '—'
  return text.length > 16 ? `${text.slice(0, 8)}…${text.slice(-5)}` : text
}

function formatTime(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return '—'
  return new Date(parsed).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function TradingWorkspacePanel({ workspace, action, notice, onRefresh, onReconcile }) {
  const [tab, setTab] = React.useState('positions')
  const positions = Array.isArray(workspace?.positions) ? workspace.positions : []
  const openOrders = Array.isArray(workspace?.openOrders) ? workspace.openOrders : []
  const trackedOrders = Array.isArray(workspace?.trackedOrders) ? workspace.trackedOrders : []
  const metrics = workspace?.metrics ?? {}
  const busy = Boolean(action)
  const tabs = [
    { id: 'positions', label: `持仓 ${positions.length}` },
    { id: 'orders', label: `当前委托 ${openOrders.length}` },
    { id: 'lifecycle', label: `订单状态 ${trackedOrders.length}` },
  ]
  const statusNotice = notice ? h('div', { role: notice.startsWith('状态刷新失败') ? 'alert' : 'status', style: { color: notice.startsWith('状态刷新失败') ? C.red : C.green, fontSize: 11, marginTop: 8 } }, notice) : null
  return h(Card, { className: 'clustr-workbench' },
    h('div', { className: 'clustr-workbench-head' },
      h('div', null, h(SectionLabel, { icon: RiWallet3Line }, 'ORDERS & POSITIONS'), h('strong', { style: { display: 'block', marginTop: 5, fontSize: 16 } }, '订单与持仓'), h('p', null, '统一查看已连接账户的当前持仓、交易所委托和 Clustr 跟踪的订单状态。待确认订单只会查询状态，不会自动重复下单。')),
      h('div', { className: 'clustr-workbench-actions' },
        h('button', { className: 'clustr-btn', onClick: onRefresh, disabled: busy }, action === 'refresh' ? '正在刷新…' : '刷新账户状态'),
        h('button', { className: 'clustr-btn primary', onClick: onReconcile, disabled: busy || Number(metrics.reconciliationOrders ?? 0) === 0 }, action === 'reconcile' ? '正在核对…' : `核对待确认订单${Number(metrics.reconciliationOrders ?? 0) ? ` · ${metrics.reconciliationOrders}` : ''}`),
      ),
    ),
    h('div', { className: 'clustr-workbench-metrics' },
      h('div', { className: 'clustr-tape-metric' }, h('small', null, '已连接账户'), h('strong', null, metrics.connectedAccounts ?? 0)),
      h('div', { className: 'clustr-tape-metric' }, h('small', null, '当前持仓'), h('strong', null, metrics.positions ?? positions.length)),
      h('div', { className: 'clustr-tape-metric' }, h('small', null, '当前委托'), h('strong', null, metrics.openOrders ?? openOrders.length)),
      h('div', { className: 'clustr-tape-metric' }, h('small', null, '等待核对'), h('strong', { style: { color: Number(metrics.reconciliationOrders ?? 0) ? C.yellow : C.green } }, metrics.reconciliationOrders ?? 0)),
    ),
    h('div', { className: 'clustr-workbench-tabs', role: 'tablist', 'aria-label': '订单与持仓视图' }, ...tabs.map((item) => h('button', { key: item.id, className: 'clustr-workbench-tab', role: 'tab', 'aria-selected': tab === item.id, onClick: () => setTab(item.id) }, item.label))),
    tab === 'positions' ? h(PositionsTable, { positions }) : tab === 'orders' ? h(OrdersTable, { orders: openOrders }) : h(LifecycleTable, { orders: trackedOrders }),
    workspace?.unavailable ? h('div', { role: 'alert', style: { color: C.yellow, fontSize: 11, marginTop: 8 } }, '订单与持仓暂时无法读取。已有订单不会被视为空记录。') : statusNotice,
  )
}

function PositionsTable({ positions }) {
  if (!positions.length) return h('div', { className: 'clustr-empty' }, '当前没有可显示的持仓。连接账户后，这里会按交易所和账户分别展示。')
  return h('div', { className: 'clustr-table-wrap' }, h('table', { className: 'clustr-table' },
    h('thead', null, h('tr', null, h('th', null, '账户'), h('th', null, '交易标的'), h('th', null, '方向 / 数量'), h('th', null, '开仓价 / 标记价'), h('th', null, '浮动盈亏'), h('th', null, '杠杆 / 强平价'))),
    h('tbody', null, ...positions.map((position, index) => h('tr', { key: `${position.exchange}:${position.profile}:${position.symbol}:${index}` },
      h('td', null, h('strong', null, EXCHANGE_NAMES[position.exchange] ?? position.exchange), h('small', { style: { display: 'block', color: C.dim } }, position.profile)),
      h('td', null, h('strong', null, position.symbol), h('small', { style: { display: 'block', color: C.dim } }, MARKET_LABELS[position.marketType] ?? position.marketType)),
      h('td', null, h('span', { style: { color: ['long', 'buy'].includes(position.side) ? C.green : C.red } }, sideLabel(position.side)), h('small', { style: { display: 'block', color: C.dim } }, formatNumber(position.size))),
      h('td', null, `${formatNumber(position.entryPrice)} / ${formatNumber(position.markPrice)}`),
      h('td', { style: { color: Number(position.unrealizedPnl) >= 0 ? C.green : C.red } }, formatNumber(position.unrealizedPnl)),
      h('td', null, `${position.leverage != null ? `${formatNumber(position.leverage)}×` : '—'} / ${formatNumber(position.liquidationPrice)}`),
    ))),
  ))
}

function OrdersTable({ orders }) {
  if (!orders.length) return h('div', { className: 'clustr-empty' }, '当前没有未完成委托，也没有等待交易所确认的订单。')
  return h('div', { className: 'clustr-table-wrap' }, h('table', { className: 'clustr-table' },
    h('thead', null, h('tr', null, h('th', null, '账户'), h('th', null, '交易标的'), h('th', null, '方向 / 类型'), h('th', null, '数量 / 已成交'), h('th', null, '委托价 / 成交均价'), h('th', null, '状态'), h('th', null, '更新时间'))),
    h('tbody', null, ...orders.map((order, index) => { const status = orderStatus(order.status); return h('tr', { key: `${order.exchange}:${order.clientOrderId || order.id}:${index}` },
      h('td', null, h('strong', null, EXCHANGE_NAMES[order.exchange] ?? order.exchange), h('small', { style: { display: 'block', color: C.dim } }, order.profile || 'default')),
      h('td', null, h('strong', null, order.symbol), h('small', { className: 'clustr-order-id', title: order.clientOrderId || order.id }, compactId(order.clientOrderId || order.id))),
      h('td', null, sideLabel(order.side), h('small', { style: { display: 'block', color: C.dim } }, order.orderType || '—')),
      h('td', null, `${formatNumber(order.size)} / ${formatNumber(order.filledSize)}`),
      h('td', null, `${formatNumber(order.price)} / ${formatNumber(order.averageFillPrice)}`),
      h('td', null, h('span', { className: 'clustr-status', style: { color: status.color } }, '●', status.label)),
      h('td', null, formatTime(order.updatedAt ?? order.createdAt)),
    ) }),
  )))
}

function LifecycleTable({ orders }) {
  if (!orders.length) return h('div', { className: 'clustr-empty' }, '本会话还没有由 Clustr 跟踪的订单。')
  return h('div', { className: 'clustr-table-wrap' }, h('table', { className: 'clustr-table' },
    h('thead', null, h('tr', null, h('th', null, '交易标的'), h('th', null, '订单编号'), h('th', null, '状态'), h('th', null, '核对次数'), h('th', null, '最近变化'), h('th', null, '状态来源'))),
    h('tbody', null, ...orders.map((order) => { const status = orderStatus(order.status); const latest = order.timeline?.[order.timeline.length - 1]; return h('tr', { key: order.lifecycleId },
      h('td', null, h('strong', null, `${EXCHANGE_NAMES[order.exchange] ?? order.exchange} · ${order.symbol}`), h('small', { style: { display: 'block', color: C.dim } }, `${sideLabel(order.side)} · ${order.orderType || '—'}`)),
      h('td', { className: 'clustr-order-id', title: order.clientOrderId }, compactId(order.clientOrderId)),
      h('td', null, h('span', { className: 'clustr-status', style: { color: status.color } }, '●', status.label)),
      h('td', null, order.reconciliation?.attempts ?? 0),
      h('td', null, latest?.reason || '状态已更新'),
      h('td', null, latest?.source === 'exchange-reconciliation' ? '交易所核对' : latest?.source === 'exchange' ? '交易所响应' : latest?.source === 'approval' ? '用户批准' : 'Clustr'),
    ) }),
  )))
}

function AnalysisResult({ result }) {
  const signalColor = result.signal === 'bullish' ? C.green : result.signal === 'bearish' ? C.red : C.yellow
  const references = Array.isArray(result.references) ? result.references.map((item) => item.title).join(' · ') : ''
  return h('div', { className: 'clustr-analysis-result' },
    h('div', { className: 'clustr-analysis-summary' }, h('strong', { style: { color: signalColor } }, result.signalLabel), h('small', { style: { color: C.dim } }, `${result.candleCount} 根 K 线 · ${result.methodology}`)),
    h('div', { className: 'clustr-evidence-grid' },
      h('div', { className: 'clustr-evidence-box' }, h('small', null, '支持证据'), (result.evidence ?? []).length ? h('ul', null, ...(result.evidence ?? []).slice(0, 5).map((item, index) => h('li', { key: index }, item))) : h('p', { style: { color: C.dim, fontSize: 10 } }, '没有足够的同向证据。')),
      h('div', { className: 'clustr-evidence-box' }, h('small', null, '反证与限制'), (result.counterEvidence ?? []).length ? h('ul', null, ...(result.counterEvidence ?? []).slice(0, 5).map((item, index) => h('li', { key: index }, item))) : h('p', { style: { color: C.dim, fontSize: 10 } }, '当前规则没有识别到额外反证。')),
    ),
    (result.levels ?? []).length ? h('div', { className: 'clustr-levels', 'aria-label': '关键价格位' }, ...(result.levels ?? []).slice(0, 8).map((item, index) => h('span', { className: 'clustr-level', key: `${item.label}:${index}` }, `${item.label} ${formatNumber(item.price)}`))) : null,
    h('div', { className: 'clustr-analysis-status' }, h('strong', null, '失效条件：'), result.invalidation),
    h('div', { className: 'clustr-analysis-status', style: { color: C.dim, fontSize: 9 } }, `${result.disclaimer}${references ? ` · 公式核对：${references}` : ''}`),
  )
}

function tapeStatus(status) {
  const value = String(status ?? 'unknown').toLowerCase()
  if (['ok', 'accepted', 'filled', 'reconciled'].includes(value)) return { label: value === 'filled' ? '已成交' : value === 'reconciled' ? '已核对' : '已接受', color: C.green }
  if (['rejected', 'denied', 'error', 'canceled'].includes(value)) return { label: value === 'denied' ? '未批准' : value === 'canceled' ? '已取消' : '被拒绝', color: value === 'error' ? C.red : C.yellow }
  return { label: value === 'received' ? '处理中' : '待核对', color: C.yellow }
}

function tapeAction(command = {}) {
  const action = ({ place: '下单', cancel: '撤单', close: '平仓', amend: '改单' })[command.action] ?? command.action ?? '交易指令'
  const side = command.side ? ` · ${{ buy: '买入', sell: '卖出', long: '多头', short: '空头' }[command.side] ?? command.side}` : ''
  return `${action}${side}${command.size ? ` · ${command.size}` : ''}`
}

function formatMs(value) {
  if (value == null || value === '') return '—'
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  return number < 1000 ? `${Math.round(number)} ms` : `${(number / 1000).toFixed(number < 10_000 ? 2 : 1)} s`
}

function SessionTapePanel({ tape }) {
  const entries = Array.isArray(tape?.entries) ? tape.entries : []
  const metrics = tape?.metrics ?? {}
  const measured = Number(metrics.measuredSlippageSamples ?? 0)
  return h(Card, { className: 'clustr-tape' },
    h('div', { className: 'clustr-tape-head' }, h('div', null, h(SectionLabel, { icon: RiHistoryLine }, 'SESSION TAPE'), h('strong', { style: { display: 'block', marginTop: 5, fontSize: 15 } }, '交易指令回放')), h(Pill, { kind: entries.length ? 'ok' : '' }, `${entries.length} 条记录`)),
    h('div', { className: 'clustr-tape-metrics' },
      h('div', { className: 'clustr-tape-metric' }, h('small', null, '本会话交易指令'), h('strong', null, metrics.commands ?? 0)),
      h('div', { className: 'clustr-tape-metric' }, h('small', null, '响应时间 P50'), h('strong', null, formatMs(metrics.responseP50Ms))),
      h('div', { className: 'clustr-tape-metric' }, h('small', null, '响应时间 P95'), h('strong', null, formatMs(metrics.responseP95Ms))),
      h('div', { className: 'clustr-tape-metric' }, h('small', null, `可核验成交滑点 · ${measured} 样本`), h('strong', null, measured ? `${Number(metrics.averageMeasuredSlippageBps).toFixed(2)} bps` : '—')),
    ),
    entries.length ? h('div', { className: 'clustr-tape-list' }, ...entries.map((entry) => {
      const status = tapeStatus(entry.status)
      const rawSlippage = entry.metrics?.slippageBps
      const slippage = Number(rawSlippage)
      const hasSlippage = rawSlippage != null && Number.isFinite(slippage)
      return h('details', { className: 'clustr-tape-entry', key: entry.id },
        h('summary', null,
          h('span', { style: { color: C.dim } }, entry.startedAt ? new Date(entry.startedAt).toLocaleTimeString() : '—'),
          h('span', null, h('strong', null, `${String(entry.command?.exchange ?? '').toUpperCase()} ${entry.command?.instrument ?? '—'}`), h('small', { style: { display: 'block', color: C.dim, marginTop: 2 } }, tapeAction(entry.command))),
          h('span', { style: { color: status.color } }, `● ${status.label}`),
          h('span', null, formatMs(entry.metrics?.responseTimeMs)),
          h('span', { style: { color: hasSlippage && slippage > 0 ? C.red : C.sub } }, hasSlippage ? `${slippage.toFixed(2)} bps` : '滑点待核验'),
        ),
        h('div', { className: 'clustr-tape-stages' }, ...(entry.stages ?? []).map((stage, index) => h('div', { className: 'clustr-tape-stage', key: `${stage.name}:${index}` },
          h('span', { style: { color: C.dim } }, `+${formatMs(stage.offsetMs)}`),
          h('span', null, stage.label),
          h('span', { style: { color: tapeStatus(stage.status).color } }, stage.details?.reason || stage.details?.exchangeState || stage.status),
        ))),
      )
    })) : h('div', { className: 'clustr-analysis-status' }, tape?.unavailable ? 'Session Tape 暂时无法读取；不会因此把会话误判为空记录。' : '本会话还没有发送交易指令。市场分析与账户查询不会计入交易回放。'),
    h('p', { className: 'clustr-tape-note' }, '响应时间从交易工具接收指令开始计算，包含风控、用户审批与交易所响应。滑点只在交易所返回可核验成交均价后计算；没有成交样本时保持为空。'),
  )
}

function AccountSummary({ account }) {
  const balances = Array.isArray(account.balances) ? account.balances : []
  const positions = Array.isArray(account.positions) ? account.positions : []
  const stateColor = account.readStatus === 'ready' ? C.green : account.readStatus === 'partial' ? C.yellow : C.red
  const stateLabel = account.readStatus === 'ready' ? '账户可读' : account.readStatus === 'partial' ? '部分数据可读' : '读取异常'
  return h('div', { className: 'clustr-account-card' },
    h('div', { className: 'clustr-account-head' }, h('div', null, h(ExchangeLogo, { exchange: account.exchange }), h('small', { style: { display: 'block', color: C.dim, marginTop: 3 } }, account.profile)), h('span', { style: { color: stateColor, fontSize: 10 } }, `● ${stateLabel}`)),
    h('div', { className: 'clustr-account-metric' }, account.totalEquityUsd != null ? `${formatNumber(account.totalEquityUsd)} USD` : '资产明细'),
    h('div', { style: { color: C.dim, fontSize: 10, margin: '2px 0 7px' } }, `${balances.length} 项余额 · ${positions.length} 个持仓`),
    ...balances.slice(0, 3).map((row, index) => h('div', { className: 'clustr-mini-row', key: `b:${index}` }, h('span', null, `${row.asset} · ${row.accountType}`), h('span', null, formatNumber(row.total)))),
    ...positions.slice(0, 3).map((row, index) => h('div', { className: 'clustr-mini-row', key: `p:${index}` }, h('span', null, `${row.symbol} · ${row.side}`), h('span', { style: { color: Number(row.unrealizedPnl) >= 0 ? C.green : C.red } }, formatNumber(row.size)))),
    account.errors?.length ? h('div', { role: 'status', style: { color: C.yellow, fontSize: 10, marginTop: 7, lineHeight: 1.5 } }, account.errors[0].reason) : null,
  )
}

function marketOptions(exchange) {
  const values = {
    okx: [['all', '全部市场'], ['spot', '现货'], ['swap', '永续']],
    binance: [['all', '全部市场'], ['spot', '现货'], ['usd-m-futures', 'U 本位永续']],
    bybit: [['all', '全部市场'], ['spot', '现货'], ['linear', 'U 本位'], ['inverse', '币本位']],
    hyperliquid: [['all', '全部市场'], ['perpetual', '永续'], ['spot', '现货']],
  }
  return (values[exchange] ?? values.okx).map(([value, label]) => ({ value, label }))
}

function defaultMarket(exchange) { return exchange === 'hyperliquid' ? 'perpetual' : 'spot' }

function formatNumber(value) { const number = Number(value); if (!Number.isFinite(number)) return '—'; return Math.abs(number) >= 1000 ? number.toLocaleString(undefined, { maximumFractionDigits: 2 }) : number.toLocaleString(undefined, { maximumFractionDigits: 6 }) }

export function SettingsPage() {
  const [status, setStatus] = React.useState(null)
  const [exchangeData, setExchangeData] = React.useState(null)
  const [exchange, setExchange] = React.useState('okx')
  const [profile, setProfile] = React.useState('demo')
  const [apiKey, setApiKey] = React.useState('')
  const [secretKey, setSecretKey] = React.useState('')
  const [bybitTestnet, setBybitTestnet] = React.useState(false)
  const [passphrase, setPassphrase] = React.useState('')
  const [accountAddress, setAccountAddress] = React.useState('')
  const [notice, setNotice] = React.useState(null)
  const [accountOverview, setAccountOverview] = React.useState(null)
  const [sessionBinding, setSessionBinding] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [executionDuration, setExecutionDuration] = React.useState('60')
  const [executionInstruments, setExecutionInstruments] = React.useState('')
  const [executionMaxOrders, setExecutionMaxOrders] = React.useState('1')
  const [executionMaxRisk, setExecutionMaxRisk] = React.useState('1')
  const [executionExchange, setExecutionExchange] = React.useState('okx')
  const [executionProfile, setExecutionProfile] = React.useState('demo')
  const load = React.useCallback(async () => {
    const nextStatus = await get('/api/crypto/status')
    setStatus(nextStatus)
    const [nextExchangeData, nextSessionBinding] = await Promise.all([
      get('/api/clustr/exchanges'),
      get('/api/crypto/session').catch((cause) => ({ bindingState: 'query_error', error: String(cause?.message ?? cause) })),
    ])
    setExchangeData(nextExchangeData)
    setSessionBinding(nextSessionBinding)
    setAccountOverview(null)
    const overview = await post('/api/clustr/accounts/overview', {}, nextStatus.csrfToken)
    setAccountOverview(Array.isArray(overview?.accounts) ? overview.accounts : [])
  }, [])
  React.useEffect(() => { load().catch((cause) => setNotice({ error: true, text: String(cause?.message ?? cause) })) }, [load])
  React.useEffect(() => { setProfile(exchange === 'okx' ? String(status?.profile ?? 'demo').toLowerCase() : 'default'); setApiKey(''); setSecretKey(''); setPassphrase(''); setAccountAddress(''); setNotice(null) }, [exchange, status?.profile])
  React.useEffect(() => {
    if (!executionInstruments && Array.isArray(status?.watchlist)) setExecutionInstruments(status.watchlist.join(', '))
    if (status?.risk?.maxRiskPerTradePercent != null) setExecutionMaxRisk(String(status.risk.maxRiskPerTradePercent))
  }, [status?.watchlist, status?.risk?.maxRiskPerTradePercent, executionInstruments])
  const providers = Array.isArray(exchangeData?.providers) ? exchangeData.providers : []
  const accounts = Array.isArray(exchangeData?.accounts) ? exchangeData.accounts : []
  const selectedProvider = providers.find((provider) => provider.id === exchange)
  const selectedUnavailable = selectedProvider?.availability === 'unavailable'
  const vaultState = exchangeData?.vault?.state ?? status?.vault?.state ?? 'unknown'
  const vaultLabel = vaultState === 'unavailable' ? '安全保险库不可用' : exchangeData?.vaultBackend ?? status?.vaultBackend ?? '系统安全保险库'
  const overviewRows = Array.isArray(accountOverview) ? accountOverview : []
  const executableAccounts = React.useMemo(() => overviewRows.filter((account) => ['okx', 'binance'].includes(account.exchange) && account.connected === true && ['ready', 'partial'].includes(account.readStatus) && account.security?.highRisk !== true && account.security?.canTrade === true), [accountOverview])
  const connectionRows = providers.flatMap((provider) => { const matches = accounts.filter((account) => account.exchange === provider.id && account.connected); return matches.length > 0 ? matches.map((account) => ({ provider, account: { ...account, ...(overviewRows.find((row) => row.exchange === account.exchange && row.profile === account.profile) ?? {}) } })) : [{ provider, account: null }] })
  React.useEffect(() => {
    const activeExchange = status?.executionMode?.exchange
    const activeProfile = status?.executionMode?.profile
    const active = executableAccounts.find((item) => item.exchange === activeExchange && item.profile === activeProfile)
    const selected = active ?? executableAccounts.find((item) => item.exchange === executionExchange && item.profile === executionProfile) ?? executableAccounts[0]
    if (selected) { setExecutionExchange(selected.exchange); setExecutionProfile(selected.profile) }
  }, [status?.executionMode?.exchange, status?.executionMode?.profile, executionExchange, executionProfile, executableAccounts])
  React.useEffect(() => {
    if (status?.readOnly === false) return
    setExecutionInstruments(executionExchange === 'binance' ? 'BTCUSDT, ETHUSDT' : (Array.isArray(status?.watchlist) ? status.watchlist.join(', ') : 'BTC-USDT, ETH-USDT-SWAP'))
  }, [executionExchange, status?.readOnly])
  const credentials = () => exchange === 'okx' ? { apiKey, secretKey, passphrase } : exchange === 'hyperliquid' ? { accountAddress } : exchange === 'bybit' ? { apiKey, secretKey, testnet: bybitTestnet } : { apiKey, secretKey }
  const clearSecretInputs = () => { setApiKey(''); setSecretKey(''); setPassphrase('') }
  const verify = async () => {
    try {
      setBusy(true); setNotice({ text: '正在验证交易所连接与权限…' })
      const result = await post('/api/clustr/credentials/verify', { exchange, profile, credentials: credentials() }, status.csrfToken)
      const partial = result.verification?.readStatus === 'partial'
      setNotice({ text: partial ? '连接验证通过；部分账户范围不可读，请检查对应权限。' : '连接与权限验证通过。' })
    } catch (cause) { clearSecretInputs(); setNotice({ error: true, text: String(cause?.message ?? cause) }) }
    finally { setBusy(false) }
  }
  const save = async () => {
    try {
      setBusy(true); setNotice({ text: '正在验证并安全保存…' })
      const result = await post('/api/clustr/credentials/save', { exchange, profile, credentials: credentials() }, status.csrfToken)
      setApiKey(''); setSecretKey(''); setPassphrase(''); setAccountAddress(''); setNotice({ text: result.message }); await load()
    } catch (cause) { clearSecretInputs(); setNotice({ error: true, text: String(cause?.message ?? cause) }) }
    finally { setBusy(false) }
  }
  const remove = async (account) => { try { await post('/api/clustr/credentials/remove', account, status.csrfToken); setNotice({ text: '连接已移除。' }); await load() } catch (cause) { setNotice({ error: true, text: String(cause?.message ?? cause) }) } }
  const toggleKillSwitch = async () => {
    const active = status?.killSwitch?.active === true
    const confirmed = window.confirm(active ? '确认恢复写操作资格？恢复后仍需通过自主权、风控和逐笔审批。' : '确认立即停止所有写操作？这会撤销现有执行许可并把自主权降为观察。')
    if (!confirmed) return
    try {
      setBusy(true)
      await post('/api/clustr/kill-switch/set', { active: !active, confirmed: true, reason: active ? '用户在设置中恢复' : '用户在设置中紧急停止', actor: 'user' }, status.csrfToken)
      setNotice({ text: active ? '写操作资格已恢复；所有安全闸门仍然有效。' : '紧急停止已启用；所有写操作都会被拒绝。' })
      await load()
    } catch (cause) { setNotice({ error: true, text: String(cause?.message ?? cause) }) }
    finally { setBusy(false) }
  }
  const toggleExecutionMode = async () => {
    const readOnly = status?.readOnly !== false
    if (readOnly) {
      const instruments = executionInstruments.split(/[\s,，]+/).map((item) => item.trim().toUpperCase()).filter(Boolean)
      const exchangeName = EXCHANGE_NAMES[executionExchange] ?? executionExchange
      const confirmed = window.confirm(`启用 ${exchangeName} ${executionProfile} 账户的逐笔审批交易？\n\n授权范围：${instruments.join('、') || '未设置'}\n有效期：${executionDuration} 分钟\n最多订单：${executionMaxOrders} 笔\n单笔风险上限：${executionMaxRisk}%\n\n每笔订单仍需风险许可和单次审批；提现与划转保持禁用。`)
      if (!confirmed) return
      try {
        setBusy(true); setNotice({ text: '正在验证执行账户、权限与交易工具…' })
        const result = await post('/api/clustr/execution-mode/set', { readOnly: false, confirmed: true, exchange: executionExchange, profile: executionProfile, durationMinutes: Number(executionDuration), instruments, maxOrders: Number(executionMaxOrders), maxRiskPercent: Number(executionMaxRisk), reason: '用户在 Clustr 设置中明确启用逐笔审批交易', actor: 'user' }, status.csrfToken)
        setNotice({ text: result.message }); await load()
      } catch (cause) { setNotice({ error: true, text: String(cause?.message ?? cause) }) }
      finally { setBusy(false) }
      return
    }
    if (!window.confirm('立即恢复只读保护？所有尚未使用的执行许可会被撤销，自主权会降为观察。已经提交到交易所的订单不会被自动取消。')) return
    try {
      setBusy(true)
      const result = await post('/api/clustr/execution-mode/set', { readOnly: true, confirmed: true, reason: '用户在 Clustr 设置中恢复只读保护', actor: 'user' }, status.csrfToken)
      setNotice({ text: result.message }); await load()
    } catch (cause) { setNotice({ error: true, text: String(cause?.message ?? cause) }) }
    finally { setBusy(false) }
  }
  const checkNetworkEgress = async () => {
    try {
      setBusy(true); setNotice({ text: '正在查询当前网络出口…' })
      const result = await post('/api/clustr/network/egress', {}, status.csrfToken)
      setNotice({ text: `当前网络出口 IP：${result.ip}` })
    } catch (cause) { setNotice({ error: true, text: String(cause?.message ?? cause) }) }
    finally { setBusy(false) }
  }
  const unbindSession = async () => {
    if (!sessionBinding?.sessionId || !window.confirm('解除专属交易会话？控制台会立即锁定，账户连接与对话记录仍然保留。')) return
    try {
      setBusy(true)
      await post('/api/crypto/session/unbind', { sessionId: sessionBinding.sessionId }, status.csrfToken)
      setNotice({ text: '专属交易会话已解除。' })
      await load()
    } catch (cause) { setNotice({ error: true, text: String(cause?.message ?? cause) }) }
    finally { setBusy(false) }
  }
  const bindingLabel = sessionBinding?.bindingState === 'bound'
    ? '已启用'
    : sessionBinding?.bindingState === 'invalid'
      ? '模式不匹配'
      : sessionBinding?.bindingState === 'query_error'
        ? '状态读取异常'
        : '尚未启用'
  const bindingColor = sessionBinding?.bindingState === 'bound' ? C.green : sessionBinding?.bindingState === 'unbound' ? C.dim : C.yellow
  const valid = !selectedUnavailable && status && profile && apiKey && secretKey && (exchange !== 'okx' || passphrase)

  return h(React.Fragment, null, h(Styles), h('div', { className: 'clustr-shell', style: { ...FONT, minHeight: 520 } }, h('div', { className: 'clustr-layer' },
    h('div', { className: 'clustr-head' }, h(Brand), h('div', { className: 'clustr-pills' }, h(Pill, { kind: vaultState === 'unavailable' ? 'warn' : 'ok' }, vaultLabel), h(Pill, { kind: status?.killSwitch?.active ? 'warn' : status?.readOnly !== false ? 'warn' : 'ok' }, status?.killSwitch?.active ? '紧急停止' : status?.readOnly !== false ? '默认只读' : '审批交易'))),
    h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(280px,.65fr)', gap: 12 } },
      h(Card, null,
        h(SectionLabel, { icon: RiLock2Line }, 'SECURE ACCOUNT CONNECTION'), h('h2', { style: { margin: '7px 0 8px', fontFamily: 'General Sans, Geist Sans, sans-serif' } }, '连接一个或多个交易所账户'),
        h('p', { style: { color: C.sub, lineHeight: 1.65, marginTop: 0 } }, `每个账户使用独立名称保存。凭证写入 ${vaultLabel}，不会进入聊天记录、插件配置、localStorage 或审计日志。账户读取与交易执行分开授权。`),
        vaultState === 'unavailable' ? h('div', { role: 'alert', style: { color: C.yellow, marginBottom: 12 } }, '当前系统没有可用的凭证保险库。账户保存与私有接口保持关闭；Clustr 不会回退为明文文件。') : null,
        h('div', { className: 'clustr-form' },
          field('交易所账户', h('select', { className: 'clustr-select', value: exchange, onChange: (event) => setExchange(event.target.value), disabled: providers.length === 0 }, providers.length ? providers.map((provider) => h('option', { key: provider.id, value: provider.id }, provider.name)) : h('option', { value: exchange }, '正在读取交易所…'))),
          selectedUnavailable
            ? h('div', { role: 'status', style: { border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 16px', color: C.sub, lineHeight: 1.65 } }, h('strong', { style: { color: C.yellow, display: 'block', marginBottom: 4 } }, 'Hyperliquid 未开放'), '当前版本不提供 Hyperliquid 账户连接、账户读取或交易执行。公共市场行情仍可在行情区使用。')
            : h(React.Fragment, null,
                field('账户名称', h('input', { className: 'clustr-input', value: profile, onChange: (event) => setProfile(event.target.value), placeholder: 'default', autoComplete: 'off' })),
                field('API Key', h('input', { className: 'clustr-input', type: 'password', value: apiKey, onChange: (event) => setApiKey(event.target.value), autoComplete: 'new-password' })),
                field('Secret Key', h('input', { className: 'clustr-input', type: 'password', value: secretKey, onChange: (event) => setSecretKey(event.target.value), autoComplete: 'new-password' })),
                exchange === 'okx' ? field('Passphrase', h('input', { className: 'clustr-input', type: 'password', value: passphrase, onChange: (event) => setPassphrase(event.target.value), autoComplete: 'new-password' })) : null,
                exchange === 'bybit' ? field('账户环境', h('label', { style: { display: 'inline-flex', alignItems: 'center', gap: 8, color: C.sub, fontSize: 12 } }, h('input', { type: 'checkbox', checked: bybitTestnet, onChange: (event) => setBybitTestnet(event.target.checked) }), 'Bybit Testnet')) : null,
              ),
        ),
        selectedProvider ? h('div', { className: 'clustr-cap-grid' }, h(Capability, { label: '账户读取', value: selectedProvider.accountReadAvailable ? '支持' : '当前不可用', color: selectedProvider.accountReadAvailable ? C.green : C.dim }), h(Capability, { label: '交易执行', value: selectedProvider.executionLabel, color: selectedProvider.executionEnabled ? C.green : C.yellow }), h(Capability, { label: '受信路径', value: selectedProvider.executionPath, color: C.sub })) : null,
        selectedUnavailable ? null : h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 14 } }, h('button', { className: 'clustr-btn', onClick: verify, disabled: !valid || busy }, '测试连接'), h('button', { className: 'clustr-btn primary', onClick: save, disabled: !valid || busy, style: { display: 'inline-flex', alignItems: 'center', gap: 7 } }, h(RiSafe2Line, { 'aria-hidden': true }), '验证并保存'), notice ? h('span', { style: { color: notice.error ? C.red : C.green, fontSize: 12 } }, notice.text) : null),
      ),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
        h(Card, null, h(SectionLabel, { icon: RiDatabase2Line, style: { marginBottom: 9 } }, 'ACCOUNT CONNECTIONS'), connectionRows.map(({ provider, account }) => { const unavailable = provider.availability === 'unavailable'; const pending = !unavailable && account?.connected && accountOverview == null; const readable = account?.readStatus === 'ready'; const partial = account?.readStatus === 'partial'; const readLabel = unavailable ? '未开放' : pending ? '正在读取' : readable ? '读取正常' : partial ? '部分可读' : account?.connected ? '读取异常' : '等待连接'; const execution = account?.execution ?? provider; return h('div', { key: `${provider.id}:${account?.profile ?? 'provider'}`, className: 'clustr-account-card' }, h('div', { className: 'clustr-account-head' }, h('div', null, h(ExchangeLogo, { exchange: provider.id }), account?.profile ? h('small', { style: { color: C.dim, display: 'block', marginTop: 3 } }, account.profile) : null), account?.connected ? h('button', { className: 'clustr-btn danger', onClick: () => remove({ exchange: account.exchange, profile: account.profile }) }, '移除') : h('span', { style: { color: unavailable ? C.yellow : C.dim, fontSize: 11 } }, unavailable ? '未开放' : '账户未连接')), h('div', { className: 'clustr-cap-grid' }, h(Capability, { label: '连接', value: unavailable ? '未开放' : account?.connected ? '已保存' : '等待连接', color: unavailable ? C.yellow : account?.connected ? C.green : C.dim }), h(Capability, { label: '读取', value: readLabel, color: unavailable ? C.yellow : pending ? C.dim : readable ? C.green : partial ? C.yellow : account?.connected ? C.red : C.dim }), h(Capability, { label: '执行', value: unavailable ? '未开放' : execution.label ?? execution.executionLabel, color: unavailable ? C.yellow : execution.enabled ?? execution.executionEnabled ? C.green : C.yellow })), account?.errors?.[0]?.reason ? h('p', { style: { color: C.red, fontSize: 11, lineHeight: 1.5, marginBottom: 0 } }, account.errors[0].reason) : null) })),
        h(Card, null,
          h(SectionLabel, { icon: status?.readOnly !== false ? RiLock2Line : RiShieldCheckLine }, 'EXECUTION CONTROL'),
          h('h3', { style: { margin: '7px 0 6px', fontSize: 16 } }, status?.readOnly !== false ? '只读保护已开启' : '逐笔审批交易已开启'),
          h('p', { style: { color: C.sub, fontSize: 12, lineHeight: 1.6, margin: '0 0 10px' } }, status?.readOnly !== false ? '选择一个已验证且具有交易权限的 OKX、Binance 或 Bybit 账户。授权只绑定该账户；Hyperliquid 账户能力未开放。' : `授权将在 ${status?.executionMode?.expiresAt ? new Date(status.executionMode.expiresAt).toLocaleString() : '当前会话结束前'} 自动恢复只读；每笔订单仍需独立审批。`),
          status?.readOnly !== false ? h('div', { className: 'clustr-form' },
            field('执行账户', h('select', { className: 'clustr-select', value: `${executionExchange}:${executionProfile}`, onChange: (event) => { const [nextExchange, ...profileParts] = event.target.value.split(':'); setExecutionExchange(nextExchange); setExecutionProfile(profileParts.join(':')) }, disabled: executableAccounts.length === 0 }, executableAccounts.length ? executableAccounts.map((account) => h('option', { key: `${account.exchange}:${account.profile}`, value: `${account.exchange}:${account.profile}` }, `${EXCHANGE_NAMES[account.exchange] ?? account.exchange} · ${account.profile}`)) : h('option', { value: '' }, '请先连接可交易账户'))),
            field('有效期', h('select', { className: 'clustr-select', value: executionDuration, onChange: (event) => setExecutionDuration(event.target.value) }, h('option', { value: '30' }, '30 分钟'), h('option', { value: '60' }, '1 小时'), h('option', { value: '240' }, '4 小时'), h('option', { value: '480' }, '8 小时'))),
            field('最多订单', h('input', { className: 'clustr-input', type: 'number', min: 1, max: 20, value: executionMaxOrders, onChange: (event) => setExecutionMaxOrders(event.target.value) })),
            field('交易标的', h('input', { className: 'clustr-input', value: executionInstruments, onChange: (event) => setExecutionInstruments(event.target.value), placeholder: 'BTC-USDT, ETH-USDT-SWAP', spellCheck: false })),
            field('单笔风险上限 %', h('input', { className: 'clustr-input', type: 'number', min: '0.01', step: '0.01', value: executionMaxRisk, onChange: (event) => setExecutionMaxRisk(event.target.value) })),
          ) : h('div', { className: 'clustr-cap-grid' }, h(Capability, { label: '执行账户', value: `${EXCHANGE_NAMES[status?.executionMode?.exchange] ?? status?.executionMode?.exchange} · ${status?.executionMode?.profile}`, color: C.green }), h(Capability, { label: '执行方式', value: '逐笔审批', color: C.green }), h(Capability, { label: '执行路径', value: status?.executionMode?.exchange === 'binance' ? 'Clustr REST' : status?.executionMode?.exchange === 'bybit' ? 'Official Trading MCP' : 'Agent Trade Kit', color: C.sub })),
          status?.executionMode?.state === 'error' ? h('p', { role: 'alert', style: { color: C.red, fontSize: 11, lineHeight: 1.5 } }, status.executionMode.reason) : null,
          h('button', { className: `clustr-btn ${status?.readOnly !== false ? 'primary' : 'danger'}`, onClick: toggleExecutionMode, disabled: !status || busy || (status.readOnly !== false && (status.executionMode?.allowUnlock !== true || status.killSwitch?.active === true || executableAccounts.length === 0)), style: { width: '100%', marginTop: 10 } }, busy ? '正在确认…' : status?.readOnly !== false ? '启用逐笔审批交易' : '立即恢复只读保护'),
          status?.killSwitch?.active && status?.readOnly !== false ? h('p', { style: { color: C.yellow, fontSize: 11, lineHeight: 1.5, marginBottom: 0 } }, '紧急停止处于启用状态。恢复写操作资格后才能申请逐笔审批交易。') : null,
        ),
        h(Card, null,
          h(SectionLabel, { icon: RiShieldCheckLine }, 'SECURITY BASELINE'),
          h('ul', { style: { color: C.sub, lineHeight: 1.8, paddingLeft: 18, marginBottom: 10, fontSize: 12 } }, h('li', null, '禁用 Withdraw / Transfer 权限'), h('li', null, '为 API Key 配置 IP 白名单'), h('li', null, '优先使用子账户与只读权限'), h('li', null, '每次交易都经过风控与一次性审批')),
          h('div', { className: 'clustr-cap-grid', style: { marginBottom: 9 } }, h(Capability, { label: '专属交易会话', value: bindingLabel, color: bindingColor })),
          sessionBinding?.sessionId ? h('p', { style: { color: C.dim, fontSize: 11, lineHeight: 1.55, margin: '0 0 9px' } }, sessionBinding.bindingState === 'bound' ? '侧栏 Clustr 始终返回已启用的会话。' : sessionBinding.bindingState === 'invalid' ? '已启用会话已离开 Clustr 模式，完整控制台保持锁定。' : '已启用会话的状态暂时无法确认。') : null,
          h('div', { style: { display: 'grid', gap: 7 } },
            h('button', { className: 'clustr-btn', onClick: checkNetworkEgress, disabled: !status || busy, style: { width: '100%' } }, '查询当前网络出口 IP'),
            sessionBinding?.sessionId ? h('button', { className: 'clustr-btn', onClick: unbindSession, disabled: !status || busy, style: { width: '100%' } }, '解除专属交易会话') : null,
            h('button', { className: `clustr-btn ${status?.killSwitch?.active ? '' : 'danger'}`, onClick: toggleKillSwitch, disabled: !status || busy, style: { width: '100%' } }, status?.killSwitch?.active ? '恢复写操作资格' : '紧急停止所有写操作')),
        ),
      ),
    ),
  )))
}

function Capability({ label, value, color }) { return h('div', { className: 'clustr-cap' }, h('small', null, label), h('strong', { style: { color } }, value)) }
function field(label, child) { return h('div', { className: 'clustr-field' }, h('label', null, label), child) }

function useClustrContext(sessionId, ctx) {
  const [value, setValue] = React.useState(null)
  const [revision, setRevision] = React.useState(0)
  React.useEffect(() => {
    const currentId = sessionId == null ? '' : String(sessionId)
    const dispose = ctx?.remote?.$on?.('agent-preset/selected', (changedSessionId) => {
      if (String(changedSessionId ?? '') === currentId) setRevision((value) => value + 1)
    })
    return () => { if (typeof dispose === 'function') dispose() }
  }, [ctx, sessionId])
  React.useEffect(() => {
    let alive = true
    const currentId = sessionId == null ? '' : String(sessionId)
    if (!currentId) { setValue(false); return () => { alive = false } }
    Promise.all([get(`/api/crypto/session?sessionId=${encodeURIComponent(currentId)}`), get('/api/crypto/status')])
      .then(([access, status]) => { if (alive) setValue(access?.eligible === true && String(access?.sessionId ?? '') === currentId ? status : false) })
      .catch(() => { if (alive) setValue(false) })
    return () => { alive = false }
  }, [sessionId, revision])
  return value
}

export function ClustrHeaderStatus({ sessionId, ctx }) {
  const status = useClustrContext(sessionId, ctx)
  if (!status) return null
  return h('span', { title: 'Clustr Trading Console 安全状态', style: { ...FONT, display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid rgba(196,190,255,.25)', borderRadius: 999, padding: '4px 9px', color: C.sub, background: 'rgba(166,159,255,.09)', boxShadow: 'inset 0 1px rgba(255,255,255,.05)', fontSize: 11 } }, h('span', { style: { color: status.readOnly ? C.yellow : C.green } }, '●'), status.readOnly ? 'Clustr · 只读' : 'Clustr · 审批交易')
}
