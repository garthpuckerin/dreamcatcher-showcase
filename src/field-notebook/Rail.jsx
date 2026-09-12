import { useMemo } from 'react'
import { BRANDS, USER } from './fixtures'

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

  const badgeFor = kind => {
    if (kind === 'count') return dreams.length
    if (kind === 'today') return 4
    if (kind === 'inbox') return 12
    if (kind === 'ai') return counts.suggestions
    if (kind === 'archive') return 4
    return null
  }
  const recentDreams = [1, 2, 8].map(id => dreams.find(dream => dream.id === id)).filter(Boolean)
  const recentMeta = {
    1: '8 frag · 8d ago',
    2: '3 frag · 7d ago',
    8: '1 frag · 7d ago',
  }

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
          3
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
                <span className="fn-recent-meta">{recentMeta[dream.id]}</span>
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
            <span className="fn-mono-label">{USER.plan} · 24/100</span>
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
