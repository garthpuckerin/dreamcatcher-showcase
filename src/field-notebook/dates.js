/* Dreamcatcher Field Notebook — relative-date engine.
 *
 * Everything in the demo is anchored on the REAL "today" at module-eval time,
 * so fragments, dream timelines, analytics windows, and "Xd ago" labels always
 * read fresh whenever the demo is opened. Every fixture date is expressed as a
 * fixed OFFSET (in whole days) from the original frozen anchor, then re-based
 * onto today via `shiftIso`. Because the whole dataset slides by ONE constant
 * offset (today − oldAnchor), all internal relationships are preserved: a
 * fragment that was "7d ago" stays 7d ago, the newest dream stays current, the
 * analytics trailing weeks end on the current week, dream-update recency holds.
 *
 * Deterministic: TODAY is computed once, from the system date. No Math.random,
 * no external deps.
 */

const MS_PER_DAY = 86_400_000

/** Midnight (local) of the supplied date — strips the time component. */
export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** The real "today", frozen at module evaluation. */
export const TODAY = startOfDay(new Date())

/** A Date exactly `n` whole days from TODAY (n may be negative). */
export function daysFromToday(n) {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + n)
  return d
}

/** 'YYYY-MM-DD' for a Date (local). */
export function iso(date) {
  const d = startOfDay(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Shorthand: ISO date string for an offset from today. */
export function isoFromToday(n) {
  return iso(daysFromToday(n))
}

/* ---- The migration anchor ---------------------------------------------- *
 * The original fixtures were frozen against this date — it is the "now" the
 * analytics 8-week trend window, the heatmap, and the "Xd ago" labels all used
 * to be computed against. To re-express any legacy date as a today-relative
 * offset:  offsetFromAnchor('2026-05-15') === -7  →  daysFromToday(-7).
 */
export const ANCHOR_ISO = '2026-05-22'
const ANCHOR = startOfDay(new Date(ANCHOR_ISO + 'T00:00:00'))

/** Whole-day offset of a legacy date (ISO or datetime) relative to the anchor. */
export function offsetFromAnchor(value) {
  const d = startOfDay(new Date(value))
  return Math.round((d - ANCHOR) / MS_PER_DAY)
}

/**
 * Re-base a legacy fixture date onto today: returns an ISO datetime string
 * shifted by (today − anchor) while preserving the original clock time. The
 * whole dataset passed through this slides by one constant offset.
 */
export function shiftIso(value) {
  const original = new Date(value)
  const offsetDays = offsetFromAnchor(value)
  const shifted = daysFromToday(offsetDays)
  shifted.setHours(
    original.getHours(),
    original.getMinutes(),
    original.getSeconds(),
    original.getMilliseconds()
  )
  return shifted.toISOString()
}

/** Re-base a legacy date and return just the 'YYYY-MM-DD' calendar day. */
export function shiftDate(value) {
  return iso(new Date(shiftIso(value)))
}

/* ---- Display formatters (match the field-notebook's display strings) ----- */

/** "11 Oct 2025" — day, short month, year (the fragment-source format). */
export function fmtDayMonYear(date) {
  const d = startOfDay(date)
  const day = String(d.getDate()).padStart(2, '0')
  const mon = d.toLocaleDateString('en-US', { month: 'short' })
  return `${day} ${mon} ${d.getFullYear()}`
}

/** "Oct 11, 2025" — short month, day, year (fmtDate display). */
export function fmtMedium(date) {
  return startOfDay(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** "May 22" — short month + day (week-bucket / heatmap labels). */
export function fmtMonthDay(date) {
  return startOfDay(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** "14 Apr" — day + short month, no year (prose date references). */
export function fmtDayMon(date) {
  const d = startOfDay(date)
  return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`
}

/* Convenience: today expressed in common formats. */
export const TODAY_ISO = iso(TODAY)
