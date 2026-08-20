function displayTitle(summary) {
  return String(summary?.title ?? '').trim()
}

export function resolveSessionIdsForRow({ title, workspaceTitle, selected }, list, workspaces, archivedSessionIds = []) {
  const archived = new Set(archivedSessionIds)
  let pool = Array.isArray(list?.ids) ? list.ids : []
  if (workspaceTitle) {
    const workspace = (Array.isArray(workspaces) ? workspaces : []).find((item) => String(item?.title ?? '').trim() === workspaceTitle)
    if (workspace) pool = Array.isArray(workspace.sessionIds) ? workspace.sessionIds : []
  }
  const matches = pool.filter((sessionId) => !archived.has(sessionId) && displayTitle(list?.byId?.[sessionId]) === title)
  if (selected && list?.current && matches.includes(list.current)) return [list.current]
  return matches
}

