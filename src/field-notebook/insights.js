// Derived workspace signals — every figure the Today page, the Rail badges,
// the Analytics page and the AI Assistant's Insights tab show comes from
// here, computed from the canonical fixtures (dreams, INBOX, COLLABORATORS,
// VERSIONS, DOCUMENTS, RETROS, ARCHIVED, SUGGESTION_LOG) against the real
// clock. Nothing in a view hand-types a number, and there is ONE event log:
// the activity series (heatmap, weekly bars, streak, captures/week, busiest
// weekday) is built from the same dated records every other screen renders,
// so no two screens can disagree (§0b/§1 of the polish checklist; the
// view-honesty unit gate enforces the "no literals" half).
import {
  ARCHIVED,
  COLLABORATORS,
  DOCUMENTS,
  INBOX,
  RETROS,
  SUGGESTION_LOG,
  VERSIONS,
} from './fixtures'
import { startOfDay, TODAY } from './dates'
import { fmtRel } from './helpers'

const DAY_MS = 86400000
const WEEK_DAYS = 7
const RECENT_WINDOW_DAYS = 30
export const ACTIVITY_DAYS = 84
export const PRIORITY_WINDOW_DAYS = 7
export const PRIORITY_LIMIT = 6

const dayIndex = value => Math.floor((startOfDay(new Date(value)) - TODAY) / DAY_MS)
const withinLastDays = (value, days) => {
  if (!value) return false
  const d = dayIndex(value)
  return d <= 0 && d > -days
}
const isToday = value => Boolean(value) && dayIndex(value) === 0

const allFragments = dreams => dreams.flatMap(dream => dream.fragments)

// ── Priorities (Today list + its rail/tab badge share this) ──────────────
export function priorityTodos(dreams) {
  const limit = TODAY.getTime() + PRIORITY_WINDOW_DAYS * DAY_MS
  return dreams
    .flatMap(d => d.todos.filter(t => !t.done && t.deadline).map(t => ({ ...t, dream: d })))
    .filter(t => new Date(t.deadline).getTime() <= limit)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, PRIORITY_LIMIT)
}

// ── The event log ────────────────────────────────────────────────────────
// Every dated thing a visitor can see somewhere in the workspace, as a
// day-indexed count for the last ACTIVITY_DAYS days ending today. Future
// dates (open todo deadlines) are not activity.
export function buildActivity(dreams) {
  const counts = new Map()
  const bump = value => {
    if (!value) return
    const d = dayIndex(value)
    if (d > 0 || d <= -ACTIVITY_DAYS) return
    counts.set(d, (counts.get(d) ?? 0) + 1)
  }
  for (const dream of dreams) {
    bump(dream.created)
    bump(dream.updated)
    for (const f of dream.fragments) bump(f.date)
    for (const t of dream.todos) if (t.done) bump(t.deadline)
    for (const v of VERSIONS[dream.id] ?? []) bump(v.date)
    for (const doc of DOCUMENTS[dream.id] ?? []) bump(doc.uploaded)
    for (const r of RETROS[dream.id] ?? []) bump(r.date)
  }
  for (const item of INBOX) bump(item.captured)
  for (const item of ARCHIVED) bump(item.archived)
  for (const entry of SUGGESTION_LOG) bump(entry.decidedAt)
  return Array.from({ length: ACTIVITY_DAYS }, (_, index) => {
    const d = index - (ACTIVITY_DAYS - 1)
    return {
      date: new Date(TODAY.getTime() + d * DAY_MS).toISOString().slice(0, 10),
      count: counts.get(d) ?? 0,
    }
  })
}

// ── Today ─────────────────────────────────────────────────────────────────
export function fragmentsThisWeek(dreams) {
  return allFragments(dreams).filter(fragment => withinLastDays(fragment.date, WEEK_DAYS)).length
}

export function inFlightTouchedThisWeek(dreams) {
  return dreams.filter(
    dream => dream.status === 'in-progress' && withinLastDays(dream.updated, WEEK_DAYS)
  ).length
}

export function inboxToday(items = INBOX) {
  return items.filter(item => isToday(item.captured)).length
}

export function inboxBacklog(items = INBOX) {
  const ages = items.map(item => -dayIndex(item.captured)).filter(Number.isFinite)
  return { count: items.length, oldestDays: ages.length ? Math.max(0, ...ages) : 0 }
}

// Unique people across the active dreams' collaborator lists.
export function collaboratorSummary(dreams) {
  const people = new Map()
  for (const dream of dreams) {
    for (const person of COLLABORATORS[dream.id] ?? []) people.set(person.id, person)
  }
  const list = [...people.values()]
  return { count: list.length, online: list.filter(person => person.online).length }
}

// Consecutive activity days ending today, and the best run in the window.
export function captureStreak(activity) {
  let current = 0
  for (let i = activity.length - 1; i >= 0 && activity[i].count > 0; i -= 1) current += 1
  let best = 0
  let run = 0
  for (const day of activity) {
    run = day.count > 0 ? run + 1 : 0
    best = Math.max(best, run)
  }
  return { current, best }
}

// ── Analytics ─────────────────────────────────────────────────────────────
export function weeklyCaptures(activity) {
  const weeks = []
  for (let i = 0; i < activity.length; i += WEEK_DAYS) {
    weeks.push(activity.slice(i, i + WEEK_DAYS).reduce((sum, day) => sum + day.count, 0))
  }
  return weeks
}

