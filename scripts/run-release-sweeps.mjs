import { spawn as spawnProcess } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { preview as vitePreview } from 'vite'

const HOST = '127.0.0.1'
const PREFERRED_PORT = 3310
const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url))
const SWEEP_SCRIPTS = [
  fileURLToPath(new URL('./mobile-sweep.mjs', import.meta.url)),
  fileURLToPath(new URL('./viewport-sweep.mjs', import.meta.url)),
  fileURLToPath(new URL('./whiteglove-sweep.mjs', import.meta.url)),
]

function runSweep(script, baseUrl, spawn) {
  return new Promise((resolveSweep, rejectSweep) => {
    const child = spawn(process.execPath, [script], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, BASE_URL: baseUrl },
      stdio: 'inherit',
      shell: false,
      windowsHide: true,
    })

    child.once('error', rejectSweep)
    child.once('exit', (exitCode, signal) => {
      if (exitCode === 0 && signal === null) {
        resolveSweep()
        return
      }

      const outcome = signal ? `signal ${signal}` : `exit code ${exitCode}`
      const error = new Error(`${script} failed with ${outcome}`)
      error.exitCode = exitCode
      error.signal = signal
      rejectSweep(error)
    })
  })
}

// The sweeps validate the LOCALLY BUILT candidate, never the deployed site:
// the runner always passes its own preview URL as BASE_URL. It prefers the
// fixed port so logs read the same run to run, but a busy 3310 (a leaked
// preview from an interrupted earlier run held it for hours on 2026-09-12
// and blocked every gate) must not block the gate — any free loopback port
// still satisfies the "local candidate only" rule.
async function startPreview(preview) {
  try {
    return await preview({
      root: PROJECT_ROOT,
      preview: { host: HOST, port: PREFERRED_PORT, strictPort: true },
    })
  } catch (error) {
    if (!/already in use/i.test(String(error?.message))) throw error
    console.warn(
      `Port ${PREFERRED_PORT} is already in use (a leaked preview server?) — using the next free loopback port instead.`
    )
    return preview({
      root: PROJECT_ROOT,
      preview: { host: HOST, port: PREFERRED_PORT, strictPort: false },
    })
  }
}

function previewBaseUrl(server) {
  const local = server.resolvedUrls?.local?.[0]
  if (local) return local.replace(/\/$/, '')
  const address = server.httpServer?.address()
  if (address && typeof address === 'object') return `http://${HOST}:${address.port}`
  throw new Error('Preview server started but reported no address')
}

export async function runReleaseSweeps({
  preview = vitePreview,
  spawn = spawnProcess,
} = {}) {
  const server = await startPreview(preview)
  const baseUrl = previewBaseUrl(server)
  const stopOnSignal = () => {
    server.close().finally(() => process.exit(130))
  }
  process.once('SIGINT', stopOnSignal)
  process.once('SIGTERM', stopOnSignal)

  let sweepError
  try {
    for (const script of SWEEP_SCRIPTS) {
      await runSweep(script, baseUrl, spawn)
    }
  } catch (error) {
    sweepError = error
  }

  process.off('SIGINT', stopOnSignal)
  process.off('SIGTERM', stopOnSignal)
  try {
    await server.close()
  } catch (cleanupError) {
    if (sweepError === undefined) throw cleanupError
    sweepError.cleanupError = cleanupError
  }

  if (sweepError !== undefined) throw sweepError
}

const isCli =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isCli) {
  runReleaseSweeps().catch((error) => {
    console.error(error.message)
    process.exitCode = Number.isInteger(error.exitCode) ? error.exitCode : 1
  })
}
