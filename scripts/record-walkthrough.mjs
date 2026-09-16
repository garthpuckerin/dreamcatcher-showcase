// Silent walkthrough of the demo for the case study — a real screen
// recording of the deployed cockpit on fixture data (no rendering tricks):
// capture from an AI chat → a cited suggestion → ratify the retro-trace
// split → the Graph gains cited edges → the phone companion.
//
//   WALK_URL=https://garthpuckerin-dreamcatcher.vercel.app node scripts/record-walkthrough.mjs
//   (default: serves dist/ itself)   OUT_DIR=… to choose where the files land
//
// Output: <OUT_DIR>/dreamcatcher-walkthrough.{webm,mp4,jpg}. Desktop is
// recorded at 1920×1080 with the page zoomed to 4/3 (a 1440-wide layout
// filling the frame — Playwright does not scale video); the phone segment is
// recorded at 390×844 and letterboxed into the same 1920×1080 canvas by
// ffmpeg, then the two are concatenated. A caption band is injected into the
// page per step so a silent viewer knows what they are watching.
import { chromium } from '@playwright/test'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')
const outDir = path.resolve(process.env.OUT_DIR || path.join(repoRoot, 'media', 'dreamcatcher', 'walkthrough'))
const raw = path.join(outDir, 'raw')
rmSync(raw, { recursive: true, force: true })
mkdirSync(raw, { recursive: true })

let server = null
let base = process.env.WALK_URL?.replace(/\/$/, '')
if (!base) {
  server = await preview({ root: repoRoot, preview: { host: '127.0.0.1', port: 0 } })
  base = server.resolvedUrls.local[0].replace(/\/$/, '')
}

const SIZE = { width: 1920, height: 1080 }
const wait = ms => new Promise(r => setTimeout(r, ms))

const seed = async page => {
  // Runs on every navigation — reset the workspace ONCE per tab, so the
  // ratified split survives the reload into the Graph step.
  await page.addInitScript(() => {
    try {
      if (sessionStorage.getItem('walk:seeded')) return
      sessionStorage.setItem('walk:seeded', '1')
      localStorage.setItem('fn:onboarding:v1', 'done')
      localStorage.removeItem('fn:revision:v1')
      localStorage.removeItem('fn:dreams:v2')
      localStorage.removeItem('fn:route:v1')
      localStorage.removeItem('fn:appearance:v1')
    } catch {}
  })
}

// Caption band — plain DOM, injected per step (the demo has no CSP).
const caption = async (page, text) => {
  await page.evaluate(t => {
    let el = document.getElementById('walk-caption')
    if (!el) {
      el = document.createElement('div')
      el.id = 'walk-caption'
      Object.assign(el.style, {
        position: 'fixed', left: '24px', bottom: '24px', zIndex: 9999, padding: '10px 16px',
        borderRadius: '8px', background: 'rgba(28,25,23,0.88)', color: '#f6f3ef',
        font: '500 15px/1.4 "IBM Plex Sans", system-ui, sans-serif', letterSpacing: '0.01em',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)', maxWidth: '46ch', pointerEvents: 'none',
      })
      document.body.appendChild(el)
    }
    el.textContent = t
  }, text)
}

const route = async (page, r) => {
  // Seed via an init script so it lands before the app's own route
  // persistence runs on the new load (a plain set before reload races it).
  await page.addInitScript(x => localStorage.setItem('fn:route:v1', JSON.stringify(x)), r)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.fn-shell')
  await page.evaluate(() => { document.documentElement.style.zoom = '1.3333' })
}

