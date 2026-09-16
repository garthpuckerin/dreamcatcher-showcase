// Retro-tracing, applied — the demo does what production does on ratify:
// the proposed artifact-anchored split is APPLIED to the workspace (four
// dreams created from the conflated origin backlog, each taking the
// fragments the trace attributed to its artifact; the origin archived with
// the reason recorded), and it is REVERSIBLE (revert restores the origin and
// removes the split dreams). Pure functions over the dreams array; the
// caller owns state and the clock. Nothing here applies without the
// caller's explicit ratify call — the human decides.
import { DEMO_GRAPH, DEMO_REVISION, ORIGIN_DREAM_ID } from './fixtures'

export const REVISION_KEY = 'fn:revision:v1'

const shortName = names => String(names).split(' — ')[0]

export function applyRevision(dreams, revision = DEMO_REVISION, nowIso = new Date().toISOString()) {
  const origin = dreams.find(d => d.id === (revision.originDreamId ?? ORIGIN_DREAM_ID))
  if (!origin || dreams.some(d => d.splitFrom?.dreamId === origin.id)) return dreams
  const created = revision.splits.map(split => ({
    id: split.dreamId,
    title: split.names,
    description: `Split out of "${origin.title}" by a ratified revision — ${split.statements} statements attributed to ${shortName(split.names)} by artifact anchor.`,
    status: 'planning',
    brand: split.brand ?? origin.brand,
    tags: [split.key, 'from-revision'],
    created: nowIso,
    updated: nowIso,
    summary: `${shortName(split.names)} as its own dream. Provenance: the artifact-anchored retro-trace of the origin backlog, ratified by the workspace owner.`,
    wiki: [
      { kind: 'h', text: 'Provenance' },
      {
        kind: 'p',
        text: `Created by ratifying the split proposed for the origin backlog. ${split.statements} statements were attributed to ${shortName(split.names)}; statements the trace could not anchor stayed with the origin. The revision is recorded and reversible.`,
      },
    ],
    todos: [],
    fragments: origin.fragments.filter(fragment => fragment.artifact === split.key),
    splitFrom: { dreamId: origin.id, revisionAt: revision.createdAt, key: split.key },
  }))
  const archivedOrigin = {
    ...origin,
    archived: nowIso,
    updated: nowIso,
    reason: `Split into ${created.length} dreams by a ratified revision (${revision.splits
      .map(s => shortName(s.names))
      .join(', ')}). Recorded and reversible — restoring this dream reverts the revision.`,
    preSplit: { archived: origin.archived ?? null, updated: origin.updated, reason: origin.reason ?? null },
  }
  return [...created, ...dreams.map(d => (d.id === origin.id ? archivedOrigin : d))]
}

export function revertRevision(dreams, revision = DEMO_REVISION) {
  const originId = revision.originDreamId ?? ORIGIN_DREAM_ID
  return dreams
    .filter(d => d.splitFrom?.dreamId !== originId)
    .map(d => {
      if (d.id !== originId || !d.preSplit) return d
      const { preSplit, ...rest } = d
      const restored = { ...rest, archived: preSplit.archived, updated: preSplit.updated, reason: preSplit.reason }
      if (restored.archived == null) delete restored.archived
      if (restored.reason == null) delete restored.reason
      return restored
    })
}

// The Graph re-derives from the decision: a ratified split adds the four
// dreams as nodes and the proposal's quoted inter-dream links as edges — each
// still a citation, never a similarity guess. The proposal's unattributed
// statements join the margin count.
export function revisionGraph(base = DEMO_GRAPH, revision = DEMO_REVISION, status = null) {
  if (status !== 'ratified') return base
  const nodeId = key => `rev-${key}`
  const keyOf = name => revision.splits.find(s => shortName(s.names).toLowerCase() === name.toLowerCase())?.key
  const nodes = [
    ...base.nodes,
    ...revision.splits.map(split => ({ id: nodeId(split.key), name: shortName(split.names), kind: 'artifact' })),
  ]
  const edges = [
    ...base.edges,
    ...revision.links
      .map(link => ({ from: keyOf(link.from), to: keyOf(link.to), quote: link.quote }))
      .filter(link => link.from && link.to)
      .map(link => ({ from: nodeId(link.from), to: nodeId(link.to), quote: link.quote })),
  ]
  return { nodes, edges, unattributed: base.unattributed + (revision.unattributed ?? 0) }
}

export function readRevisionDecision() {
  try {
    const raw = window.localStorage.getItem(REVISION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeRevisionDecision(decision) {
  try {
    if (decision) window.localStorage.setItem(REVISION_KEY, JSON.stringify(decision))
    else window.localStorage.removeItem(REVISION_KEY)
  } catch {
    /* no-op */
  }
}
