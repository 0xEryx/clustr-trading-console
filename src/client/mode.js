import * as React from 'react'

const CLUSTR_PRESET = 'crypto-trader'
const CLUSTR_PRESET_LABEL = 'Clustr Trading Console'
let lastAnnouncedMode = null
let transitionTimer = null

function announceModeTransition(clustrSelected) {
  if (lastAnnouncedMode === null) {
    lastAnnouncedMode = clustrSelected
    return
  }
  if (lastAnnouncedMode === clustrSelected) return
  lastAnnouncedMode = clustrSelected
  const value = clustrSelected ? 'clustr' : 'standard'
  document.documentElement.dataset.clustrModeTransition = value
  if (transitionTimer) clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => {
    if (document.documentElement.dataset.clustrModeTransition === value) delete document.documentElement.dataset.clustrModeTransition
  }, 620)
}

function readHeroPreset() {
  const hero = document.querySelector('[data-phase="hero"]')
  if (!hero) return null
  const presetButton = Array.from(hero.querySelectorAll('button')).find((button) => button.textContent?.trim() === CLUSTR_PRESET_LABEL)
  return Boolean(presetButton)
}

export function useClustrMode({ sessionId, useSessions }) {
  const sessionPreset = useSessions((state) => {
    const currentId = sessionId ?? state.current
    return currentId == null ? null : state.byId[currentId]?.agentPreset ?? null
  })
  const [heroPresetSelected, setHeroPresetSelected] = React.useState(null)

  React.useEffect(() => {
    const synchronize = () => {
      const selected = readHeroPreset()
      if (selected !== null) announceModeTransition(selected)
      setHeroPresetSelected(selected)
    }
    synchronize()
    const observer = new MutationObserver(synchronize)
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-phase', 'aria-expanded'] })
    return () => observer.disconnect()
  }, [])

  return heroPresetSelected ?? sessionPreset === CLUSTR_PRESET
}
