// View-honesty gate — polish checklist §0b "hunt the class, not the instance":
// a hand-typed figure in a view component drifts from the derived value on the
// screen beside it. On 2026-09-12 this class was found in the Rail (badge
// counts 4 / 12 / 4 while the tab bar and Inbox page derived 6), the Today
// page (every stat delta and the streak), three Analytics KPIs and their
// deltas, the Insights list, and the AI Assistant's Insights tab. All of it
// now derives from src/field-notebook/insights.js; this test keeps it there.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const fn = rel => readFileSync(path.resolve(here, '..', 'src', 'field-notebook', rel), 'utf8')

const METRIC_VIEWS = ['views/Today.jsx', 'views/showcase/Analytics.jsx', 'Rail.jsx', 'DemoOverlays.jsx']

test('no view hands a KPI/stat component a literal delta or value with digits', () => {
  for (const rel of METRIC_VIEWS) {
    const src = fn(rel)
    const literalDelta = src.match(/\b(delta|value)="[^"]*\d[^"]*"/g) ?? []
    assert.deepEqual(literalDelta, [], `${rel}: literal metric prop(s) ${literalDelta.join(', ')}`)
  }
})

test('Rail badges are never literal numbers', () => {
  const src = fn('Rail.jsx')
  assert.doesNotMatch(src, /return \d+\s*$/m, 'Rail.jsx badgeFor returns a literal count')
  assert.doesNotMatch(src, /'\d+ frag · \d+d ago'/, 'Rail.jsx recent-dream meta is a literal string')
})

test('no "N days" / "N this week" / "N today" / "best: Nd" copy is typed into a metric view', () => {
  for (const rel of METRIC_VIEWS) {
    const src = fn(rel)
    // Only JSX text / string literals — a template literal built from a
    // derived value is fine (`${count} this week`).
    const typed = src.match(/(?<![$}])\b\d+(\.\d+)?(x|×)?\s+(days?|this week|today|pts|online now)\b|best:\s*\d+d/g) ?? []
    assert.deepEqual(typed, [], `${rel}: hand-typed figure(s) ${typed.join(' | ')}`)
  }
})

test('Analytics and the AI Assistant read the same insight list', () => {
  const analytics = fn('views/showcase/Analytics.jsx')
  const overlays = fn('DemoOverlays.jsx')
  assert.match(analytics, /deriveInsights\(/, 'Analytics.jsx does not call deriveInsights')
  assert.match(overlays, /deriveInsights\(/, 'DemoOverlays.jsx (AI Assistant) does not call deriveInsights')
})
