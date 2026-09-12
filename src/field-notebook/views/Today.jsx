import { useMemo } from 'react'
import { CATEGORIES, INBOX } from '../fixtures'

const DEMO_PRESENCE_TOOLTIP =
  'Demo presence indicator. In production, this reflects live collaborator activity.'

export default function Today({ dreams, onOpenDream, onDemoAction }) {
  const todos = useMemo(
    () =>
      dreams
        .flatMap(d => d.todos.filter(t => !t.done).map(t => ({ ...t, dream: d })))
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 6),
    [dreams]
  )

  const fragmentCount = useMemo(
    () => dreams.reduce((n, d) => n + d.fragments.length, 0),
    [dreams]
  )
  const inboxCount = INBOX.length

  const overdue = todos.filter(t => new Date(t.deadline).getTime() < Date.now()).length
  const today = new Date()
  const greeting =
    today.getHours() < 12
      ? 'Good morning'
      : today.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening'
  const inFlightCount = dreams.filter(dream => dream.status === 'in-progress').length

  return (
    <div className="today" data-screen-label="Today">
      <div className="page-head-2">
        <div>
          <div className="l">
            {today.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <h1>
            {greeting}, <em>Demo User</em>.
          </h1>
          <p className="lead">
            {overdue > 0
              ? `${overdue} task${overdue === 1 ? '' : 's'} ${
                  overdue === 1 ? 'is' : 'are'
                } past due. Triage first, then write.`
              : 'Nothing past due. The AI assistant suggests starting with the Chrome Extension MV3 service worker.'}
          </p>
        </div>
      </div>

      <div className="today-grid">
        <div className="today-col">
          <h2>Priorities for today</h2>
          <div className="priority-list">
            {todos.map((todo, index) => (
              <button
                key={todo.id}
                type="button"
                className="priority-row"
                onClick={() => onOpenDream(todo.dream.id)}
              >
                <span className="priority-rank">{index + 1}</span>
                <span>
                  <span className="priority-title">{todo.title}</span>
                  <span className="priority-meta">
                    <span className="priority-dream-title">{todo.dream.title}</span> ·{' '}
                    {categoryLabel(todo.category)}
                  </span>
                </span>
                <span className={`priority-due ${dueClass(todo.deadline)}`}>
                  {prototypeDueLabel(todo.deadline)}
                </span>
                <span className="priority-arrow">→</span>
              </button>
            ))}
            {todos.length === 0 && (
              <div className="priority-empty">
                Inbox zero on todos. Take the rest of the day off.
              </div>
            )}
          </div>
        </div>

        <div className="today-col">
          <h2>Pulse</h2>

          <div className="today-card">
            <div className="label">AI Assistant suggestion</div>
            <div className="quote">
              “You have {inboxCount} inbox captures waiting. Triage them first — three pattern-match
              existing dreams, cited in Suggestions.”
            </div>
            <div className="row">
              <span>AI Assistant · 4s ago</span>
              <button
                type="button"
                onClick={() =>
                  onDemoAction?.(
                    'Use the Inbox rail item to inspect fixture captures in the public preview.'
                  )
                }
              >
                open inbox →
              </button>
            </div>
          </div>

          <div className="today-stat-grid">
            <TodayStat value={fragmentCount} label="Fragments" delta="+ 14 this week" />
            <TodayStat value={inFlightCount} label="In Flight" delta="+ 1 this week" />
            <TodayStat value={inboxCount} label="Inbox" delta="+ 4 today" down />
            <TodayStat
              value="3"
              label="Collaborators"
              delta="2 online now"
              tooltip={DEMO_PRESENCE_TOOLTIP}
            />
          </div>

          <div className="today-card today-streak">
            <div className="label">Streak</div>
            <h3 className="big">17 days</h3>
            <div className="row">
              <span>of daily capture</span>
              <span>best: 32d</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TodayStat({ value, label, delta, down, tooltip }) {
  return (
    <div
      className="today-stat"
      title={tooltip}
      aria-label={tooltip ? `${value} ${label}. ${delta}. ${tooltip}` : undefined}
    >
      <div className="n">{value}</div>
      <div className="l">{label}</div>
      <div className={down ? 'delta down' : 'delta'}>{delta}</div>
    </div>
  )
}

function categoryLabel(value) {
  return CATEGORIES.find(category => category.value === value)?.label ?? value
}

function prototypeDueLabel(iso) {
  if (!iso) return ''
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86400000)
  if (days < 0) return `${Math.abs(days)}d late`
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  return `in ${days}d`
}

function dueClass(iso) {
  if (!iso) return ''
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'overdue'
  if (days <= 3) return 'soon'
  return ''
}
