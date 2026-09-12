// Data-coherence unit gate — proves the anchor-relative date engine
// (`src/field-notebook/dates.js`) genuinely derives "today" from the runtime
// clock at evaluation time, and that no raw absolute-date literal has leaked
// into a rendered/prose path outside the two files that are allowed to hold
// them (fixtures.js, the fixture data; dates.js, the engine itself).
//
// Modeled on the house `node --test` style used by
// grant-tracker-showcase/tests/release-contract.test.mjs and
// release-runner.test.mjs: read the real source, assert against it directly
// — never a fake standing in for behavior the real dependency couldn't
// produce (see the repo's Test Honesty rule).
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const DATES_PATH = path.join(REPO_ROOT, 'src', 'field-notebook', 'dates.js')
const SRC_ROOT = path.join(REPO_ROOT, 'src')

// Files allowed to hold a raw anchor-relative literal: the fixture data
// (every literal there is piped through `iso()` → `shiftIso()`) and the
// engine that defines the anchor itself.
const EXCLUDED_FILES = new Set([
  path.join(REPO_ROOT, 'src', 'field-notebook', 'fixtures.js'),
  DATES_PATH,
])

// Wrapper calls that re-base a literal onto "today" — a literal immediately
// preceded by one of these is legitimate input, not a leak.
const REBASE_WRAPPERS = ['shiftIso(', 'shiftDate(', 'offsetFromAnchor(', 'iso(']

const DATE_LITERAL = /20[2-9][0-9]-[01][0-9]-[0-3][0-9]/g

function walkSourceFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walkSourceFiles(full, out)
    else if (/\.(js|jsx)$/.test(entry)) out.push(full)
  }
  return out
}

// Load dates.js in an isolated vm context with a fake `Date` whose
// zero-argument constructor and `.now()` resolve to `fixedNowMs`. This
// re-derives the module's runtime behavior directly rather than eyeballing
// the source — the same "derive the structure, don't guess" approach the
// Systematic Diagnosis standard asks for. `export const`/`export function`
// are rewritten to `var`/`function` declarations so the vm context's global
// object actually exposes them after the script runs (top-level `const`
// bindings in a vm Script are NOT reflected as own properties of the
// context global, unlike `var` and function declarations).
function loadDatesModuleWithClock(fixedNowMs) {
  const source = readFileSync(DATES_PATH, 'utf8')
  const transformed = source
    .replace(/export const /g, 'var ')
    .replace(/export function /g, 'function ')

  class FakeDate extends Date {
    constructor(...args) {
      if (args.length === 0) super(fixedNowMs)
      else super(...args)
    }
    static now() {
      return fixedNowMs
    }
  }

  const sandbox = { Date: FakeDate, Math, console }
  vm.createContext(sandbox)
  vm.runInContext(transformed, sandbox, { filename: DATES_PATH })
  return sandbox
}

test('TODAY is computed from a zero-argument `new Date()` call, not a baked literal', () => {
  const source = readFileSync(DATES_PATH, 'utf8')
  assert.match(
    source,
    /export const TODAY = startOfDay\(new Date\(\)\)/,
    'TODAY must be derived from `new Date()` with no arguments — a literal date argument here would freeze the demo the same way the anchor is documented NOT to be'
  )
});