// Average events per week over the window, and the change of the most
// recent half of the window against the earlier half.
export function capturesPerWeek(activity) {
  const weeks = weeklyCaptures(activity)
  const avg = list => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0)
  const half = Math.floor(weeks.length / 2)
  const prior = avg(weeks.slice(0, half))
  const recent = avg(weeks.slice(half))
  const deltaPct = prior ? Math.round(((recent - prior) / prior) * 100) : 0
  return { avg: avg(weeks), recent, prior, deltaPct }
}

// Done todos whose deadline fell inside the window — the fixture carries no
// separate completion timestamp, so the deadline is the closure-date proxy
// (the same proxy the trends chart uses).
export function todosClosedWithin(dreams, days = RECENT_WINDOW_DAYS) {
  return dreams.reduce(
    (n, dream) =>
      n + dream.todos.filter(todo => todo.done && withinLastDays(todo.deadline, days)).length,
    0
  )
}

export function aiAcceptRate(log = SUGGESTION_LOG) {
  const decided = log.length
  const accepted = log.filter(entry => entry.decision === 'accepted').length
  const thisMonth = log.filter(entry => withinLastDays(entry.decidedAt, RECENT_WINDOW_DAYS)).length
  return { rate: decided ? Math.round((accepted / decided) * 100) : 0, decided, accepted, thisMonth }
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function busiestWeekday(activity) {
  const totals = Array(7).fill(0)
  const seen = Array(7).fill(0)
  for (const day of activity) {
    const dow = new Date(`${day.date}T12:00:00`).getDay()
    totals[dow] += day.count
    seen[dow] += 1
  }
  const perDay = totals.map((t, i) => (seen[i] ? t / seen[i] : 0))
  const bestIndex = perDay.indexOf(Math.max(...perDay))
  const weekend = (perDay[0] + perDay[6]) / 2
  const ratio = weekend ? perDay[bestIndex] / weekend : 0
  return { weekday: WEEKDAYS[bestIndex], ratio, any: perDay[bestIndex] > 0 }
}

// The dream with the most captures in the last week, and whether that beats
// any earlier week of its own history.
export function heatingUp(dreams) {
  let best = null
  for (const dream of dreams) {
    const thisWeek = dream.fragments.filter(f => withinLastDays(f.date, WEEK_DAYS)).length
    if (!thisWeek || (best && thisWeek <= best.thisWeek)) continue
    const priorWeeks = new Map()
    for (const f of dream.fragments) {
      const d = dayIndex(f.date)
      if (d <= -WEEK_DAYS) {
        const key = Math.floor(d / WEEK_DAYS)
        priorWeeks.set(key, (priorWeeks.get(key) ?? 0) + 1)
      }
    }
    best = { dream, thisWeek, priorMax: Math.max(0, ...priorWeeks.values()) }
  }
  return best
}

// The in-flight/planning dream that has gone longest without a capture.
export function goingQuiet(dreams) {
  let quietest = null
  for (const dream of dreams) {
    if (!['in-progress', 'planning'].includes(dream.status) || !dream.fragments.length) continue
    const last = Math.max(...dream.fragments.map(f => new Date(f.date).getTime()))
    const days = -dayIndex(last)
    if (!quietest || days > quietest.days) {
      quietest = { dream, days, lastIso: new Date(last).toISOString() }
    }
  }
  return quietest
}

// The insight list both Analytics and the AI Assistant render — one source,
// so the assistant can never quote a number the screen beside it does not.
export function deriveInsights(dreams) {
  const out = []
  const backlog = inboxBacklog()
  if (backlog.count) {
    out.push({
      icon: '!',
      kind: 'Backlog',
      title: 'Inbox is waiting.',
      body: `${backlog.count} capture${backlog.count === 1 ? '' : 's'} unfiled; the oldest has sat for ${backlog.oldestDays} day${backlog.oldestDays === 1 ? '' : 's'}. Triage before capturing more.`,
    })
  }
  const hot = heatingUp(dreams)
  if (hot) {
    out.push({
      icon: '↗',
      kind: 'Momentum',
      title: `${hot.dream.title} is heating up.`,
      body: `${hot.thisWeek} capture${hot.thisWeek === 1 ? '' : 's'} this week${
        hot.priorMax ? ` — no earlier week of its history had more than ${hot.priorMax}` : ' — its first captures'
      }.`,
    })
  }
  const quiet = goingQuiet(dreams)
  if (quiet && quiet.days >= WEEK_DAYS) {
    out.push({
      icon: '↓',
      kind: 'Cadence',
      title: `${quiet.dream.title} is going quiet.`,
      body: `Last capture ${fmtRel(quiet.lastIso)}; decide whether it is paused, done, or waiting on you.`,
    })
  }
  const busiest = busiestWeekday(buildActivity(dreams))
  if (busiest.any && busiest.ratio > 1) {
    out.push({
      icon: '*',
      kind: 'Rhythm',
      title: `You work the workspace most on ${busiest.weekday}s.`,
      body: `${busiest.ratio.toFixed(1)}× the weekend average over the last 12 weeks. Schedule deep work accordingly.`,
    })
  } else if (busiest.any) {
    out.push({
      icon: '*',
      kind: 'Rhythm',
      title: `${busiest.weekday}s carry the most activity.`,
      body: 'Weekends are not far behind — the workspace is worked evenly across the week.',
    })
  }
  return out
}
