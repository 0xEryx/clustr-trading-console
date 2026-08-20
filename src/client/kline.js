// Lightweight, dependency-free Clustr candlestick chart.
import * as React from 'react'

const BG = 'rgba(5, 4, 10, .54)'
const GRID = 'rgba(255,255,255,.065)'
const TEXT = '#91899c'
const UP = '#26a69a'
const DOWN = '#ef5350'
const MA1 = '#f2d45c'
const MA2 = '#4c9aff'

function num(v) { const n = Number(v); return Number.isFinite(n) ? n : undefined }

export function normalizeCandles(raw) {
  const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
  const out = new Map()
  for (const item of rows) {
    let candle
    if (Array.isArray(item)) {
      candle = { ts: num(item[0]), o: num(item[1]), h: num(item[2]), l: num(item[3]), c: num(item[4]), vol: num(item[5]), confirmed: item[8] == null ? true : String(item[8]) === '1' }
    } else if (item && typeof item === 'object') {
      candle = { ts: num(item.ts ?? item.timestamp ?? item[0]), o: num(item.o ?? item.open ?? item[1]), h: num(item.h ?? item.high ?? item[2]), l: num(item.l ?? item.low ?? item[3]), c: num(item.c ?? item.close ?? item[4]), vol: num(item.vol ?? item.volume ?? item[5]), confirmed: item.confirmed ?? (item.confirm == null ? true : String(item.confirm) === '1') }
    }
    if (candle?.ts != null && candle.o != null && candle.c != null) out.set(candle.ts, candle)
  }
  return [...out.values()].sort((a, b) => a.ts - b.ts)
}

function ma(candles, n) {
  const out = []
  let sum = 0
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].c
    if (i >= n) sum -= candles[i - n].c
    out.push(i >= n - 1 ? sum / n : null)
  }
  return out
}

