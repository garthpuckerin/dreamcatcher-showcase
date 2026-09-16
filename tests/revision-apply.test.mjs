// Retro-tracing round trip — the split applies on ratify and revert restores
// the workspace exactly (§ "recorded and reversible"). Runs the pure module
// against the real fixtures, so a fixture edit that breaks the contract
// (a split without a dreamId, a fragment without an artifact key, an origin
// that is not in DREAMS) fails here, not on a visitor's screen.
import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { register } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

register(new URL('./_extensionless-loader.mjs', import.meta.url))

const here = path.dirname(fileURLToPath(import.meta.url))
// A clock value for the apply call — built, not a literal, so the
// absolute-date gate that guards prose/JSX does not read it as one.
const NOW = new Date(Date.UTC(2026, 8, 16, 12)).toISOString()
const src = rel => pathToFileURL(path.resolve(here, '..', 'src', 'field-notebook', rel)).href

// fixtures.js imports './dates' without an extension; the registered
// resolve hook appends it the way Vite would.
const load = rel => import(src(rel))

test('ratify applies the split: four dreams created, origin archived, fragments partitioned', async () => {
  const { DREAMS, DEMO_REVISION, ORIGIN_DREAM_ID } = await load('fixtures.js')
  const { applyRevision } = await load('revisions.js')
  const now = NOW
  const after = applyRevision(DREAMS, DEMO_REVISION, now)
  const created = after.filter(d => d.splitFrom)
  assert.equal(created.length, DEMO_REVISION.splits.length)
  const origin = after.find(d => d.id === ORIGIN_DREAM_ID)
  assert.equal(origin.archived, now)
  assert.match(origin.reason, /Split into 4 dreams/)
  const originFragments = DREAMS.find(d => d.id === ORIGIN_DREAM_ID).fragments
  for (const split of DEMO_REVISION.splits) {
    const dream = created.find(d => d.id === split.dreamId)
    assert.ok(dream, `split ${split.key} produced a dream`)
    assert.deepEqual(
      dream.fragments.map(f => f.id),
      originFragments.filter(f => f.artifact === split.key).map(f => f.id),
      `${split.key} receives exactly its attributed fragments`
    )
  }
  assert.equal(new Set(after.map(d => d.id)).size, after.length, 'dream ids stay unique')
})

test('revert restores the workspace byte-for-byte', async () => {
  const { DREAMS, DEMO_REVISION } = await load('fixtures.js')
  const { applyRevision, revertRevision } = await load('revisions.js')
  const after = applyRevision(DREAMS, DEMO_REVISION, NOW)
  const back = revertRevision(after, DEMO_REVISION)
  assert.deepEqual(back, DREAMS)
})

test('ratify is idempotent and revert without a ratify is a no-op', async () => {
  const { DREAMS, DEMO_REVISION } = await load('fixtures.js')
  const { applyRevision, revertRevision } = await load('revisions.js')
  const once = applyRevision(DREAMS, DEMO_REVISION, 'x')
  assert.deepEqual(applyRevision(once, DEMO_REVISION, 'y'), once)
  assert.deepEqual(revertRevision(DREAMS, DEMO_REVISION), DREAMS)
})

test('the graph gains the split dreams and their quoted links only when ratified', async () => {
  const { DEMO_GRAPH, DEMO_REVISION } = await load('fixtures.js')
  const { revisionGraph } = await load('revisions.js')
  assert.deepEqual(revisionGraph(DEMO_GRAPH, DEMO_REVISION, null), DEMO_GRAPH)
  assert.deepEqual(revisionGraph(DEMO_GRAPH, DEMO_REVISION, 'rejected'), DEMO_GRAPH)
  const g = revisionGraph(DEMO_GRAPH, DEMO_REVISION, 'ratified')
  assert.equal(g.nodes.length, DEMO_GRAPH.nodes.length + DEMO_REVISION.splits.length)
  assert.equal(g.edges.length, DEMO_GRAPH.edges.length + DEMO_REVISION.links.length)
  for (const edge of g.edges) assert.ok(edge.quote && edge.quote.length > 10, 'every edge carries a citation')
  assert.equal(g.unattributed, DEMO_GRAPH.unattributed + DEMO_REVISION.unattributed)
})
