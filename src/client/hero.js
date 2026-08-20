import * as React from 'react'
import { RiShieldCheckLine, RiLock2Line, RiAlertLine } from 'react-icons/ri'
import clustrMark from './assets/clustr-mark.png'
import { useClustrMode } from './mode.js'

function statusLabel(status) {
  if (!status) return { text: '正在确认安全状态', tone: 'pending', Icon: RiLock2Line }
  if (status.killSwitch?.active) return { text: '紧急停止已启用', tone: 'danger', Icon: RiAlertLine }
  if (status.readOnly !== false) return { text: '只读保护', tone: 'protected', Icon: RiLock2Line }
  return { text: '审批后可执行', tone: 'ready', Icon: RiShieldCheckLine }
}

export function ClustrHeroEntry({ sessionId, useSession, useSessions }) {
  const hero = useSession((state) => state.composerPhase === 'blank')
  const clustrSession = useClustrMode({ sessionId, useSessions })
  const [status, setStatus] = React.useState(null)
  const [marketContext, setMarketContext] = React.useState({ exchange: 'OKX', symbol: 'BTC/USDT', marketType: '现货', timeframe: '15m', label: 'OKX BTC/USDT（现货，15m）' })

  React.useEffect(() => {
    if (!hero || !clustrSession) return undefined
    let live = true
    const contextUrl = `/api/clustr/context?sessionId=${encodeURIComponent(String(sessionId ?? ''))}`
    Promise.all([
      fetch('/api/crypto/status').then((response) => response.ok ? response.json() : null),
      fetch(contextUrl).then((response) => response.ok ? response.json() : null),
    ])
      .then(([nextStatus, nextContext]) => {
        if (!live) return
        setStatus(nextStatus)
        const value = nextContext?.context
        if (value) {
          const exchange = ({ okx: 'OKX', binance: 'Binance', bybit: 'Bybit', hyperliquid: 'Hyperliquid' })[value.exchange] ?? value.exchange
          const marketType = ({ spot: '现货', swap: '永续', linear: 'U 本位', inverse: '币本位', perpetual: '永续', 'usd-m-futures': 'U 本位永续' })[value.marketType] ?? value.marketType
          const symbol = value.displaySymbol || value.symbol
          setMarketContext({ exchange, symbol, marketType, timeframe: value.timeframe, label: `${exchange} ${symbol}（${marketType}，${value.timeframe}）` })
        }
      })
      .catch(() => { if (live) setStatus(null) })
    return () => { live = false }
  }, [hero, clustrSession, sessionId])

  if (!hero || !clustrSession) return null
  const safety = statusLabel(status)
  const readable = status?.accountPoll?.state === 'ready'

  return React.createElement('section', { className: 'clustr-hero-entry', 'aria-labelledby': 'clustr-hero-title' },
    React.createElement('div', { className: 'clustr-hero-heading' },
      React.createElement('img', { src: clustrMark, alt: '', className: 'clustr-hero-mark' }),
      React.createElement('div', null,
        React.createElement('h1', { id: 'clustr-hero-title' }, 'Clustr Trading Console'),
        React.createElement('p', { className: 'clustr-hero-tagline' },
          React.createElement('strong', null, 'AI 交易员的全能终端。'),
          React.createElement('span', null, '统一市场、账户、决策与风控，让复杂交易清晰可控。'),
        ),
      ),
    ),
    React.createElement('div', { className: 'clustr-hero-context', 'aria-label': '当前交易上下文' },
      React.createElement('span', { className: `clustr-context-dot ${readable ? 'ready' : 'degraded'}`, 'aria-hidden': true }),
      React.createElement('span', null, `${marketContext.exchange} · ${marketContext.symbol} · ${marketContext.timeframe}`),
      React.createElement('span', { className: 'clustr-context-separator', 'aria-hidden': true }),
      React.createElement(safety.Icon, { 'aria-hidden': true }),
      React.createElement('span', { className: `clustr-context-${safety.tone}` }, safety.text),
    ),
  )
}
