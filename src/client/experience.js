import * as React from 'react'
import { Scanner } from './scanner.js'

const CLUSTR_HERO_PLACEHOLDER = '输入交易标的、市场观察、风险预算，或直接描述你的交易意图'

const GLOBAL_CSS = `
  html,body{background:#05040a!important}
  body{position:relative;color:#f4f1f7;color-scheme:dark}
  #root{position:relative;z-index:1;background:transparent!important}
  [data-slot="root"]{
    --dsw-alias-bg-base:rgba(6,5,12,.42);
    --dsw-alias-bg-layer-1:rgba(11,9,20,.82);
    --dsw-alias-bg-layer-2:rgba(16,13,28,.88);
    --dsw-alias-bg-layer-3:rgba(21,17,36,.94);
    --dsw-alias-bg-module-platform:rgba(255,255,255,.045);
    --dsw-alias-bg-multi-select:rgba(255,255,255,.065);
    --dsw-alias-bg-overlay:rgba(18,15,31,.98);
    --dsw-alias-bg-skeleton:rgba(255,255,255,.055);
    --dsw-alias-border-l1:rgba(255,255,255,.07);
    --dsw-alias-border-l2:rgba(255,255,255,.12);
    --dsw-alias-border-l2-darkmode-thin:rgba(255,255,255,.12);
    --dsw-alias-border-l3:rgba(255,255,255,.17);
    --dsw-alias-border-l4:rgba(255,255,255,.22);
    --dsw-alias-label-primary:#f4f1f7;
    --dsw-alias-label-primary-dimmed:#e2dde8;
    --dsw-alias-label-primary-bluish:#ded7ff;
    --dsw-alias-label-secondary:#b9b1c4;
    --dsw-alias-label-tertiary:#8f879a;
    --dsw-alias-label-caption:#746d7f;
    --dsw-alias-label-dimmed:#5e5868;
    --dsw-alias-brand-primary:#f4f1f7;
    --dsw-alias-brand-text:#f4f1f7;
    --dsw-alias-brand-primary-invert:#090710;
    --dsw-alias-button-primary-fill:#f4f1f7;
    --dsw-alias-button-primary-hover:#ded7e5;
    --dsw-alias-button-primary-dimmed:#4c4655;
    --dsw-alias-button-elevated-fill:rgba(19,16,31,.94);
    --dsw-alias-button-floating-fill:rgba(19,16,31,.94);
    --dsw-alias-button-floating-hover:rgba(255,255,255,.09);
    --dsw-alias-button-contrast-fill:#a69fff;
    --dsw-alias-button-info-fill:#9f96ff;
    --dsw-alias-button-info-hover:#b9b2ff;
    --dsw-alias-interactive-bg-hover:rgba(222,215,255,.07);
    --dsw-alias-interactive-bg-hover-accent:rgba(166,159,255,.15);
    --dsw-alias-interactive-bg-active:rgba(166,159,255,.18);
    --dsw-alias-interactive-bg-hover-solid:rgba(255,255,255,.08);
    --dsw-alias-scrollbar-bg-l1:rgba(255,255,255,.12);
    --dsw-alias-scrollbar-bg-l2:rgba(255,255,255,.12);
    --dsw-alias-scrollbar-hover-l1:rgba(255,255,255,.22);
    --dsw-specific-sidebar-fill:rgba(8,7,14,.72);
    --dsw-specific-sidebar-nav-item-active:rgba(166,159,255,.14);
    --dsw-specific-sidebar-nav-item-active-accent:rgba(166,159,255,.2);
    --dsw-specific-sidebar-nav-item-hover:rgba(255,255,255,.065);
    --dsw-specific-selector:rgba(255,255,255,.06);
    --dsw-specific-input-major:rgba(12,10,22,.9);
    --dsw-specific-menu:rgba(13,11,23,.98);
    --dsw-specific-tip:rgba(19,16,31,.98);
    --dsw-specific-bubble:rgba(166,159,255,.13);
    --dsw-specific-bubble-highlight:rgba(166,159,255,.19);
    --dsw-alias-markdown-code-block:rgba(11,9,20,.9);
    --dsw-alias-markdown-code-block-banner:rgba(19,16,31,.94);
    --dsw-alias-markdown-inline-code:rgba(166,159,255,.13);
    --dsw-alias-markdown-tag:rgba(255,255,255,.07);
    --dsw-shadow-lv1:0 1px 0 rgba(255,255,255,.04),0 10px 30px rgba(0,0,0,.16);
    --dsw-shadow-lv2:0 1px 0 rgba(255,255,255,.05),0 18px 48px rgba(0,0,0,.24);
    --dsw-shadow-lv3:0 1px 0 rgba(255,255,255,.06),0 28px 80px rgba(0,0,0,.42);
    position:relative;
    color:#f4f1f7;
    background:linear-gradient(180deg,rgba(3,3,8,.22),rgba(5,4,10,.55))!important;
    isolation:isolate;
  }
  [data-slot="root"] *{scrollbar-color:rgba(255,255,255,.16) transparent}
  [data-slot="root"] button,[data-slot="root"] input,[data-slot="root"] textarea,[data-slot="root"] select{font-family:inherit}
  [data-slot="sidebar"]{background:rgba(7,6,12,.72)!important;border-right:1px solid rgba(255,255,255,.08);backdrop-filter:blur(28px) saturate(118%)}
  button[aria-label="新建会话"][class*="_brand"]{color:#d8d3e2!important;filter:drop-shadow(0 4px 14px rgba(166,159,255,.08))}
  button[aria-label="新建会话"][class*="_brand"]>svg{display:block!important}
  button[aria-label="新建会话"][class*="_brand"]>svg>rect{fill:#7469ad!important}
  button[aria-label="新建会话"][class*="_brand"]>svg>g:nth-of-type(2) path{fill:#f8f6ff!important}
  button[aria-label="打开侧边栏"]>svg[class*="_railFish"]{opacity:1!important;color:#d8d3e2!important;filter:drop-shadow(0 4px 12px rgba(166,159,255,.12))}
  [data-slot="conversation.session.header"]{background:linear-gradient(180deg,rgba(8,7,14,.8),rgba(8,7,14,.58))!important;border-bottom:1px solid rgba(255,255,255,.075);backdrop-filter:blur(24px) saturate(120%)}
  [data-slot="conversation"]{background:transparent!important}
  [data-slot="conversation.composer"]{background:transparent!important}
  [data-composer-seat]{background:linear-gradient(180deg,transparent 0%,rgba(5,4,10,.34) 28%,rgba(5,4,10,.72) 70%,rgba(5,4,10,.88) 100%)!important}
  [data-slot="conversation.composer.bar"]>div{background:transparent!important;border-color:transparent!important;box-shadow:none!important;backdrop-filter:none!important}
  [data-composer-card="true"]{background:rgba(12,10,22,.9)!important;border-color:rgba(255,255,255,.12)!important;box-shadow:inset 0 1px rgba(255,255,255,.055),0 22px 64px rgba(0,0,0,.28)!important;backdrop-filter:blur(24px) saturate(128%)}
  [data-slot="conversation.session.header"] button,[data-slot="sidebar"] button{transition:background-color .18s ease,border-color .18s ease,color .18s ease,transform .18s ease}
  [data-slot="sidebar"] [role="treeitem"][aria-selected="true"]{box-shadow:inset 2px 0 #a69fff;background:rgba(166,159,255,.13)!important}
  [data-slot="conversation.session.header"] [role="tab"][aria-selected="true"]{color:#f4f1f7!important;border-color:#a69fff!important;box-shadow:inset 0 -2px #a69fff}
  [data-slot="conversation.session.header"] [role="tab"][aria-selected="true"]:after{background:#a69fff!important}
  [data-slot="conversation.session.header"] [role="tab"]:focus-visible{outline:2px solid rgba(166,159,255,.72)!important;outline-offset:2px}
  [data-phase="hero"]{--dsh-chat-content-width:min(1180px,calc(100vw - 128px))}
  [data-phase="hero"] [data-clustr-native-hero]{display:none!important}
  [data-phase="hero"] [data-composer-seat]{padding-top:16px}
  .clustr-hero-entry{box-sizing:border-box;width:100%;display:flex;flex-direction:column;align-items:center;gap:12px;margin:24px 0 2px;padding:0 16px;color:#f4f1f7;font-family:General Sans,Geist Sans,Inter,sans-serif}
  .clustr-hero-heading{display:flex;align-items:center;justify-content:center;gap:22px;text-align:left;animation:clustr-layer-arrive 420ms 20ms cubic-bezier(.23,1,.32,1) both}
  .clustr-hero-heading>div{min-width:0}
  .clustr-hero-heading h1{margin:0;color:#f7f5fa;font-size:clamp(30px,2.8vw,42px);font-weight:680;letter-spacing:-.038em;line-height:1.04}
  .clustr-hero-tagline{display:flex;align-items:baseline;gap:9px;margin:8px 0 0;line-height:1.45}
  .clustr-hero-tagline strong{color:#eeeaf3;font-size:clamp(15px,1.15vw,17px);font-weight:650;letter-spacing:-.012em}
  .clustr-hero-tagline span{color:#9f97aa;font-size:clamp(12px,.95vw,14px);font-weight:430;letter-spacing:.005em}
  .clustr-hero-mark{width:clamp(72px,6vw,84px);height:clamp(72px,6vw,84px);flex:0 0 auto;object-fit:contain;filter:drop-shadow(0 14px 34px rgba(166,159,255,.3))}
  .clustr-hero-context{position:absolute;left:50%;bottom:-8px;transform:translate(-50%,100%);display:flex;align-items:center;justify-content:center;gap:9px;min-height:34px;color:#aaa2b5;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(9,8,15,.72);padding:0 13px;font-size:12px;line-height:1;white-space:nowrap;backdrop-filter:blur(16px);box-shadow:0 12px 30px rgba(0,0,0,.16);animation:clustr-context-arrive 380ms 150ms cubic-bezier(.23,1,.32,1) both}
  .clustr-hero-context svg{width:14px;height:14px}.clustr-context-dot{width:7px;height:7px;border-radius:50%;background:#81798b;box-shadow:0 0 0 4px rgba(129,121,139,.08)}.clustr-context-dot.ready{background:#63c98a;box-shadow:0 0 0 4px rgba(99,201,138,.08)}.clustr-context-dot.degraded{background:#d7b958;box-shadow:0 0 0 4px rgba(215,185,88,.08)}
  .clustr-context-separator{width:1px;height:14px;background:rgba(255,255,255,.12);margin:0 3px}.clustr-context-protected{color:#d7bd65}.clustr-context-danger{color:#ff8585}.clustr-context-ready{color:#81d6a5}.clustr-context-pending{color:#9f97a9}
  .clustr-launcher{appearance:none;display:inline-flex;align-items:center;background:rgba(166,159,255,.12);border:1px solid rgba(196,190,255,.28);border-radius:999px;cursor:pointer;font-size:12px;color:#f4f1f7;padding:5px 11px;box-shadow:inset 0 1px rgba(255,255,255,.06)}
  .clustr-launcher:hover{background:rgba(166,159,255,.19);border-color:rgba(211,207,255,.42)}
  .clustr-global-host,.clustr-scanner-anchor{position:absolute;width:0;height:0;pointer-events:none;overflow:hidden}
  .clustr-scanner{position:fixed;inset:0;width:100vw;height:100vh;overflow:hidden;pointer-events:none;z-index:0;background:#05040a;animation:clustr-scanner-arrive 560ms cubic-bezier(.23,1,.32,1) both}
  .clustr-scanner canvas{-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 5%,#000 91%,transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 5%,#000 91%,transparent 100%)}
  .clustr-scanner:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 68% 20%,rgba(166,159,255,.08),transparent 36%),linear-gradient(90deg,rgba(5,4,10,.68) 0%,rgba(5,4,10,.2) 36%,rgba(5,4,10,.48) 100%);z-index:1}
  .clustr-scanner:after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px);background-size:56px 56px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.52),transparent 74%);z-index:2}
  .clustr-scanner[data-scanner-fallback="true"]{background:radial-gradient(circle at 68% 22%,rgba(166,159,255,.2),transparent 34%),radial-gradient(circle at 38% 76%,rgba(224,222,234,.08),transparent 28%),#05040a}
  [data-clustr-hero] [data-composer-card="true"]{animation:clustr-composer-arrive 440ms 105ms cubic-bezier(.23,1,.32,1) both}
  @keyframes clustr-layer-arrive{0%{opacity:0;filter:blur(4px);transform:translateY(13px) scale(.988)}100%{opacity:1;filter:blur(0);transform:none}}
  @keyframes clustr-context-arrive{0%{opacity:0;filter:blur(3px);transform:translate(-50%,calc(100% + 10px)) scale(.97)}100%{opacity:1;filter:blur(0);transform:translate(-50%,100%) scale(1)}}
  @keyframes clustr-context-mobile-arrive{0%{opacity:0;filter:blur(3px);transform:translateY(10px) scale(.97)}100%{opacity:1;filter:blur(0);transform:none}}
  @keyframes clustr-composer-arrive{0%{opacity:.18;filter:blur(5px);transform:translateY(12px) scale(.992)}100%{opacity:1;filter:blur(0);transform:none}}
  @keyframes clustr-scanner-arrive{0%{opacity:0;filter:blur(7px);transform:scale(1.012)}100%{opacity:1;filter:blur(0);transform:scale(1)}}
  @media(max-width:800px){[data-phase="hero"]{--dsh-chat-content-width:min(calc(100vw - 124px),calc(100% - 24px))}[data-clustr-hero-stack]{width:calc(100vw - 124px)!important;max-width:calc(100vw - 124px)!important;left:32px}[data-clustr-hero-workspace-row]{box-sizing:border-box;width:100%;flex-direction:column;align-items:center!important;justify-content:center!important;flex-wrap:nowrap;padding-left:0!important}.clustr-hero-entry{box-sizing:border-box;width:100%;gap:12px;margin-top:8px;padding:0 4px}.clustr-hero-heading{width:100%;flex-direction:column;gap:7px;text-align:center}.clustr-hero-mark{width:56px;height:56px}.clustr-hero-heading h1{width:100%;max-width:100%;font-size:clamp(22px,5.8vw,28px);line-height:1.08;text-align:center;white-space:normal;overflow-wrap:anywhere;text-wrap:balance}.clustr-hero-tagline{max-width:300px;display:block;margin:0 auto;line-height:1.5;white-space:normal;text-wrap:balance}.clustr-hero-tagline strong,.clustr-hero-tagline span{display:block}.clustr-hero-tagline strong{font-size:13px}.clustr-hero-tagline span{margin-top:2px;font-size:11px}.clustr-hero-context{position:static;transform:none;box-sizing:border-box;max-width:100%;flex-wrap:wrap;height:auto;min-height:34px;padding:8px 12px;white-space:normal;animation-name:clustr-context-mobile-arrive}}
  @media(prefers-reduced-motion:reduce){[data-slot="root"] *{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
`

