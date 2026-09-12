/* White-glove sweep — walks EVERY Dreamcatcher screen: every Workspace/Brand/
 * Tools destination discovered from the Rail itself (`.fn-nav-item`, shared
 * across all three Rail sections), all 8 dream detail pages (a single
 * scrolling page per dream — wiki, todos, fragments, documents, versions,
 * retro, collaborators, timeline all render at once, no tab-gating), every
 * Settings section, the Case Study Composer, both Revisions decisions, one
 * Graph edge's citation panel, and the floating overlays (Command Palette, AI
 * Assistant, Appearance panel, New Dream/New Fragment modals, Fragment
 * Reader, AI-chat Replay). Reports two defect classes:
 *
 *  1. Text defects: NaN, $NaN, Invalid Date, undefined/[object Object]
 *     leaking into rendered copy, or a negative day/duration count.
 *  2. Clickability: elements carrying a hover/row/nav affordance class
 *     ([role="button"], .fn-dream-row, .fn-dream-card, .fn-frag-card,
 *     .fn-nav-item, .fn-chip, .fn-recent-item, .fn-anchor, .fn-palette-item,
 *     .fn-doc-drop, .graph-edge-group, .settings-nav button, .fn-segment
 *     button) whose computed cursor is not pointer — surfaces that LOOK
 *     interactive but aren't wired.
 *
 *   BASE_URL=https://… node scripts/whiteglove-sweep.mjs   (defaults to live)
 */
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://garthpuckerin-dreamcatcher.vercel.app'

const TEXT_DEFECTS = [
  ['negative day/duration count', /(?<![\w.$%-])-\d+\s?d\b/],
  ['NaN', /(?<![a-zA-Z])NaN\b/],
  ['dollar NaN', /\$NaN/],
  ['Invalid Date', /Invalid Date/],
  ['undefined', /\bundefined\b/],
  ['object Object', /\[object Object\]/],
]

// Affordance audit: the app's "this thing reacts" vocabulary. Anything
// matching one of these must carry a pointer cursor.
const AFFORDANCE_SELECTOR = [
  '[role="button"]',
  '.fn-dream-row',
  '.fn-dream-card',
  '.fn-frag-card',
  '.fn-nav-item',
  '.fn-chip',
  '.fn-recent-item',
  '.fn-anchor',
  '.fn-palette-item',
  '.fn-doc-drop',
  '.graph-edge-group',
  '.settings-nav button',
  '.fn-segment button',
].join(', ')

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.addInitScript(() => {
  try {
    window.localStorage.setItem('fn:session:v1', 'active')
    window.localStorage.setItem('fn:onboarding:v1', 'done')
  } catch {
    /* no-op */
  }
})

const issues = []
const note = (screen, what) => issues.push(`${screen}: ${what}`)

const settle = async () => {
  await page.waitForSelector('.fn-shell', { timeout: 10000 })
  // Builder Notes is lazy-loaded (React.lazy); its Suspense fallback carries
  // the literal text "Loading Builder Notes..." — never scan mid-fallback.
  await page
    .waitForFunction(() => !document.body.innerText.includes('Loading Builder Notes'), {
      timeout: 10000,
    })
    .catch(() => {})
  await page.waitForTimeout(300)
}

const scan = async screen => {
  const { text, inert } = await page.evaluate(sel => {
    const text = document.body.innerText
    const inert = [...document.querySelectorAll(sel)]
      .filter(el => {
        const cs = getComputedStyle(el)
        return (
          cs.cursor !== 'pointer' &&
          !el.disabled &&
          el.getAttribute('aria-disabled') !== 'true'
        )
      })
      .map(
        el =>
          `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.textContent || '')
            .trim()
            .slice(0, 40)}"`
      )
    return { text, inert }
  }, AFFORDANCE_SELECTOR)
  for (const [label, re] of TEXT_DEFECTS) {
    const m = text.match(re)
    if (m) {
      const at = text.indexOf(m[0])
      note(
        screen,
        `${label} → "…${text.slice(Math.max(0, at - 40), at + 30).replace(/\n/g, ' ⏎ ')}…"`
      )
    }
  }
  for (const el of [...new Set(inert)]) note(screen, `looks clickable but isn't: ${el}`)
}

const go = async route => {
  await page.addInitScript(r => {
    try {
      window.localStorage.setItem('fn:route:v1', JSON.stringify(r))
    } catch {
      /* no-op */
    }
  }, route)
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await settle()
}

const escape = async () => {
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(200)
}

// 1. Every Rail destination, discovered from the shell itself — Workspace,
// Brands, and Tools all share the `.fn-nav-item` class, so one loop covers
// Today/All Dreams/Inbox/AI Suggestions/Archive, All brands + 5 brand
// filters, and Builder Notes/Analytics/Portfolio/Templates/
// Integrations/Revisions/Graph/Settings.
await go({ kind: 'today' })
const navLabels = await page.evaluate(() =>
  [...document.querySelectorAll('.fn-nav-item')].map(el => (el.textContent || '').replace(/\d+$/, '').trim())
)
for (const label of navLabels) {
  await page.locator('.fn-nav-item').filter({ hasText: label }).first().click()
  await settle()
  await scan(`nav:${label}`)
}

// 2. Every Settings section (they are div-swapped, not route-gated).
await go({ kind: 'settings' })
const settingsTabs = await page.evaluate(() =>
  [...document.querySelectorAll('.settings-nav button')].map(b => b.textContent.trim())
)
for (const tab of settingsTabs) {
  await page.locator('.settings-nav button', { hasText: tab }).first().click()
  await page.waitForTimeout(250)
  await scan(`settings:${tab}`)
}
// Appearance panel (floating), opened from the Appearance tab.
await page.locator('.settings-nav button', { hasText: 'Appearance' }).first().click()
await page.waitForTimeout(200)
const appearanceOpened = await page
  .getByRole('button', { name: /^Open Appearance$/ })
  .click({ timeout: 4000 })
  .then(() => true)
  .catch(() => false)
