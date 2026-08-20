import * as React from 'react'
import clustrMark from './assets/clustr-mark.png'
import { resolveSessionIdsForRow } from './session-row-resolver.js'

function rowTitle(row) {
  return Array.from(row.children).find((child) => child.tagName === 'SPAN' && !child.hasAttribute('data-clustr-session-mark') && String(child.textContent ?? '').trim())?.textContent?.trim() ?? ''
}

function rowWorkspaceTitle(row) {
  const group = row.parentElement
  const project = group?.querySelector(':scope > [role="treeitem"][aria-expanded]')
  if (!project) return ''
  return String(project.textContent ?? '').trim()
}

function installMark(row) {
  if (row.querySelector(':scope > [data-clustr-session-mark]')) return
  const mark = document.createElement('span')
  mark.className = 'clustr-session-mark'
  mark.dataset.clustrSessionMark = 'true'
  mark.title = 'Clustr Trading Console 会话'
  mark.setAttribute('aria-hidden', 'true')
  const image = document.createElement('img')
  image.src = clustrMark
  image.alt = ''
  image.draggable = false
  mark.appendChild(image)
  row.insertBefore(mark, row.firstChild)
  row.dataset.clustrSession = 'true'
}

function removeMark(row) {
  row.querySelector(':scope > [data-clustr-session-mark]')?.remove()
  delete row.dataset.clustrSession
}

export function ClustrSessionBadges({ useSessions, useWorkspaces, ctx }) {
  const list = useSessions ? useSessions((state) => state) : { ids: [], byId: {}, current: null }
  const workspaceState = useWorkspaces ? useWorkspaces((state) => state) : { items: [], archivedSessionIds: [] }
  const idsKey = (Array.isArray(list?.ids) ? list.ids : []).join(',')
  const [clustrIds, setClustrIds] = React.useState(() => new Set())
  const [revision, setRevision] = React.useState(0)

  React.useEffect(() => {
    const dispose = ctx?.remote?.$on?.('agent-preset/selected', (sessionId) => {
      if (list?.byId?.[sessionId]) setRevision((value) => value + 1)
    })
    return () => { if (typeof dispose === 'function') dispose() }
  }, [ctx, list?.byId])

  React.useEffect(() => {
    let alive = true
    const ids = idsKey ? idsKey.split(',').filter(Boolean) : []
    if (ids.length === 0) { setClustrIds(new Set()); return () => { alive = false } }
    fetch(`/api/crypto/session-modes?ids=${encodeURIComponent(ids.join(','))}`, { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error('mode lookup failed')
        return response.json()
      })
      .then((result) => {
        if (!alive) return
        setClustrIds(new Set((Array.isArray(result?.sessions) ? result.sessions : []).filter((item) => item?.state === 'ready' && item?.presetEligible === true).map((item) => item.sessionId)))
      })
      .catch(() => { if (alive) setClustrIds(new Set()) })
    return () => { alive = false }
  }, [idsKey, revision])

  const clustrKey = [...clustrIds].sort().join(',')
  const workspaceKey = JSON.stringify((Array.isArray(workspaceState?.items) ? workspaceState.items : []).map((workspace) => [workspace.workspaceId, workspace.title, workspace.sessionIds]))
  const archivedKey = (Array.isArray(workspaceState?.archivedSessionIds) ? workspaceState.archivedSessionIds : []).join(',')

  React.useEffect(() => {
    let frame = 0
    const decorate = () => {
      frame = 0
      const rows = document.querySelectorAll('[role="treeitem"][aria-selected]')
      for (const row of rows) {
        const title = rowTitle(row)
        const candidates = resolveSessionIdsForRow({
          title,
          workspaceTitle: rowWorkspaceTitle(row),
          selected: row.getAttribute('aria-selected') === 'true',
        }, list, workspaceState?.items, workspaceState?.archivedSessionIds)
        const shouldMark = candidates.length > 0 && candidates.every((sessionId) => clustrIds.has(sessionId))
        if (shouldMark) installMark(row)
        else removeMark(row)
      }
    }
    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(decorate)
    }
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-selected', 'aria-expanded'] })
    decorate()
    return () => {
      observer.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
      document.querySelectorAll('[data-clustr-session-mark]').forEach((node) => node.remove())
      document.querySelectorAll('[data-clustr-session]').forEach((node) => delete node.dataset.clustrSession)
    }
  }, [list, workspaceState?.items, workspaceState?.archivedSessionIds, clustrKey, workspaceKey, archivedKey])

  return null
}
