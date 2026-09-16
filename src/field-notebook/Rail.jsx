import { useMemo } from 'react'
import { BRANDS, USER } from './fixtures'
import { fmtRel } from './helpers'
import { collaboratorSummary } from './insights'

const PRIMARY = [
  { id: 'today', label: 'Today', glyph: '★', badge: 'today' },
  { id: 'all', label: 'All Dreams', glyph: '⌂', badge: 'count' },
  { id: 'inbox', label: 'Inbox', glyph: '↘', badge: 'inbox' },
  { id: 'suggest', label: 'AI Suggestions', glyph: '⚹', badge: 'ai' },
  { id: 'archive', label: 'Archive', glyph: '⌗', badge: 'archive' },
]

const TOOLS = [
  { id: 'builder', label: 'Builder Notes', glyph: '□' },
  { id: 'analytics', label: 'Analytics', glyph: '▤' },
  { id: 'portfolio', label: 'Portfolio', glyph: '◇' },
  { id: 'templates', label: 'Templates', glyph: '▦' },
  { id: 'integrations', label: 'Integrations', glyph: '⟷' },
  { id: 'revisions', label: 'Revisions', glyph: '⟲' },
  { id: 'graph', label: 'Graph', glyph: '⊶' },
  { id: 'settings', label: 'Settings', glyph: '⚙' },
]

export default function Rail({ route, onRoute, dreams, counts, onSignOut }) {
  const brandCounts = useMemo(() => {
    const out = {}
    for (const b of BRANDS) out[b.value] = 0
    for (const d of dreams) out[d.brand] = (out[d.brand] ?? 0) + 1
    return out
  }, [dreams])

  // Every badge is the same count its destination screen derives (Today's
  // priorities, the Inbox list, the AI Suggestions list, the Archive) —
  // `counts` is built once in FieldNotebookApp so the rail, the mobile tab
  // bar and the pages never disagree.
  const badgeFor = kind => {
    if (kind === 'count') return dreams.length
    if (kind === 'today') return counts.today
    if (kind === 'inbox') return counts.inbox
    if (kind === 'ai') return counts.suggestions
    if (kind === 'archive') return counts.archive
    return null
  }
  // Three most recently updated dreams; their meta derives from the dream.
  const recentDreams = [...dreams]
    .sort((a, b) => new Date(b.updated) - new Date(a.updated))
    .slice(0, 3)
  const recentMetaFor = dream => `${dream.fragments.length} frag · ${fmtRel(dream.updated)}`
  // Presence dot count = collaborators online across the active dreams (the
  // same figure the Today page derives).
  const online = useMemo(() => collaboratorSummary(dreams).online, [dreams])

  return (
    <aside className="fn-rail" data-tour="fn-rail">
      <header className="fn-rail-head">
        <h1 className="fn-brand">
          dreamcatcher<sup>v3</sup>
        </h1>
        <span className="flex items-center gap-1.5 fn-mono-num">
          <span
            className="h-1.5 w-1.5 rounded-full bg-good"
            style={{ boxShadow: '0 0 0 3px color-mix(in oklab, var(--good) 25%, transparent)' }}
          />
          {online}
        </span>
      </header>

      <nav className="flex-1 overflow-y-auto fn-scroll">
        <section className="fn-rail-section">
          <div className="fn-rail-label">Workspace</div>
          <NavList items={PRIMARY} route={route} onRoute={onRoute} badgeFor={badgeFor} />
        </section>

        <section className="fn-rail-section">
          <div className="fn-rail-label">Brands</div>
          <div className="fn-nav">
            <button
              type="button"
              onClick={() => onRoute({ kind: 'all' })}
              className="fn-nav-item"
              data-active={route.kind === 'all'}
            >
              <span className="flex items-center gap-2">
                <span className="fn-nav-glyph">·</span>
                All brands
              </span>
              <span className="fn-nav-count">{dreams.length}</span>
            </button>
            {BRANDS.map(b => (
              <button
                key={b.value}
                type="button"
                onClick={() => onRoute({ kind: 'brand', id: b.value })}
                className="fn-nav-item"
                data-active={route.kind === 'brand' && route.id === b.value}
              >
                <span className="flex items-center gap-2">
                  <span className="fn-nav-glyph">{b.glyph}</span>
                  {b.label}
                </span>
                <span className="fn-nav-count">{brandCounts[b.value] ?? 0}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="fn-rail-section">
          <div className="fn-rail-label">Tools</div>
          <NavList items={TOOLS} route={route} onRoute={onRoute} />
        </section>

        <section className="fn-rail-section">
          <div className="fn-rail-label">Recent</div>
          <div className="fn-recent-list">
            {recentDreams.map(dream => (
              <button
                key={dream.id}
                type="button"
                onClick={() => onRoute({ kind: 'dream', id: dream.id })}
                className="fn-recent-item"
              >
                <span className="fn-recent-title">{dream.title}</span>
                <span className="fn-recent-meta">{recentMetaFor(dream)}</span>
                <span className="fn-recent-status">◑</span>
              </button>
            ))}
          </div>
        </section>
      </nav>

      <footer className="fn-rail-foot">
        <div className="flex min-w-0 items-center gap-2">
          <span className="fn-avatar">{USER.initials}</span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[12.5px] text-ink-2">{USER.email}</span>
            <span className="fn-mono-label">{USER.plan} · {counts.used}/{USER.limit}</span>
          </div>
        </div>
        <button type="button" className="fn-logout" onClick={onSignOut} aria-label="Sign out">
          ↪
        </button>
      </footer>
    </aside>
  )
}

function NavList({ items, route, onRoute, badgeFor }) {
  return (
    <div className="fn-nav">
      {items.map(item => {
        const active = route.kind === item.id || (item.id === 'all' && route.kind === 'brand')
        const badge = badgeFor ? badgeFor(item.badge) : null
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onRoute({ kind: item.id })}
            className="fn-nav-item"
            data-active={active}
          >
            <span className="flex items-center gap-2">
              <span className="fn-nav-glyph">{item.glyph}</span>
              {item.label}
            </span>
            {badge != null && <span className="fn-nav-count">{badge}</span>}
          </button>
        )
      })}
    </div>
  )
}
