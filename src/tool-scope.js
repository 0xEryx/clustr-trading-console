const CLUSTR_TOOL_PREFIXES = ['clustr_', 'okx_']
const clustrAgents = new WeakSet()

export const CLUSTR_MODEL_TOOL_NAMES = new Set([
  'clustr_context',
  'clustr_market',
  'clustr_analysis',
  'clustr_risk',
  'clustr_order',
  'clustr_thesis',
  'clustr_simulation',
  'clustr_memory',
  'clustr_provenance',
  'clustr_operating_status',
])

export function isClustrToolName(name) {
  return typeof name === 'string' && CLUSTR_TOOL_PREFIXES.some((prefix) => name.startsWith(prefix))
}

export function hasClustrAgentScope(agent) {
  return Boolean(agent && (typeof agent === 'object' || typeof agent === 'function') && clustrAgents.has(agent))
}

export function markClustrAgentScope(agent) {
  if (!agent || (typeof agent !== 'object' && typeof agent !== 'function')) {
    throw new Error('Clustr Agent Scope 缺少有效 Agent')
  }
  clustrAgents.add(agent)
  return () => clustrAgents.delete(agent)
}

// Prompt assembly is the source of the model-visible tool catalog. Ordinary
// Harness presets must not learn that Clustr trading tools exist, while the
// execution guard below independently prevents guessed or nested calls.
export function filterClustrToolsForAgent(assembly, context = {}) {
  const agent = context.agent ?? (context.scope?.ctx ? context.scope : null)
  if (agent && hasClustrAgentScope(agent)) {
    return {
      ...assembly,
      tools: Array.isArray(assembly?.tools)
        ? assembly.tools.filter((schema) => CLUSTR_MODEL_TOOL_NAMES.has(schema?.name))
        : [],
    }
  }
  if (!agent) return assembly
  return {
    ...assembly,
    tools: Array.isArray(assembly?.tools)
      ? assembly.tools.filter((schema) => !isClustrToolName(schema?.name))
      : [],
  }
}

export function guardClustrToolExecution(execution) {
  if (!isClustrToolName(execution?.name)) return undefined
  if (hasClustrAgentScope(execution?.agent)) return undefined
  return 'Clustr 交易工具仅可由明确选择 Clustr Trading Console 预设的会话调用。'
}
