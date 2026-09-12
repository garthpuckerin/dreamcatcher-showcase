// Mobile-native companion shell (≤900px) — a bottom tab bar plus a "More"
// nav sheet, and the "stays at the desk" screen for DESK_ONLY_VIEWS routes.
// Pattern ported from grant-tracker-showcase's mobile-tabs.jsx / cardify.js
// and ops-command-center-showcase's DeskOnlyScreen, adapted to Dreamcatcher's
// `route.kind` router and its dream-cards/fragments content model (no
// tabular data to cardify here — see AllDreams/Archive/Inbox for the
// content-specific card treatment instead).
import { Star, Home, Inbox as InboxIcon, Menu, X } from 'lucide-react'
import { DESK_ONLY_VIEWS } from './deskOnly'

const PRIMARY_TABS = [
  { id: 'today', label: 'Today', icon: Star },
  { id: 'all', label: 'Dreams', icon: Home },
  { id: 'inbox', label: 'Inbox', icon: InboxIcon },
]

// Everything else lives behind "More" — routes not already on the bar.
const MORE_ITEMS = [
  { id: 'suggest', label: 'AI Suggestions' },
  { id: 'archive', label: 'Archive' },
  { id: 'revisions', label: 'Revisions' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'templates', label: 'Templates' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'builder', label: 'Builder Notes' },
  { id: 'graph', label: 'Graph' },
  { id: 'settings', label: 'Settings' },
]

// Detail/composer routes highlight the tab or More entry they belong to.
const TAB_OF = { dream: 'all', brand: 'all', case: 'more' }

export function MobileTabBar({ route, onRoute, onMore, moreOpen, counts }) {
  const active = TAB_OF[route.kind] || route.kind
  return (
    <nav className="fn-mtab" aria-label="Primary (mobile)" data-tour="fn-mtab">
      {PRIMARY_TABS.map(tab => {
        const on = active === tab.id
        const Icon = tab.icon
        const badge =
          tab.id === 'inbox' ? counts?.inbox : tab.id === 'all' ? null : null
        return (
          <button
            key={tab.id}
            type="button"
            className="fn-mtab-item"
            data-on={on}
            aria-current={on ? 'page' : undefined}
            onClick={() => onRoute({ kind: tab.id })}
          >
            <span className="fn-mtab-icon">
              <Icon size={18} strokeWidth={on ? 2.25 : 1.75} />
              {badge ? <span className="fn-mtab-badge">{badge}</span> : null}
            </span>
            <span className="fn-mtab-label">{tab.label}</span>
          </button>
        )
      })}
      <button
        type="button"
        className="fn-mtab-item"
        data-on={active === 'more' || moreOpen}
        aria-haspopup="dialog"
        aria-expanded={moreOpen}
        onClick={onMore}
      >
        <span className="fn-mtab-icon">
          <Menu size={18} strokeWidth={moreOpen ? 2.25 : 1.75} />
        </span>
        <span className="fn-mtab-label">More</span>
      </button>
    </nav>
  )
}

export function MoreSheet({ open, route, onRoute, onClose, onSignOut, counts }) {
  if (!open) return null
  return (
    <div className="fn-more-backdrop" role="presentation" onClick={onClose}>
      <div
        className="fn-more-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="More navigation"
        onClick={event => event.stopPropagation()}
      >
        <header className="fn-more-head">
          <h2>More</h2>
          <button type="button" className="fn-more-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="fn-more-list">
          {MORE_ITEMS.map(item => {
            const deskOnly = DESK_ONLY_VIEWS[item.id]
            const badge = item.id === 'suggest' ? counts?.suggestions : null
            return (
              <button
                key={item.id}
                type="button"
                className="fn-more-item"
                data-active={route.kind === item.id}
                onClick={() => {
                  onRoute({ kind: item.id })
                  onClose()
                }}
              >
                <span>{item.label}</span>
                <span className="flex items-center gap-2">
                  {badge ? <span className="fn-more-count">{badge}</span> : null}
                  {deskOnly ? (
                    <span className="fn-more-desk" aria-label="Opens a desktop-only view on phone">
                      desk
                    </span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
        <footer className="fn-more-foot">
          <button
            type="button"
            className="fn-more-item fn-more-signout"
            onClick={() => {
              onClose()
              onSignOut()
            }}
          >
            Sign out
          </button>
        </footer>
      </div>
    </div>
  )
}

export function DeskOnlyScreen({ route, onRoute }) {
  const info = DESK_ONLY_VIEWS[route.kind]
  if (!info) return null
  return (
    <div className="fn-desk-only" data-screen-label={`${info.label} (desk only)`}>
      <div className="fn-desk-only-kicker">Workstation surface</div>
      <h1 className="fn-desk-only-title">
        {info.label} stays at <em>the desk</em>.
      </h1>
      <p className="fn-desk-only-why">{info.why}</p>
      <p className="fn-desk-only-note">
        The phone is Dreamcatcher's triage companion — Today, All Dreams, and Inbox travel with
        you. Authoring surfaces like this one are scoped to the desktop the same way visibility is
        scoped by workspace.
      </p>
      <div className="fn-desk-only-actions">
        <button type="button" className="fn-btn fn-btn-primary" onClick={() => onRoute({ kind: 'today' })}>
          Go to Today
        </button>
        <button type="button" className="fn-btn" onClick={() => onRoute({ kind: 'inbox' })}>
          Open Inbox
        </button>
      </div>
    </div>
  )
}