export function KLineSvg(props) {
  const { candles, annotations = [], bar, onBar, width: initialWidth = 760, height = 380, state = 'ready', message } = props
  const [hover, setHover] = React.useState(null)
  const frameRef = React.useRef(null)
  const [width, setWidth] = React.useState(() => Math.max(320, Number(initialWidth) || 760))

  React.useEffect(() => {
    const frame = frameRef.current
    if (!frame) return undefined
    const updateWidth = (nextWidth) => {
      const rounded = Math.max(320, Math.floor(Number(nextWidth) || frame.getBoundingClientRect().width))
      setWidth((current) => current === rounded ? current : rounded)
    }
    updateWidth(frame.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => updateWidth(entry?.contentRect?.width))
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  if (!candles || candles.length === 0) {
    const emptyMessage = state === 'loading'
      ? '正在同步 K 线数据…'
      : state === 'error'
        ? (message || 'K 线数据暂时不可用，请稍后重试。')
        : '当前周期暂无 K 线数据。'
    return React.createElement('div', { ref: frameRef, style: { width: '100%', minWidth: 0 } },
      React.createElement('div', { role: state === 'error' ? 'alert' : 'status', style: { minHeight: 280, display: 'grid', placeItems: 'center', padding: 24, color: state === 'error' ? DOWN : TEXT, background: BG, borderRadius: 9, border: '1px solid rgba(255,255,255,.08)' } }, emptyMessage),
    )
  }
  const padL = 56
  const padR = 12
  const padT = 12
  const padB = 28
  const plotW = width - padL - padR
  const plotH = height - padT - padB
  const highs = candles.map((c) => c.h)
  const lows = candles.map((c) => c.l)
  let min = Math.min(...lows)
  let max = Math.max(...highs)
  if (!(max > min)) { min -= 1; max += 1 }
  const range = max - min
  const cw = plotW / candles.length
  const x = (i) => padL + i * cw + cw / 2
  const y = (v) => padT + ((max - v) / range) * plotH
  const volMax = Math.max(...candles.map((c) => c.vol ?? 0), 1)
  const ma7 = ma(candles, 7)
  const ma25 = ma(candles, 25)
  const polyline = (arr) => arr.map((v, i) => (v == null ? '' : `${x(i).toFixed(1)},${y(v).toFixed(1)}`)).join(' ')
  const bars = candles.map((c, i) => {
    const up = c.c >= c.o
    const color = up ? UP : DOWN
    const bodyTop = y(Math.max(c.o, c.c))
    const bodyH = Math.max(1, Math.abs(y(c.o) - y(c.c)))
    const volH = ((c.vol ?? 0) / volMax) * 48
    return React.createElement(
      'g', { key: i },
      React.createElement('line', { x1: x(i), y1: y(c.h), x2: x(i), y2: y(c.l), stroke: color, strokeWidth: 1 }),
      React.createElement('rect', { x: x(i) - Math.max(1, cw * 0.32), y: bodyTop, width: Math.max(1, cw * 0.64), height: bodyH, fill: color, stroke: color, strokeWidth: 1 }),
      React.createElement('rect', { x: x(i) - Math.max(0.5, cw * 0.32), y: height - padB - volH, width: Math.max(1, cw * 0.64), height: volH, fill: color, fillOpacity: 0.38, stroke: color, strokeWidth: 0.6 }),
    )
  })
  const gridLines = [0.25, 0.5, 0.75].map((f) => React.createElement('line', { key: f, x1: padL, y1: padT + plotH * f, x2: width - padR, y2: padT + plotH * f, stroke: GRID, strokeWidth: 1 }))
  const indexByTimestamp = new Map(candles.map((candle, index) => [Number(candle.ts), index]))
  const markers = annotations.slice(-5).map((annotation, markerIndex) => {
    const index = indexByTimestamp.get(Number(annotation.ts))
    if (index == null) return null
    const bullish = annotation.type === 'spring' || annotation.type === 'sos'
    const markerY = bullish ? Math.min(height - padB - 8, y(candles[index].l) + 15) : Math.max(padT + 10, y(candles[index].h) - 15)
    const color = bullish ? UP : DOWN
    return React.createElement('g', { key: `${annotation.type}-${annotation.ts}-${markerIndex}` },
      React.createElement('circle', { cx: x(index), cy: markerY, r: 3.5, fill: color, stroke: '#080513', strokeWidth: 1 }),
      React.createElement('text', { x: x(index), y: bullish ? markerY + 13 : markerY - 7, fill: color, fontSize: 9, textAnchor: 'middle', fontWeight: 700 }, annotation.type.toUpperCase()),
    )
  })
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) * (width / Math.max(1, rect.width))
    const i = Math.max(0, Math.min(candles.length - 1, Math.floor((px - padL) / cw)))
    setHover((current) => current === i ? current : i)
  }
  const hov = hover != null ? candles[hover] : null
  return React.createElement(
    'div', { ref: frameRef, style: { width: '100%', minWidth: 0, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: TEXT } },
    React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 } },
      ['1m', '5m', '15m', '1H', '4H'].map((b) => React.createElement('button', {
        key: b, onClick: () => onBar && onBar(b),
        style: { background: bar === b ? '#a69fff' : 'rgba(255,255,255,.035)', color: bar === b ? '#090710' : '#f4f1f7', border: '1px solid rgba(255,255,255,.12)', borderRadius: 7, padding: '3px 9px', cursor: 'pointer' },
      }, b)),
      hov ? React.createElement('span', { style: { color: '#ffffff' } }, ` ${new Date(Number(hov.ts)).toLocaleString()}  O:${hov.o} H:${hov.h} L:${hov.l} C:${hov.c} V:${hov.vol ?? 0}`) : null,
    ),
    React.createElement('svg', { width: '100%', height, viewBox: `0 0 ${width} ${height}`, 'data-clustr-kline': 'true', 'aria-label': 'K 线图', onMouseMove: onMove, onMouseLeave: () => setHover(null), style: { display: 'block', width: '100%', maxWidth: '100%', background: BG, borderRadius: 9, border: '1px solid rgba(255,255,255,.08)' } },
      gridLines,
      bars,
      React.createElement('polyline', { points: polyline(ma7), fill: 'none', stroke: MA1, strokeWidth: 1.2 }),
      React.createElement('polyline', { points: polyline(ma25), fill: 'none', stroke: MA2, strokeWidth: 1, strokeDasharray: '4 3' }),
      markers,
      hover != null ? React.createElement('line', { x1: x(hover), y1: padT, x2: x(hover), y2: height - padB, stroke: '#666666', strokeDasharray: '3 3' }) : null,
    ),
    React.createElement('div', { style: { marginTop: 5 } }, '绿色=上涨 · 红色=下跌 · 黄线=MA7 · 蓝线=MA25'),
  )
}
