// Capture identity-clean preview media (screenshots + a paced walkthrough
// video) from the Dreamcatcher Field Notebook public demo. Self-contained to
// this repo (cloned from grant-tracker-showcase/scripts/capture-preview.mjs's
// own-repo-relative `mediaDir` pattern — this repo has no monorepo parent to
// reach into). Run with the dev server up on :3177:
//   npm run dev   (in another shell)
//   PREVIEW_URL=http://localhost:3177 node scripts/capture-dreamcatcher-preview.mjs
//
// The walkthrough is a deliberate tour using only known-good selectors with
// short, explicit pauses for pacing. Optional flourishes use fail-fast
// timeouts so a missing selector can never freeze the recording. Every step
// has an explicit timeout and the process exits non-zero on any failure.
//
// Steps: auth → Today → All Dreams → dream detail (Wiki) → Revisions →
// Graph (click an edge to reveal the citation panel) → Settings/Appearance
// theme-cycling → AI assistant.
import { chromium } from '@playwright/test'
import { mkdir, copyFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')
const mediaDir = path.resolve(repoRoot, 'media', 'dreamcatcher')
const videoDir = path.resolve(mediaDir, 'video-raw')
const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:3177'

const wait = ms => new Promise(r => setTimeout(r, ms))

// Poll the dev server until it serves, fail fast if it never comes up.
async function waitForServer(url, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs
  let lastErr
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' })
      if (res.ok) return
      lastErr = new Error(`status ${res.status}`)
    } catch (e) {
      lastErr = e
    }
    await wait(500)
  }
  throw new Error(`dev server not reachable at ${url} within ${timeoutMs}ms: ${lastErr?.message}`)
}

// Hard cap on the whole run so a stuck step can never hang CI/local forever.
function hardCap(ms) {
  return (
    setTimeout(() => {
      console.error(`FATAL: capture exceeded hard cap of ${ms}ms — aborting`)
      process.exit(1)
    }, ms).unref?.() ?? setTimeout(() => process.exit(1), ms)
  )
}

async function main() {
  hardCap(150000)
  await waitForServer(baseURL)

  await mkdir(mediaDir, { recursive: true })
  await mkdir(videoDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
    recordVideo: { dir: videoDir, size: { width: 1440, height: 1000 } },
  })
  context.setDefaultTimeout(8000) // hard cap: no step can hang the recording
  await context.addInitScript(() => {
    try {
      window.localStorage.removeItem('fn:session:v1')
      window.localStorage.removeItem('fn:route:v1')
      window.localStorage.setItem('fn:onboarding:v1', 'done')
    } catch {
      /* no-op */
    }
  })
  const page = await context.newPage()

  const shot = async name => {
    await page.screenshot({ path: path.join(mediaDir, name), fullPage: false })
    console.log('  captured', name)
  }

  // Optional flourish: never throws, short timeout so it can't freeze the video.
  const optional = async (label, fn) => {
    try {
      await fn()
    } catch (e) {
      console.log(`  ~ optional "${label}" skipped: ${e.message}`)
    }
  }

  // ── 1. Auth screen ────────────────────────────────────────────────────────
  await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 15000 })
  await page.locator('.auth-submit').waitFor({ timeout: 10000 })
  await wait(1400)
  await shot('field-notebook-auth.png')

  // ── 2. Enter workspace ───────────────────────────────────────────────────
  await page.locator('.auth-submit').click()
  await page.locator('.fn-shell').waitFor({ timeout: 10000 })
  await wait(700)
  await page.keyboard.press('Escape').catch(() => {})
  await wait(900)
  await shot('field-notebook-today.png')
  await optional('scroll today', async () => {
    await page.mouse.wheel(0, 400)
    await wait(900)
    await page.mouse.wheel(0, -400)
  })
  await wait(700)

  // Rail nav items concatenate a glyph + label + count badge into one
  // accessible name (e.g. "⌂All Dreams8"), so match by contained text
  // rather than an anchored accessible-name regex.
  const clickNav = label => page.locator('.fn-nav-item', { hasText: label }).first().click()

  // ── 3. All Dreams ────────────────────────────────────────────────────────
  await clickNav('All Dreams')
  await wait(1300)
  await shot('field-notebook-all-dreams.png')

  // ── 4. Open a dream → Wiki ───────────────────────────────────────────────
  await page.locator('.fn-dream-row, .fn-dream-card').first().click()
  await wait(1100)
  await page.locator('.fn-anchor', { hasText: 'Wiki' }).click()
  await wait(1200)
  await shot('field-notebook-wiki.png')
  await optional('scroll wiki', async () => {
    await page.mouse.wheel(0, 600)
    await wait(1100)
    await page.mouse.wheel(0, -600)
  })
  await wait(700)

  // ── 5. Revisions — the retro-tracing showcase ───────────────────────────
  await clickNav('Revisions')
  await wait(1200)
  await shot('field-notebook-revisions.png')
  await wait(700)

  // ── 6. Graph — click an edge to reveal the citation panel ───────────────
  await clickNav('Graph')
  await wait(1100)
  await optional('select a graph edge', async () => {
    // Keyboard activation, not a coordinate click: the edge is an SVG
    // <g role="button"> along a curved path whose bounding-box center often
    // falls off the actual stroke (see whiteglove-sweep.mjs for the same
    // note) — focus + Enter exercises the same handler reliably.
    const edge = page.locator('.graph-edge-group').first()
    await edge.focus({ timeout: 4000 })
    await page.keyboard.press('Enter')
    await wait(500)
  })
  await shot('field-notebook-graph.png')
  await wait(700)

  // ── 7. Settings → Appearance, with a live theme switch ──────────────────
  await clickNav('Settings')
  await wait(900)
  await page.locator('.settings-nav button', { hasText: 'Appearance' }).first().click()
  await wait(1100)
  await shot('field-notebook-settings-appearance.png')
  for (const theme of [/^Slate$/, /^Ink$/, /^Ocean$/, /^Paper$/]) {
    await optional(`theme ${theme}`, async () => {
      await page.getByRole('button', { name: theme }).first().click({ timeout: 2000 })
      await wait(900)
    })
  }
  await wait(700)

  // ── 8. AI assistant panel ────────────────────────────────────────────────
  await optional('assistant', async () => {
    await page.getByRole('button', { name: /Assistant/ }).first().click({ timeout: 2500 })
    await wait(1400)
    await shot('field-notebook-assistant.png')
    await page.keyboard.press('Escape').catch(() => {})
    await wait(600)
  })

  const video = page.video()
  await context.close()
  if (video) {
    await copyFile(await video.path(), path.join(mediaDir, 'field-notebook-walkthrough.webm'))
    console.log('  captured field-notebook-walkthrough.webm')
  }
  await rm(videoDir, { recursive: true, force: true })
  await browser.close()
  console.log('done →', mediaDir)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