// ── Segment A: desktop ────────────────────────────────────────────────────
const browser = await chromium.launch()
{
  const ctx = await browser.newContext({ viewport: SIZE, deviceScaleFactor: 1, recordVideo: { dir: raw, size: SIZE } })
  const page = await ctx.newPage()
  await seed(page)
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  await page.evaluate(() => { document.documentElement.style.zoom = '1.3333' })
  await caption(page, 'Dreamcatcher — the cockpit, on fixture data. Screen recording, not rendered.')
  await wait(1800)
  await page.getByRole('button', { name: /Skip - explore the demo workspace/ }).click()
  await page.waitForSelector('.fn-shell')
  await page.evaluate(() => { document.documentElement.style.zoom = '1.3333' })
  await caption(page, 'Today: priorities and pulse — every figure derived from one event log.')
  await wait(2600)

  // Capture from an AI chat
  await route(page, { kind: 'inbox' })
  await caption(page, 'Inbox: captures waiting to be filed. Replay a capture session.')
  await wait(1600)
  await page.getByRole('button', { name: /Capture from AI chat/ }).first().click()
  await page.waitForSelector('.fn-replay-pick')
  await wait(1200)
  await page.locator('.fn-replay-pick').first().click()
  await wait(800)
  await caption(page, 'A scripted AI conversation replays; the parts worth keeping become fragments.')
  const play = page.getByRole('button', { name: /^Play/ }).first()
  if (await play.count()) await play.click()
  await wait(6500)
  const skip = page.getByRole('button', { name: /Skip/ }).first()
  if (await skip.count()) await skip.click().catch(() => {})
  await wait(900)
  const checks = page.locator('.fn-replay-excerpt')
  const n = await checks.count()
  for (let i = 0; i < Math.min(n, 3); i += 1) { await checks.nth(i).click(); await wait(350) }
  await caption(page, 'File the selected fragments into a dream — one click, never leave the conversation.')
  await wait(900)
  const capture = page.getByRole('button', { name: /^Capture/ }).first()
  if (await capture.count()) await capture.click()
  await wait(2400)

  // Suggestions
  await route(page, { kind: 'suggest' })
  await caption(page, 'Suggestions cite the fragments they pattern on — no confidence score, anywhere.')
  await wait(3000)

  // Revisions — ratify
  await route(page, { kind: 'revisions' })
  await caption(page, 'Revisions: a retro-trace proposes splitting a conflated dream — anchored to artifacts, every link quoted.')
  await wait(2600)
  await page.getByRole('button', { name: /^Ratify split$/ }).scrollIntoViewIfNeeded()
  await wait(1500)
  await caption(page, 'A human ratifies. The split applies: four dreams created, the origin archived — recorded and reversible.')
  await page.getByRole('button', { name: /^Ratify split$/ }).click()
  await wait(2800)

  // Graph — edges
  await route(page, { kind: 'graph' })
  await caption(page, 'Graph: every edge is a citation. The ratified split just added its quoted links.')
  await wait(1500)
  const edges = page.locator('.graph-edge-group')
  const count = await edges.count()
  await edges.nth(Math.max(0, count - 3)).focus()
  await page.keyboard.press('Enter')
  await wait(2600)
  await edges.nth(0).focus()
  await page.keyboard.press('Enter')
  await wait(2400)
  await page.screenshot({ path: path.join(outDir, 'poster-src.png') })
  await caption(page, 'Cited, not scored.')
  await wait(1200)
  await ctx.close()
}

// ── Segment B: phone companion ────────────────────────────────────────────
{
  const PHONE = { width: 390, height: 844 }
  const ctx = await browser.newContext({ viewport: PHONE, isMobile: true, hasTouch: true, deviceScaleFactor: 1, recordVideo: { dir: raw, size: PHONE } })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('fn:session:v1', 'active')
      localStorage.setItem('fn:onboarding:v1', 'done')
      localStorage.setItem('fn:route:v1', JSON.stringify({ kind: 'today' }))
    } catch {}
  })
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  await page.waitForSelector('.fn-mtab')
  await wait(1800)
  await page.locator('.fn-mtab-item', { hasText: 'Dreams' }).click()
  await wait(1800)
  await page.locator('.fn-mtab-item', { hasText: 'Inbox' }).click()
  await wait(1500)
  await page.locator('.fn-mtab-item', { hasText: 'More' }).click()
  await wait(1300)
  // End on Revisions — a companion surface that is fully usable on the phone.
  await page.locator('.fn-more-item', { hasText: 'Revisions' }).click()
  await wait(2600)
  await ctx.close()
}
await browser.close()
if (server) await server.close()

// ── Stitch ────────────────────────────────────────────────────────────────
const vids = readdirSync(raw).filter(f => f.endsWith('.webm')).map(f => path.join(raw, f))
  .sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs)
if (vids.length !== 2) throw new Error(`expected 2 raw videos, found ${vids.length}`)
const [desk, phone] = vids
renameSync(desk, path.join(raw, 'desk.webm'))
renameSync(phone, path.join(raw, 'phone.webm'))
const ff = (args, label) => {
  const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' })
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${label}`)
}
// Both segments re-encoded to identical parameters (1920×1080, 30 fps,
// yuv420p, square pixels, H.264) so the concat demuxer can join them; the
// phone segment is letterboxed onto the paper background.
const enc = ['-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-an']
ff(['-i', path.join(raw, 'phone.webm'), '-vf', 'scale=-2:1080,pad=1920:1080:(ow-iw)/2:0:color=0xf6f3ef,setsar=1,fps=30', ...enc, path.join(raw, 'phone-1080.mp4')], 'phone pad')
ff(['-i', path.join(raw, 'desk.webm'), '-vf', 'scale=1920:1080,setsar=1,fps=30', ...enc, path.join(raw, 'desk-1080.mp4')], 'desk')
writeFileSync(path.join(raw, 'list.txt'), ['desk-1080.mp4', 'phone-1080.mp4'].map(n => `file '${n}'`).join(String.fromCharCode(10)) + String.fromCharCode(10))
ff(['-f', 'concat', '-safe', '0', '-i', path.join(raw, 'list.txt'), '-c', 'copy', '-movflags', '+faststart', path.join(outDir, 'dreamcatcher-walkthrough.mp4')], 'mp4')
ff(['-i', path.join(outDir, 'dreamcatcher-walkthrough.mp4'), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-an', path.join(outDir, 'dreamcatcher-walkthrough.webm')], 'webm')
ff(['-i', path.join(outDir, 'poster-src.png'), '-q:v', '3', path.join(outDir, 'dreamcatcher-walkthrough.jpg')], 'poster')
const dur = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(outDir, 'dreamcatcher-walkthrough.mp4')], { encoding: 'utf8' }).stdout.trim()
console.log(`✓ walkthrough ${Number(dur).toFixed(1)}s → ${outDir}`)
