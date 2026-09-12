import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { statusMap, brandMap, fmtRel, progress } from '../helpers'
import { COLLABORATORS, STATUSES, BRANDS } from '../fixtures'

const DEMO_PRESENCE_TOOLTIP =
  'Demo presence indicator. In production, this reflects live collaborator activity.'

const isNarrowViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches

export default function AllDreams({ dreams, onOpenDream }) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterBrand, setFilterBrand] = useState('all')
  const [sortBy, setSortBy] = useState('updated')
  // Phones default to the card grid — a real mobile-native card layout,
  // not a desktop row narrowed to one column. Desktop keeps the list
  // default; the segmented control still lets either surface switch.
  const [view, setView] = useState(() => (isNarrowViewport() ? 'cards' : 'list'))

  const filtered = useMemo(() => {
    let xs = dreams
    if (filterStatus !== 'all') xs = xs.filter(d => d.status === filterStatus)
    if (filterBrand !== 'all') xs = xs.filter(d => d.brand === filterBrand)
    const sorted = [...xs]
    if (sortBy === 'updated') sorted.sort((a, b) => new Date(b.updated) - new Date(a.updated))
    if (sortBy === 'created') sorted.sort((a, b) => new Date(b.created) - new Date(a.created))
    if (sortBy === 'alpha') sorted.sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'progress') sorted.sort((a, b) => progress(b) - progress(a))
    return sorted
  }, [dreams, filterStatus, filterBrand, sortBy])

  const totals = useMemo(
    () => ({
      dreams: dreams.length,
      fragments: dreams.reduce((n, d) => n + d.fragments.length, 0),
      todos: dreams.reduce((n, d) => n + d.todos.filter(t => !t.done).length, 0),
      active: dreams.filter(d => d.status === 'in-progress').length,
    }),
    [dreams]
  )

  return (
    <div className="fn-canvas-page">
      <PageHeader totals={totals} />

      <div
        className="fn-filter-bar prototype-filterbar flex flex-wrap items-center justify-between gap-3 border-y border-hairline"
        style={{
          margin: 'calc(var(--u) * 4) 0 calc(var(--u) * 5)',
          padding: 'calc(var(--u) * 2) 0',
        }}
      >
        <div className="fn-chip-row">
          <Chip active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
            All status
          </Chip>
          {STATUSES.map(s => (
            <Chip
              key={s.value}
              active={filterStatus === s.value}
              onClick={() => setFilterStatus(s.value)}
            >
              <span className="gly">{s.glyph}</span> {s.label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="fn-segment" aria-label="Dream view">
            {['list', 'cards'].map(item => (
              <button
                key={item}
                type="button"
                data-active={view === item}
                onClick={() => setView(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <SortControl label="Brand" value={filterBrand} onChange={setFilterBrand}>
            <option value="all">All</option>
            {BRANDS.map(b => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </SortControl>
          <SortControl label="Sort" value={sortBy} onChange={setSortBy}>
            <option value="updated">Recently updated</option>
            <option value="created">Recently created</option>
            <option value="alpha">A → Z</option>
            <option value="progress">Most progress</option>
          </SortControl>
        </div>
      </div>

      <div
        className={view === 'list' ? 'fn-dream-list' : 'fn-dream-card-grid'}
        data-tour="fn-dreams-board"
      >
        {filtered.map((d, i) =>
          view === 'list' ? (
            <DreamRow key={d.id} dream={d} index={i + 1} onOpen={() => onOpenDream(d.id)} />
          ) : (
            <DreamCard key={d.id} dream={d} index={i + 1} onOpen={() => onOpenDream(d.id)} />
          )
        )}
        {!filtered.length && (
          <div className="py-16 text-center fn-body">No dreams match this filter.</div>
        )}
      </div>
    </div>
  )
}

function DreamCard({ dream, index, onOpen }) {
  const brand = brandMap[dream.brand]
  const pct = progress(dream)
  const collaborators = COLLABORATORS[dream.id] ?? []
  return (
    <button type="button" onClick={onOpen} className="fn-dream-card">
      <div className="fn-card-meta">
        {String(index).padStart(2, '0')} / {brand?.label}
      </div>
      <h3>{dream.title}</h3>
      <p>{dream.description}</p>
      <div className="flex flex-wrap gap-2">
        {dream.tags?.slice(0, 4).map(tag => (
          <span key={tag} className="fn-tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="fn-progress">
        <i style={{ width: `${pct}%` }} />
      </div>
      <div className="fn-dream-card-foot">
        <div className="fn-dream-card-metrics">
          <span>
            <b>{dream.fragments.length}</b> frag
          </span>
          <span>
            <b>
              {dream.todos.filter(t => t.done).length}/{dream.todos.length}
            </b>{' '}
            todos
          </span>
          <span>{fmtRel(dream.updated)}</span>
        </div>
        {collaborators.length > 1 && <AvatarStack users={collaborators} max={3} />}
      </div>
    </button>
  )
}

function PageHeader({ totals }) {
  return (
    <header
      className="fn-page-header flex items-end justify-between gap-6"
      style={{ marginBottom: 'calc(var(--u) * 6)' }}
    >
      <div>
        <h2 className="fn-page-title">
          All <em>dreams</em>, in one place.
        </h2>
        <p className="fn-body" style={{ maxWidth: '56ch' }}>
          Projects across product, client, team, research, and personal work. Every fragment you
          have captured from your AI assistants and coding tools, organised the way you think.
        </p>
      </div>
      <dl className="fn-stats flex shrink-0 gap-6">
        <Stat n={totals.dreams} l="Dreams" />
        <Stat n={totals.fragments} l="Fragments" />
        <Stat n={totals.todos} l="Open todos" />
        <Stat n={totals.active} l="In flight" />
      </dl>
    </header>
  )
}

function Stat({ n, l }) {
  return (
    <div className="fn-stat">
      <div className="fn-stat-n">{n}</div>
      <div className="fn-stat-l">{l}</div>
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="fn-chip" data-active={active}>
      {children}
    </button>
  )
}

function SortControl({ label, value, onChange, children }) {
  return (
    <div className="flex items-center gap-1.5 fn-mono-meta">
      <span>{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="appearance-none bg-transparent py-0.5 pl-1 pr-5 text-[12px] text-ink-2 outline-none rounded hover:bg-surface-2"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
        >
          {children}
        </select>
        <ChevronDown
          size={11}
          className="pointer-events-none absolute right-0.5 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  )
}

function DreamRow({ dream, index, onOpen }) {
  const status = statusMap[dream.status]
  const brand = brandMap[dream.brand]
  const pct = progress(dream)
  const collaborators = COLLABORATORS[dream.id] ?? []
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fn-dream-row group"
      data-tour={index === 1 ? 'fn-dream-card' : undefined}
    >
      <span className="fn-dream-index">{String(index).padStart(2, '0')} /</span>

      <div className="min-w-0">
        <h3 className="fn-dream-title">{dream.title}</h3>
        <p className="fn-dream-desc">{dream.description}</p>
        {dream.tags && (
          <div className="fn-dream-tags flex gap-2 mt-1">
            {dream.tags.slice(0, 4).map(t => (
              <span key={t} className="fn-tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="fn-mono-meta">
          <b>{dream.fragments.length}</b> fragments
        </div>
        <div className="fn-mono-meta">
          <b>
            {dream.todos.filter(t => t.done).length}/{dream.todos.length}
          </b>{' '}
          todos
        </div>
        <div className="fn-mono-meta">updated {fmtRel(dream.updated)}</div>
        <div className="fn-progress">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="fn-dream-collabs">
          {collaborators.length > 1 && <AvatarStack users={collaborators} max={4} />}
        </div>
      </div>

      <div className="fn-dream-status">
        <span className="fn-status">
          <span className="gly">{status?.glyph}</span>
          {status?.label}
        </span>
        <span className="fn-brand-pill">{brand?.label}</span>
      </div>
    </button>
  )
}

function AvatarStack({ users, max }) {
  return (
    <div
      className="fn-dream-avatar-stack"
      aria-label={`${users.length} collaborators. ${DEMO_PRESENCE_TOOLTIP}`}
      title={DEMO_PRESENCE_TOOLTIP}
    >
      {users.slice(0, max).map(user => (
        <span
          key={user.id}
          title={`${user.name} · ${user.role}. ${DEMO_PRESENCE_TOOLTIP}`}
          data-color={user.color}
          data-online={user.online}
        >
          {user.initials}
        </span>
      ))}
    </div>
  )
}