test('shiftIso re-bases off the runtime clock at evaluation time, not a build-time constant', () => {
  const dayMs = 86_400_000
  // Local-time component constructor (not Date.UTC): startOfDay() reads
  // local hours/date, so the injected clock must land at local noon to be
  // unambiguously "that calendar day" regardless of the host's timezone.
  const nowA = new Date(2026, 8, 11, 12, 0, 0).getTime() // an arbitrary "now"
  const nowB = nowA + 10 * dayMs // ten days later

  const modA = loadDatesModuleWithClock(nowA)
  const modB = loadDatesModuleWithClock(nowB)

  assert.notEqual(
    modA.TODAY_ISO,
    modB.TODAY_ISO,
    'TODAY_ISO must track whatever clock the module is evaluated under, not a fixed value'
  )
  const diffDays = Math.round((new Date(modB.TODAY_ISO) - new Date(modA.TODAY_ISO)) / dayMs)
  assert.equal(diffDays, 10, 'TODAY must move by exactly the injected clock delta')

  // The anchor always re-bases onto whichever "today" the runtime clock
  // reports — this is the whole point of the mechanism: the dataset slides
  // by one constant offset (today − anchor), so the anchor's shifted date
  // must equal today's date under BOTH injected clocks. Use a time-qualified
  // literal (`T00:00:00`) rather than the bare `ANCHOR_ISO` string here: this
  // test isolates clock-derivation, not the separate (and separately real —
  // see docs note below) bare-date parsing behavior of `offsetFromAnchor`.
  const anchorAtMidnight = `${modA.ANCHOR_ISO}T00:00:00`
  assert.equal(modA.shiftDate(anchorAtMidnight), modA.TODAY_ISO)
  assert.equal(modB.shiftDate(anchorAtMidnight), modB.TODAY_ISO)
})

// Regression test for a real defect found while writing this gate (2026-09-11,
// fixed 2026-09-12): `offsetFromAnchor`/`shiftIso` used to parse `value` with
// a bare `new Date(value)`, which the spec treats as UTC when `value` has no
// time component (e.g. fixtures.js's many `iso('2026-05-25')` bare-date
// literals), while `ANCHOR` itself is built from an explicit `T00:00:00`
// local-time literal. In any negative-UTC-offset timezone (confirmed at
// UTC-4), that mismatch silently shifted every bare-date fixture one calendar
// day earlier than a time-qualified fixture in the same dream — no NaN/
// Invalid Date, so the whiteglove text-defect sweep couldn't catch it either.
// `parseLocal()` now normalizes both forms to local-time parsing before this
// is asserted against, regardless of which timezone the test runner is in.
test('bare-date and time-qualified fixture literals resolve to the same offset (regression: negative-UTC-offset day-shift)', () => {
  const dates = loadDatesModuleWithClock(new Date(2026, 8, 11, 12, 0, 0).getTime())
  const bareDateOffset = dates.offsetFromAnchor(dates.ANCHOR_ISO)
  const timeQualifiedOffset = dates.offsetFromAnchor(`${dates.ANCHOR_ISO}T00:00:00`)
  assert.equal(
    bareDateOffset,
    timeQualifiedOffset,
    'a bare-date literal must resolve to the same anchor offset as its time-qualified equivalent, in every timezone'
  )

  // Same property, asserted through the public shiftIso/shiftDate path a
  // fixture actually uses, not just the internal offset calculation.
  assert.equal(
    dates.shiftDate(dates.ANCHOR_ISO),
    dates.shiftDate(`${dates.ANCHOR_ISO}T00:00:00`),
    'shiftDate must land on the same calendar day for a bare-date literal and its time-qualified equivalent'
  )
})

test('no raw absolute-date literal leaks into a rendered/prose path outside fixtures.js/dates.js', () => {
  const offenders = []
  for (const file of walkSourceFiles(SRC_ROOT)) {
    if (EXCLUDED_FILES.has(file)) continue
    const content = readFileSync(file, 'utf8')
    DATE_LITERAL.lastIndex = 0
    let match
    while ((match = DATE_LITERAL.exec(content))) {
      const before = content.slice(Math.max(0, match.index - 24), match.index)
      const guarded = REBASE_WRAPPERS.some(
        wrapper => before.endsWith(`${wrapper}'`) || before.endsWith(`${wrapper}"`)
      )
      if (!guarded) {
        const line = content.slice(0, match.index).split('\n').length
        offenders.push(`${path.relative(REPO_ROOT, file)}:${line} → "${match[0]}" (not wrapped in ${REBASE_WRAPPERS.join('/')})`)
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `raw absolute-date literal(s) found outside fixtures.js/dates.js:\n${offenders.join('\n')}`
  )
})
