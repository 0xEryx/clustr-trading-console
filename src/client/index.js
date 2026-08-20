// Clustr Trading Console — additive Harness experience layer.
import * as React from 'react'
import { ClustrHeaderStatus, ConsoleGate, SettingsPage } from './console.js'
import { ClustrGlobalExperience } from './experience.js'
import { ClustrHeroEntry } from './hero.js'
import { useClustrMode } from './mode.js'
import { ClustrSessionBadges } from './session-badges.js'
import clustrMark from './assets/clustr-mark.png'

export const inject = ['slots', 'sessions', 'remote']

const MODE_TRANSITION_CSS = `
  .clustr-mode-veil{position:fixed;inset:0;z-index:1000;pointer-events:none;opacity:0;overflow:hidden;background:radial-gradient(circle at 64% 48%,rgba(166,159,255,.2),transparent 34%),rgba(5,4,10,.18);backdrop-filter:blur(0);will-change:opacity,backdrop-filter}
  .clustr-mode-veil:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;opacity:0;background:linear-gradient(90deg,transparent 8%,rgba(218,214,255,.3) 28%,#f5f3ff 50%,rgba(166,159,255,.34) 72%,transparent 92%);box-shadow:0 0 18px rgba(199,193,255,.55),0 0 70px rgba(166,159,255,.2)}
  html[data-clustr-mode-transition="clustr"] .clustr-mode-veil{animation:clustr-veil-in 560ms cubic-bezier(.23,1,.32,1) both}
  html[data-clustr-mode-transition="clustr"] .clustr-mode-veil:before{animation:clustr-scan-down 520ms cubic-bezier(.23,1,.32,1) both}
  html[data-clustr-mode-transition="standard"] .clustr-mode-veil{animation:clustr-veil-out 460ms cubic-bezier(.23,1,.32,1) both}
  html[data-clustr-mode-transition="standard"] .clustr-mode-veil:before{animation:clustr-scan-up 420ms cubic-bezier(.23,1,.32,1) both}
  html[data-clustr-mode-transition="standard"] [data-phase="hero"]{animation:clustr-native-return 380ms cubic-bezier(.23,1,.32,1) both}
  @keyframes clustr-veil-in{0%{opacity:0;backdrop-filter:blur(0)}28%{opacity:.58;backdrop-filter:blur(3px)}100%{opacity:0;backdrop-filter:blur(0)}}
  @keyframes clustr-veil-out{0%{opacity:0;backdrop-filter:blur(0)}24%{opacity:.34;backdrop-filter:blur(2px)}100%{opacity:0;backdrop-filter:blur(0)}}
  @keyframes clustr-scan-down{0%{opacity:0;transform:translateY(-4vh)}18%{opacity:.9}72%{opacity:.55}100%{opacity:0;transform:translateY(104vh)}}
  @keyframes clustr-scan-up{0%{opacity:0;transform:translateY(104vh)}18%{opacity:.7}72%{opacity:.4}100%{opacity:0;transform:translateY(-4vh)}}
  @keyframes clustr-native-return{0%{opacity:.32;filter:blur(3px);transform:translateY(8px) scale(.992)}100%{opacity:1;filter:blur(0);transform:none}}
  .clustr-session-mark{box-sizing:border-box;width:16px;height:20px;flex:none;display:inline-flex;align-items:center;justify-content:center;margin-right:6px;opacity:.88;mix-blend-mode:difference;animation:clustr-session-mark-in 180ms cubic-bezier(.23,1,.32,1) both}
  .clustr-session-mark img{display:block;width:15px;height:15px;object-fit:contain;pointer-events:none;user-select:none}
  [data-clustr-session="true"][aria-selected="true"] .clustr-session-mark{opacity:1}
  @keyframes clustr-session-mark-in{0%{opacity:0;transform:scale(.72)}100%{transform:scale(1)}}
  @media(prefers-reduced-motion:reduce){.clustr-session-mark{animation:none!important}.clustr-mode-veil:before{display:none}html[data-clustr-mode-transition] .clustr-mode-veil{animation:clustr-reduced-fade 160ms ease-out both!important;backdrop-filter:none!important}html[data-clustr-mode-transition="standard"] [data-phase="hero"]{animation:clustr-reduced-return 160ms ease-out both!important}@keyframes clustr-reduced-fade{0%{opacity:.14}100%{opacity:0}}@keyframes clustr-reduced-return{0%{opacity:.7}100%{opacity:1}}}
`

