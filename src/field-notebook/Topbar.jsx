import { Search, Plus, Sparkles } from 'lucide-react'

const ROUTE_LABELS = {
  all: 'All Dreams',
  today: 'Today',
  inbox: 'Inbox',
  suggest: 'AI Suggestions',
  archive: 'Archive',
  builder: 'Builder Notes',
  analytics: 'Analytics',
  portfolio: 'Portfolio',
  templates: 'Templates',
  integrations: 'Integrations',
  revisions: 'Revisions',
  graph: 'Graph',
  settings: 'Settings',
  brand: 'Brand',
  dream: 'Dream',
  case: 'Case Study',
}

export default function Topbar({
  route,
  dreamTitle,
  onRoute,
  onOpenPalette,
  onOpenAI,
  onNewDream,
  onNewFragment,
}) {
  const label = ROUTE_LABELS[route.kind] ?? 'Workspace'
  const parentRoute =
    route.kind === 'case' ? { kind: 'portfolio' } : route.kind === 'dream' ? { kind: 'all' } : null
  const parentLabel =
    route.kind === 'case' ? ROUTE_LABELS.portfolio : route.kind === 'dream' ? ROUTE_LABELS.all : ''

  return (
    <header className="fn-topbar">
      <nav className="fn-crumb" aria-label="Breadcrumb">
        <span>Workspace</span>
        <span className="sep">/</span>
        {parentRoute ? (
          <>
            <button type="button" onClick={() => onRoute(parentRoute)}>
              {parentLabel}
            </button>
            <span className="sep">/</span>
            {route.kind === 'case' && dreamTitle ? (
              <>
                <button type="button" onClick={() => onRoute({ kind: 'dream', id: route.id })}>
                  {dreamTitle}
                </button>
                <span className="sep">/</span>
                <b>{label}</b>
              </>
            ) : (
              <b>{dreamTitle ?? label}</b>
            )}
          </>
        ) : (
          <b>{label}</b>
        )}
      </nav>

      <button
        type="button"
        onClick={onOpenPalette}
        className="fn-search cursor-text"
        data-tour="fn-search"
      >
        <Search size={14} className="fn-search-icon" />
        <span className="fn-search-input flex items-center text-left text-muted">
          Search dreams, fragments, todos…
        </span>
        <span className="fn-kbd-floating">⌘K</span>
      </button>

      <div className="fn-topbar-actions flex items-center gap-2">
        <button type="button" onClick={onOpenAI} className="fn-btn">
          <Sparkles size={13} /> Assistant
        </button>
        {route.kind === 'dream' && (
          <button type="button" onClick={onNewFragment} className="fn-btn fn-btn-primary">
            <Plus size={13} /> Fragment
          </button>
        )}
        {route.kind !== 'dream' && (
          <button
            type="button"
            onClick={onNewDream}
            className="fn-btn fn-btn-primary"
            data-tour="fn-new-dream"
          >
            <Plus size={13} /> New Dream <span className="fn-kbd">⌘N</span>
          </button>
        )}
      </div>
    </header>
  )
}
