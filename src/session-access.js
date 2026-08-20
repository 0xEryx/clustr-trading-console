export const CLUSTR_PRESET = 'crypto-trader'

export function resolveEffectivePreset(snapshot) {
  const events = Array.isArray(snapshot?.events) ? snapshot.events : []
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event?.type !== 'agent-preset/selected') continue
    const selected = event?.data?.agentPreset
    return typeof selected === 'string' && selected ? selected : null
  }

  const header = snapshot?.session ?? snapshot?.header ?? snapshot?.meta ?? snapshot
  const initial = header?.agentPreset ?? header?.preset
  return typeof initial === 'string' && initial ? initial : null
}

export async function inspectSessionAccess(sessionQuery, sessionId) {
  if (!sessionQuery) throw new Error('会话查询服务不可用')
  const id = sessionId == null ? '' : String(sessionId)
  if (!id) throw new Error('缺少会话标识')
  const snapshot = await sessionQuery.readSession(id)
  if (!snapshot) throw new Error('会话状态读取异常')
  const effectivePreset = resolveEffectivePreset(snapshot)
  return {
    sessionId: id,
    eligible: effectivePreset === CLUSTR_PRESET,
    effectivePreset,
  }
}

export async function inspectSessionModes(sessionQuery, sessionIds) {
  if (!sessionQuery) throw new Error('会话查询服务不可用')
  const ids = [...new Set((Array.isArray(sessionIds) ? sessionIds : []).map((value) => String(value ?? '').trim()).filter((id) => id.length > 0 && id.length <= 256 && /^[a-zA-Z0-9._:-]+$/.test(id)))].slice(0, 100)
  const sessions = await Promise.all(ids.map(async (sessionId) => {
    try {
      const access = await inspectSessionAccess(sessionQuery, sessionId)
      return {
        sessionId,
        state: 'ready',
        presetEligible: access.eligible,
        effectivePreset: access.effectivePreset,
      }
    } catch {
      return {
        sessionId,
        state: 'query_error',
        presetEligible: null,
        effectivePreset: null,
      }
    }
  }))
  return { sessions }
}

export async function inspectCurrentSession(sessionQuery, bindingStore, sessionId) {
  const binding = await bindingStore.read()
  const preset = await inspectSessionAccess(sessionQuery, sessionId)
  const boundSessionId = binding?.sessionId ?? null
  const isBound = boundSessionId === preset.sessionId
  const presetEligible = preset.eligible
  const bindingState = isBound
    ? presetEligible ? 'bound' : 'invalid'
    : boundSessionId
      ? presetEligible ? 'occupied' : 'isolated'
      : presetEligible ? 'available' : 'unbound'
  return {
    sessionId: preset.sessionId,
    eligible: isBound && presetEligible,
    presetEligible,
    effectivePreset: preset.effectivePreset,
    bindingState,
    boundSessionId,
  }
}

export async function inspectBoundSession(sessionQuery, bindingStore) {
  const binding = await bindingStore.read()
  if (!binding) {
    return {
      sessionId: null,
      eligible: false,
      presetEligible: null,
      effectivePreset: null,
      bindingState: 'unbound',
      boundSessionId: null,
    }
  }
  try {
    const preset = await inspectSessionAccess(sessionQuery, binding.sessionId)
    return {
      sessionId: binding.sessionId,
      eligible: preset.eligible,
      presetEligible: preset.eligible,
      effectivePreset: preset.effectivePreset,
      bindingState: preset.eligible ? 'bound' : 'invalid',
      boundSessionId: binding.sessionId,
    }
  } catch {
    return {
      sessionId: binding.sessionId,
      eligible: false,
      presetEligible: null,
      effectivePreset: null,
      bindingState: 'query_error',
      boundSessionId: binding.sessionId,
      error: '会话状态读取异常',
    }
  }
}

export async function bindTradingSession(sessionQuery, bindingStore, sessionId, { replace = false } = {}) {
  const preset = await inspectSessionAccess(sessionQuery, sessionId)
  if (!preset.eligible) throw new Error('当前会话不是 Clustr Trading Console 模式，无法启用交易控制台。')
  await bindingStore.bind(preset.sessionId, { replace })
  return inspectCurrentSession(sessionQuery, bindingStore, preset.sessionId)
}

export async function unbindTradingSession(bindingStore, sessionId = null) {
  await bindingStore.clear(sessionId)
  return {
    sessionId: null,
    eligible: false,
    presetEligible: null,
    effectivePreset: null,
    bindingState: 'unbound',
    boundSessionId: null,
  }
}