async function getSession() {
  const res = await fetch('/api/crypto/session')
  if (!res.ok) return null
  return res.json()
}

function ClustrSidebarAction({ useSessions, useWorkspaces, sessions, ctx }) {
  const [notice, setNotice] = React.useState(null)
  const activeSessionId = useSessions ? useSessions((state) => state.current) : null
  const clustrActive = useClustrMode({ sessionId: activeSessionId, useSessions })

  const onClick = async () => {
    try {
      const info = await getSession()
      if (!info?.sessionId) {
        setNotice('尚未启用专属交易会话：请在 Clustr 会话中点击「启用此会话」')
        return
      }
      if (!info.eligible) {
        if (info.bindingState === 'query_error') setNotice('已启用交易会话的状态读取异常，请稍后重试')
        else if (info.bindingState === 'invalid') setNotice('已启用交易会话当前不在 Clustr 模式，请在其他 Clustr 会话中明确切换')
        else setNotice('尚未启用专属交易会话：请在 Clustr 会话中点击「启用此会话」')
        return
      }
      sessions?.open(info.sessionId)
      setNotice(null)
    } catch (e) {
      setNotice('交易台不可用：' + String(e?.message ?? e))
    }
  }

  return React.createElement('div', { style: { position: 'relative' } },
    React.createElement(ClustrSessionBadges, { useSessions, useWorkspaces, ctx }),
    React.createElement('style', null, MODE_TRANSITION_CSS),
    React.createElement('div', { className: 'clustr-mode-veil', 'aria-hidden': true }),
    React.createElement(ClustrGlobalExperience, { active: clustrActive }),
    React.createElement('button', {
      onClick,
      title: '进入 Clustr Trading Console',
      className: 'clustr-launcher',
    }, React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, React.createElement('img', { src: clustrMark, alt: '', style: { width: 14, height: 14, objectFit: 'contain' } }), 'Clustr')),
    notice ? React.createElement('div', {
      style: { position: 'absolute', bottom: 28, right: 0, background: '#161b22', border: '1px solid #30363d', color: '#e6edf3', borderRadius: 6, padding: '6px 10px', fontSize: 11, width: 260, zIndex: 50 },
    }, notice) : null,
  )
}

export function apply(ctx) {
  const slots = ctx.get('slots')
  const sessions = ctx.get('sessions')
  if (!slots) return

  // 1) Global sidebar footer button (root scope, additive).
  slots.inject('sidebar.footer.action', () => slots.register(
    { name: 'sidebar.footer.action', id: 'crypto-console', order: 50, label: 'Clustr' },
    (props) => React.createElement(ClustrSidebarAction, { ...props, sessions, ctx }),
  ))

  // 2) Console view tab inside every session's view ring.
  slots.inject('conversation.view', () => slots.register(
    { name: 'conversation.view', id: 'crypto-console', order: 20, label: 'Clustr Console' },
    (props) => React.createElement(ConsoleGate, { sessionId: props.sessionId, inputActions: props.inputActions, ctx }),
  ))

  // 3) Settings page.
  slots.inject('settings.section', () => slots.register(
    { name: 'settings.section', id: 'crypto', order: 30, label: 'Clustr Trading' },
    () => React.createElement(SettingsPage),
  ))

  // 4) Persistent Clustr identity and safety context inside the trading session.
  slots.inject('conversation.session.header.actions', () => slots.register(
    { name: 'conversation.session.header.actions', id: 'clustr-status', order: -10 },
    (props) => React.createElement(ClustrHeaderStatus, { ...props, ctx }),
  ))

  // 5) Turn the blank-session composer into Clustr's trading-decision entry.
  slots.inject('conversation.input.dock', () => slots.register(
    { name: 'conversation.input.dock', id: 'clustr-hero-entry', order: -100 },
    (props) => React.createElement(ClustrHeroEntry, props),
  ))
}