if (appearanceOpened) {
  await page.waitForTimeout(300)
  await scan('overlay:appearance-panel')
  await escape()
} else note('overlay:appearance-panel', 'trigger "Open Appearance" not reachable')

// 3. Every dream detail page (single scrolling page — every section renders
// at once, so one scan per dream covers wiki/todos/fragments/documents/
// versions/retro/collaborators/timeline).
for (let id = 1; id <= 8; id++) {
  await go({ kind: 'dream', id })
  await scan(`dream:${id}`)
}

// 4. Fragment Reader + New Fragment modal, from dream 1 (has fragments).
await go({ kind: 'dream', id: 1 })
const fragCard = page.locator('.fn-frag-card').first()
if (await fragCard.count()) {
  await fragCard.click()
  await page.waitForTimeout(300)
  await scan('overlay:fragment-reader')
  await escape()
} else note('overlay:fragment-reader', '.fn-frag-card not found on dream:1')

const newFragmentOpened = await page
  .getByRole('button', { name: /Fragment/ })
  .first()
  .click({ timeout: 4000 })
  .then(() => true)
  .catch(() => false)
if (newFragmentOpened) {
  await page.waitForTimeout(250)
  await scan('overlay:new-fragment-modal')
  await escape()
}

// 5. New Dream modal (topbar action, visible off the dream route).
await go({ kind: 'all' })
const newDreamOpened = await page
  .getByRole('button', { name: /New Dream/ })
  .first()
  .click({ timeout: 4000 })
  .then(() => true)
  .catch(() => false)
if (newDreamOpened) {
  await page.waitForTimeout(250)
  await scan('overlay:new-dream-modal')
  await escape()
} else note('overlay:new-dream-modal', '"New Dream" trigger not reachable')

// 6. AI Assistant panel and Command Palette (both reachable from the topbar
// on every non-dream route).
const aiOpened = await page
  .getByRole('button', { name: /Assistant/ })
  .first()
  .click({ timeout: 4000 })
  .then(() => true)
  .catch(() => false)
if (aiOpened) {
  await page.waitForTimeout(300)
  await scan('overlay:ai-assistant')
  await escape()
} else note('overlay:ai-assistant', '"Assistant" trigger not reachable')

const paletteOpened = await page
  .locator('.fn-search')
  .first()
  .click({ timeout: 4000 })
  .then(() => true)
  .catch(() => false)
if (paletteOpened) {
  await page.waitForTimeout(300)
  await scan('overlay:command-palette')
  await escape()
} else note('overlay:command-palette', '.fn-search trigger not reachable')

// 7. Inbox → "Capture from AI chat" replay modal.
await go({ kind: 'inbox' })
const replayOpened = await page
  .getByRole('button', { name: /Capture from AI chat/ })
  .first()
  .click({ timeout: 4000 })
  .then(() => true)
  .catch(() => false)
if (replayOpened) {
  await page.waitForTimeout(400)
  await scan('overlay:ai-chat-replay')
  await escape()
} else note('overlay:ai-chat-replay', '"Capture from AI chat" trigger not reachable')

// 8. Case Study Composer — dream 7 (Northwind) is completed and already has a
// published Portfolio entry.
await go({ kind: 'case', id: 7 })
await scan('case-study-composer:7')

// 9. Graph — scan the empty state, then click the first edge to reveal the
// citation panel and scan again.
await go({ kind: 'graph' })
await scan('graph:empty-selection')
const firstEdge = page.locator('.graph-edge-group').first()
if (await firstEdge.count()) {
  // Activate via keyboard (focus + Enter), not a mouse click: the edge is an
  // SVG <g role="button"> along a curved path whose bounding-box CENTER
  // often falls off the actual stroke, so a coordinate click intermittently
  // hits the containing <svg> instead and fails Playwright's actionability
  // check. Keyboard activation exercises the same onEdgeKeyDown handler the
  // component ships for accessibility and sidesteps the geometry entirely.
  await firstEdge.focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(250)
  await scan('graph:edge-selected')
} else note('graph:edge-selected', '.graph-edge-group not found')

// 10. Revisions — both decision branches, each from a fresh load (the
// ratify/reject buttons are replaced by a decided state after one click).
await go({ kind: 'revisions' })
await scan('revisions:undecided')
const ratifyClicked = await page
  .getByRole('button', { name: /^Ratify split$/ })
  .click({ timeout: 4000 })
  .then(() => true)
  .catch(() => false)
if (ratifyClicked) {
  await page.waitForTimeout(200)
  await scan('revisions:ratified')
} else note('revisions:ratified', '"Ratify split" trigger not reachable')

await go({ kind: 'revisions' })
const rejectClicked = await page
  .getByRole('button', { name: /^Reject$/ })
  .click({ timeout: 4000 })
  .then(() => true)
  .catch(() => false)
if (rejectClicked) {
  await page.waitForTimeout(200)
  await scan('revisions:rejected')
} else note('revisions:rejected', '"Reject" trigger not reachable')

await browser.close()
console.log('')
if (issues.length === 0) console.log('✓ white-glove sweep clean')
else {
  console.log(`${issues.length} issue(s):`)
  issues.forEach(i => console.log('  ✗ ' + i))
  process.exitCode = 1
}
