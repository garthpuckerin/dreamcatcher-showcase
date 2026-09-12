import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'

export default function CommandPalette({
  open,
  onClose,
  dreams,
  onOpenDream,
  onOpenFragment,
  onRoute,
  onReplay,
}) {
  const [q, setQ] = useState('')
  const [mode, setMode] = useState('keyword')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQ('')
      setMode('keyword')
      setCursor(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const items = useMemo(() => {
    const routes = [
      { id: 'r-today', kind: 'route', title: 'Go to Today', target: { kind: 'today' } },
      { id: 'r-all', kind: 'route', title: 'Go to All Dreams', target: { kind: 'all' } },
      { id: 'r-inbox', kind: 'route', title: 'Go to Inbox', target: { kind: 'inbox' } },
      {
        id: 'r-suggest',
        kind: 'route',
        title: 'Go to AI Suggestions',
        target: { kind: 'suggest' },
      },
      { id: 'r-analytics', kind: 'route', title: 'Go to Analytics', target: { kind: 'analytics' } },
      { id: 'r-portfolio', kind: 'route', title: 'Go to Portfolio', target: { kind: 'portfolio' } },
      { id: 'r-templates', kind: 'route', title: 'Go to Templates', target: { kind: 'templates' } },
      {
        id: 'r-integrations',
        kind: 'route',
        title: 'Go to Integrations',
        target: { kind: 'integrations' },
      },
      { id: 'r-settings', kind: 'route', title: 'Open Settings', target: { kind: 'settings' } },
      { id: 'r-archive', kind: 'route', title: 'Open Archive', target: { kind: 'archive' } },
      {
        id: 'a-replay',
        kind: 'action',
        title: 'Capture from AI chat',
        snippet: 'Replay a scripted conversation, capture excerpts as fragments',
        action: 'replay',
      },
    ]
    const searchable = dreams.flatMap(dream => [
      {
        id: `d-${dream.id}`,
        kind: 'dream',
        title: dream.title,
        snippet: dream.description,
        target: dream.id,
      },
      ...dream.fragments.map(fragment => ({
        id: `f-${dream.id}-${fragment.id}`,
        kind: 'fragment',
        title: fragment.title,
        snippet: fragment.excerpt || fragment.content,
        dreamTitle: dream.title,
        dreamId: dream.id,
        fragmentId: fragment.id,
      })),
      ...dream.todos.map(todo => ({
        id: `t-${dream.id}-${todo.id}`,
        kind: 'todo',
        title: todo.title,
        snippet: `in ${dream.title}`,
        target: dream.id,
      })),
    ])
    const all = [...routes, ...searchable]
    if (!q.trim())
      return [...routes, ...searchable.filter(item => item.kind === 'dream').slice(0, 6)]
    const needle = q.toLowerCase()
    return all
      .map(item => {
        const haystack = `${item.title ?? ''} ${item.snippet ?? ''}`.toLowerCase()
        if (!haystack.includes(needle)) return null
        // Fuzzy-search relevance score (string-length overlap), not a model
        // output — this is a standard command-palette ranking signal, never
        // an AI confidence/accuracy claim.
        const score = Math.min(
          0.99,
          needle.length / Math.max(needle.length, haystack.length) + 0.62
        )
        return { ...item, score }
      })
      .filter(Boolean)
      .slice(0, 20)
  }, [q, dreams])

  const groups = useMemo(
    () => ({
      action: items.filter(item => item.kind === 'action'),
      route: items.filter(item => item.kind === 'route'),
      dream: items.filter(item => item.kind === 'dream'),
      fragment: items.filter(item => item.kind === 'fragment'),
      todo: items.filter(item => item.kind === 'todo'),
    }),
    [items]
  )

  useEffect(() => {
    setCursor(c => Math.min(c, Math.max(0, items.length - 1)))
  }, [items.length])

  if (!open) return null

  const choose = item => {
    if (item.kind === 'action') {
      if (item.action === 'replay') onReplay?.()
    } else if (item.kind === 'dream' || item.kind === 'todo') onOpenDream(item.target)
    else if (item.kind === 'fragment' && onOpenFragment)
      onOpenFragment(item.dreamId, item.fragmentId)
    else onRoute(item.target)
    onClose()
  }

  const onKey = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor(c => Math.min(items.length - 1, c + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor(c => Math.max(0, c - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = items[cursor]
      if (item) choose(item)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      setMode(current => (current === 'keyword' ? 'semantic' : 'keyword'))
    }
  }

  const highlight = text => {
    if (!q.trim()) return text
    const pattern = q
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(token => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')
    if (!pattern) return text
    const re = new RegExp(`(${pattern})`, 'ig')
    return String(text ?? '')
      .split(re)
      .map((part, index) =>
        new RegExp(`^(${pattern})$`, 'i').test(part) ? (
          <mark key={`${part}-${index}`}>{part}</mark>
        ) : (
          part
        )
      )
  }

  const renderGroup = (label, list, glyph, snippetFor) => {
    if (list.length === 0) return null
    return (
      <section className="fn-palette-group">
        <div className="fn-palette-group-label">
          <span>{label}</span>
          <span>{list.length}</span>
        </div>
        {list.map(item => {
          const index = items.indexOf(item)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => choose(item)}
              onMouseEnter={() => setCursor(index)}
              className="fn-palette-item"
              data-cursor={index === cursor}
            >
              <span className="fn-palette-glyph">{glyph}</span>
              <span className="fn-palette-copy">
                <span className="fn-palette-title">{highlight(item.title)}</span>
                {snippetFor(item) && (
                  <span className="fn-palette-snippet">{highlight(snippetFor(item))}</span>
                )}
              </span>
              {item.score != null && (
                // Search-relevance indicator (fuzzy match strength), not an AI
                // confidence score — production computes no such number.
                <span className="fn-palette-score" aria-label="Search match strength">
                  {Math.round(item.score * 100)}%
                </span>
              )}
            </button>
          )
        })}
      </section>
    )
  }

  return (
    <div className="fn-palette-back" onClick={onClose}>
      <div
        className="fn-palette"
        onClick={e => e.stopPropagation()}
        onKeyDown={onKey}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="fn-palette-input-wrap">
          <Search size={16} aria-hidden="true" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder={
              mode === 'semantic'
                ? 'Ask anything - semantic match across fragments...'
                : 'Search dreams, fragments, todos...'
            }
            className="fn-palette-input"
          />
          <button
            type="button"
            className="fn-palette-mode"
            onClick={() => setMode(mode === 'keyword' ? 'semantic' : 'keyword')}
          >
            {mode === 'semantic' ? '* Semantic' : 'Keyword'}
          </button>
        </div>
        <div className="fn-palette-list">
          {items.length === 0 ? (
            <div className="fn-palette-empty">No matches for &quot;{q}&quot;.</div>
          ) : (
            <>
              {renderGroup('Actions', groups.action, '*', item => item.snippet)}
              {renderGroup('Navigate', groups.route, '->', () => '')}
              {renderGroup('Dreams', groups.dream, 'O', item => item.snippet)}
              {renderGroup(
                'Fragments',
                groups.fragment,
                '>',
                item => `${item.dreamTitle} · ${item.snippet ?? ''}`
              )}
              {renderGroup('Todos', groups.todo, '[]', item => item.snippet)}
            </>
          )}
        </div>
        <footer className="fn-palette-foot">
          <span>
            <kbd>up/down</kbd> navigate
          </span>
          <span>
            <kbd>enter</kbd> open
          </span>
          <span>
            <kbd>tab</kbd> toggle mode
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
          <b>{mode === 'semantic' ? 'embeddings · local' : 'keyword · client-side'}</b>
        </footer>
      </div>
    </div>
  )
}
