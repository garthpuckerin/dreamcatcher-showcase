import { useEffect, useState } from 'react'
import { STATUSES, BRANDS } from './fixtures'

export const statusMap = Object.fromEntries(STATUSES.map(s => [s.value, s]))
export const brandMap = Object.fromEntries(BRANDS.map(b => [b.value, b]))

const PREF_KEY = 'fn:appearance:v1'
const DREAMS_KEY = 'fn:dreams:v2' // v2: the origin backlog dream joined the fixtures (Sep 2026)

const DEFAULT_APPEARANCE = {
  theme: 'paper',
  accent: 'violet',
  density: 'comfy',
  serif: true,
}

function normalizeAppearance(appearance) {
  const accent = ['cobalt', 'ocean'].includes(appearance.accent) ? 'sky' : appearance.accent
  return {
    ...appearance,
    theme: appearance.theme === 'cobalt' ? 'ocean' : appearance.theme,
    accent,
  }
}

export function useAppearanceSettings() {
  const [appearance, setAppearance] = useState(() => {
    try {
      if (typeof window === 'undefined') return DEFAULT_APPEARANCE
      const raw = window.localStorage.getItem(PREF_KEY)
      if (raw) return normalizeAppearance({ ...DEFAULT_APPEARANCE, ...JSON.parse(raw) })
    } catch {
      /* no-op */
    }
    return DEFAULT_APPEARANCE
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify(appearance))
    } catch {
      /* no-op */
    }
  }, [appearance])

  const update = patch => setAppearance(current => normalizeAppearance({ ...current, ...patch }))
  return [appearance, update]
}

export function useStoredDreams(initialDreams) {
  const [dreams, setDreams] = useState(() => {
    try {
      if (typeof window === 'undefined') return initialDreams
      const raw = window.localStorage.getItem(DREAMS_KEY)
      return raw ? JSON.parse(raw) : initialDreams
    } catch {
      return initialDreams
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(DREAMS_KEY, JSON.stringify(dreams))
    } catch {
      /* no-op */
    }
  }, [dreams])

  return [dreams, setDreams]
}

export function fmtRel(iso) {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.round((now - d) / 1000)
  const abs = Math.abs(diff)
  if (abs < 60) return diff < 0 ? 'in a moment' : 'just now'
  if (abs < 3600) {
    const m = Math.round(abs / 60)
    return diff < 0 ? `in ${m}m` : `${m}m ago`
  }
  if (abs < 86400) {
    const h = Math.round(abs / 3600)
    return diff < 0 ? `in ${h}h` : `${h}h ago`
  }
  const days = Math.round(abs / 86400)
  if (abs < 86400 * 30) return diff < 0 ? `in ${days}d` : `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function dueLabel(iso) {
  if (!iso) return null
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86400000)
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'due today'
  if (days === 1) return 'due tomorrow'
  if (days < 14) return `due in ${days}d`
  return `due ${fmtDate(iso)}`
}

export function dueTone(iso) {
  if (!iso) return 'text-muted'
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'text-danger'
  if (days <= 3) return 'text-warn'
  return 'text-muted'
}

export function progress(dream) {
  const total = dream.todos?.length ?? 0
  if (!total) return 0
  const done = dream.todos.filter(t => t.done).length
  return Math.round((done / total) * 100)
}