function restoreNativeHero() {
  const hero = document.querySelector('[data-phase="hero"]')
  if (!hero) return
  delete hero.dataset.clustrHero
  hero.querySelectorAll('[data-clustr-native-hero],[data-clustr-hero-title-native],[data-clustr-hero-workspace-row],[data-clustr-hero-stack]').forEach((element) => {
    delete element.dataset.clustrNativeHero
    delete element.dataset.clustrHeroTitleNative
    delete element.dataset.clustrHeroWorkspaceRow
    delete element.dataset.clustrHeroStack
  })
  const textarea = hero.querySelector('textarea[data-clustr-original-placeholder]')
  if (textarea) {
    const original = textarea.dataset.clustrOriginalPlaceholder ?? ''
    if (original) textarea.setAttribute('placeholder', original)
    else textarea.removeAttribute('placeholder')
    delete textarea.dataset.clustrOriginalPlaceholder
  }
}

function useClustrHeroChrome(active) {
  React.useEffect(() => {
    if (!active) {
      restoreNativeHero()
      return undefined
    }
    const synchronize = () => {
      const hero = document.querySelector('[data-phase="hero"]')
      if (!hero) return
      hero.dataset.clustrHero = 'true'
      const exactTexts = new Set(['探索未至之境', 'Into the Unknown'])
      const title = hero.querySelector('[data-clustr-hero-title-native]') ?? Array.from(hero.querySelectorAll('span')).find((element) => exactTexts.has(element.textContent?.trim()))
      if (title) {
        title.dataset.clustrHeroTitleNative = 'true'
        const nativeShell = title.parentElement?.parentElement?.parentElement
        if (nativeShell) nativeShell.dataset.clustrNativeHero = 'true'
      }
      const workspaceButton = hero.querySelector('button[aria-label="选择工作区"],button[aria-label="Choose workspace"]')
      if (workspaceButton?.parentElement) workspaceButton.parentElement.dataset.clustrHeroWorkspaceRow = 'true'
      const entry = hero.querySelector('.clustr-hero-entry')
      const stack = entry?.parentElement?.parentElement
      if (stack) stack.dataset.clustrHeroStack = 'true'
      const textarea = hero.querySelector('textarea')
      if (textarea && textarea.getAttribute('placeholder') !== CLUSTR_HERO_PLACEHOLDER) {
        if (!textarea.hasAttribute('data-clustr-original-placeholder')) textarea.dataset.clustrOriginalPlaceholder = textarea.getAttribute('placeholder') ?? ''
        textarea.setAttribute('placeholder', CLUSTR_HERO_PLACEHOLDER)
      }
    }
    synchronize()
    const observer = new MutationObserver(synchronize)
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-phase', 'placeholder'] })
    return () => observer.disconnect()
  }, [active])
}

export function ClustrGlobalExperience({ active }) {
  useClustrHeroChrome(active)
  if (!active) return null
  return React.createElement(React.Fragment, null,
    React.createElement('style', null, GLOBAL_CSS),
    React.createElement('div', { className: 'clustr-global-host', 'aria-hidden': true },
      React.createElement(Scanner, {
        color1: '#e0deea', color2: '#a69fff', color3: '#ffffff', speed: 0.15,
        sweepSpeed: 0.25, sweepWidth: 1.6, sweepFalloff: 6, scale: 1.5,
        frequency: 2, ripple: 0.7, bandDensity: 11, lineSharpness: 5.5,
        glow: 0.2, scanDirection: 'vertical', colorSpread: 0.69, brightness: 1,
        contrast: 1.2, softness: 1.55, vignette: 0.45, scanline: true,
        grain: true, grainIntensity: 0.05, opacity: 0.4, mouseInteraction: true,
        mouseRadius: 0.5, mouseStrength: 0.5, portal: true,
      }),
    ),
  )
}
