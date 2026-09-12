import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { fmtDate, statusMap, brandMap } from '../helpers'
import { ARCHIVED } from '../fixtures'

const isNarrowViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches

export default function Archive({ archivedDreams = [], onRestore, onDelete, onDemoAction }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('archived')
  // Phones default to the card grid for the same reason as All Dreams: a
  // real mobile-native card layout, not a narrowed desktop row.
  const [view, setView] = useState(() => (isNarrowViewport() ? 'cards' : 'list'))

  const rows = useMemo(
    () => [
      ...archivedDreams.map(item => ({
        ...item,
        reason: item.reason ?? 'Archived from the Field Notebook demo workspace.',
      })),
      ...ARCHIVED,
    ],
    [archivedDreams]
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = rows.filter(item => {
      if (status !== 'all' && item.status !== status) return false
      if (!needle) return true
      return [item.title, item.reason, item.status, brandMap[item.brand]?.label]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
    return matches.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'status')
        return statusMap[a.status].label.localeCompare(statusMap[b.status].label)
      if (sortBy === 'brand') return brandMap[a.brand].label.localeCompare(brandMap[b.brand].label)
      return new Date(b.archived) - new Date(a.archived)
    })
  }, [query, rows, sortBy, status])

  return (
    <div className="fn-canvas-page">
      <header className="page-head-2">
        <div>
          <div className="l">Archive</div>
          <h1>
            <em>{rows.length}</em> dreams retired from the workspace.
          </h1>
          <p className="lead">
            Completed or abandoned dreams live here. Restore any of them with a click; their wiki,
            fragments, and todos come back intact.
          </p>
        </div>
      </header>

      <div className="fn-archive-toolbar">
        <label className="fn-search max-w-none">
          <Search size={14} className="fn-search-icon" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search archived dreams..."
            className="fn-search-input"
          />
        </label>
        <div className="fn-chip-row">
          <button
            type="button"
            className="fn-chip"
            data-active={status === 'all'}
            onClick={() => setStatus('all')}
          >
            All archived
          </button>
          {['completed', 'abandoned'].map(item => (
            <button
              key={item}
              type="button"
              className="fn-chip"
              data-active={status === item}
              onClick={() => setStatus(item)}
            >
              <span className="gly">{statusMap[item].glyph}</span> {statusMap[item].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="fn-segment">
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
          <span className="fn-mono-label">Sort</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="fn-select">
            <option value="archived">Recently archived</option>
            <option value="title">Title A-Z</option>
            <option value="status">Status</option>
            <option value="brand">Brand</option>
          </select>
        </div>
      </div>

      {view === 'list' ? (
        <div className="fn-archive-list">
          {filtered.map((item, index) => (
            <ArchiveRow
              key={item.id}
              item={item}
              index={index + 1}
              onRestore={onRestore}
              onDelete={onDelete}
              onDemoAction={onDemoAction}
            />
          ))}
        </div>
      ) : (
        <div className="fn-showcase-grid">
          {filtered.map((item, index) => (
            <ArchiveCard
              key={item.id}
              item={item}
              index={index + 1}
              onRestore={onRestore}
              onDelete={onDelete}
              onDemoAction={onDemoAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ArchiveRow({ item, index, onRestore, onDelete, onDemoAction }) {
  const isDemoFixture = String(item.id).startsWith('arch-')
  return (
    <article className="fn-archive-row">
      <div className="fn-dream-index">A{String(index).padStart(2, '0')}</div>
      <div>
        <h3>{item.title}</h3>
        <p className="fn-archive-meta">
          {brandMap[item.brand]?.label} · archived {fmtDate(item.archived)}
        </p>
      </div>
      <span className="fn-status">
        <span className="gly">{statusMap[item.status]?.glyph}</span>
        {statusMap[item.status]?.label}
      </span>
      <p className="fn-archive-reason">{item.reason}</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="fn-btn"
          onClick={() =>
            isDemoFixture
              ? onDemoAction?.('Fixture archive restore is simulated in the public preview demo.')
              : onRestore?.(item.id)
          }
        >
          Restore
        </button>
        <button
          type="button"
          className="fn-btn"
          onClick={() =>
            isDemoFixture
              ? onDemoAction?.('Fixture archive deletion is simulated in the public preview demo.')
              : onDelete?.(item.id)
          }
        >
          Delete
        </button>
      </div>
    </article>
  )
}

function ArchiveCard({ item, index, onRestore, onDelete, onDemoAction }) {
  const isDemoFixture = String(item.id).startsWith('arch-')
  return (
    <article className="fn-showcase-card">
      <div className="fn-card-meta">
        A{String(index).padStart(2, '0')} · {brandMap[item.brand]?.label}
      </div>
      <h3>{item.title}</h3>
      <p>{item.reason}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="fn-status">
          <span className="gly">{statusMap[item.status]?.glyph}</span>
          {statusMap[item.status]?.label}
        </span>
        <span className="fn-mono-num">{fmtDate(item.archived)}</span>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="fn-btn"
          onClick={() =>
            isDemoFixture
              ? onDemoAction?.('Fixture archive restore is simulated in the public preview demo.')
              : onRestore?.(item.id)
          }
        >
          Restore
        </button>
        <button
          type="button"
          className="fn-btn"
          onClick={() =>
            isDemoFixture
              ? onDemoAction?.('Fixture archive deletion is simulated in the public preview demo.')
              : onDelete?.(item.id)
          }
        >
          Delete
        </button>
      </div>
    </article>
  )
}
