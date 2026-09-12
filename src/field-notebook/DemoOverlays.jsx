import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X, Sparkles, Send, Wand2 } from 'lucide-react'
import { BRANDS, STATUSES, AI_SUGGESTIONS } from './fixtures'
import { deriveInsights } from './insights'

export function AIAssistant({ open, dream, dreams = [], onClose, onOpenDream, onDemoAction }) {
  const [tab, setTab] = useState('ask')
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setTab('ask')
    setPrompt('')
    setMessages([
      {
        role: 'assistant',
        text: dream
          ? `Here for "${dream.title}". I can summarize, derive todos, find related fragments, or scan for scope drift.`
          : 'Workspace mode. I can prioritize the week, triage captures, or surface cross-dream patterns.',
      },
    ])
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open, dream])

  if (!open) return null

  const visibleMessages =
    messages.length > 0
      ? messages
      : [
          {
            role: 'assistant',
            text: dream
              ? `Here for "${dream.title}". I can summarize, derive todos, find related fragments, or scan for scope drift.`
              : 'Workspace mode. I can prioritize the week, triage captures, or surface cross-dream patterns.',
          },
        ]

  const send = text => {
    const body = (text ?? prompt).trim()
    if (!body) return
    setMessages(prev => [...prev, { role: 'user', text: body }])
    setPrompt('')
    window.setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: dream
            ? `For "${dream.title}", I would promote the strongest fragment to the wiki, then convert the next unresolved implementation note into a dated todo.`
            : 'Across the workspace: file the Inbox captures first, then run a quick retrospective on Memory & Embeddings before adding new work.',
        },
      ])
    }, 350)
  }

  const quickPrompts = dream
    ? ['Break latest fragment into todos', 'Find blockers', 'Regenerate summary']
    : ['What should I work on next?', 'Audit stale dreams', 'Generate weekly digest']

  const suggestions = dream
    ? [
        {
          id: 'd-1',
          title: 'Promote stale fragment to wiki',
          detail:
            'A recent fragment contains durable implementation context that belongs in the dream wiki.',
        },
        {
          id: 'd-2',
          title: 'Add one scope-control todo',
          detail:
            'The current todo list is missing a decision checkpoint before the next build phase.',
        },
      ]
    : AI_SUGGESTIONS

  return (
    <aside className="fn-ai-panel" role="dialog" aria-modal="true" aria-label="AI Assistant">
      <header className="fn-ai-head">
        <div>
          <h2>AI Assistant</h2>
          <p>{dream ? `Context: ${dream.title}` : 'Context: workspace'}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="fn-icon-btn"
          aria-label="Close AI Assistant"
        >
          <X size={15} />
        </button>
      </header>

      <nav className="fn-ai-tabs">
        {[
          ['ask', 'Ask'],
          ['actions', 'Quick actions'],
          ['insights', 'Insights'],
        ].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} data-active={tab === id}>
            {label}
          </button>
        ))}
      </nav>

      <div className="fn-ai-body fn-scroll">
        {tab === 'ask' && (
          <>
            {visibleMessages.map((message, index) => (
              <article key={index} className="fn-ai-message" data-role={message.role}>
                <div className="label">{message.role === 'assistant' ? 'Assistant' : 'You'}</div>
                <p>{message.text}</p>
              </article>
            ))}
          </>
        )}

        {tab === 'actions' && (
          <div className="fn-ai-stack">
            {suggestions.map(item => (
              <article key={item.id} className="fn-ai-card">
                <div className="fn-ai-card-meta">
                  <Sparkles size={12} />
                  Suggested action
                </div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <div className="fn-ai-card-actions">
                  <button
                    type="button"
                    className="fn-btn fn-btn-primary"
                    onClick={() => {
                      onDemoAction?.(
                        `"${item.title}" is a simulated AI action in the public preview.`
                      )
                      setMessages(prev => [
                        ...prev,
                        {
                          role: 'assistant',
                          text: `Queued preview action: "${item.title}". In production this would update the dream wiki, todos, or review queue after confirmation.`,
                        },
                      ])
                      setTab('ask')
                    }}
                  >
                    Apply
                  </button>
                  {item.dreamId && (
                    <button
                      type="button"
                      className="fn-btn"
                      onClick={() => {
                        onOpenDream(item.dreamId)
                        onClose()
                      }}
                    >
                      Open Dream
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === 'insights' && (
          <div className="fn-ai-stack">
            {/* Same derived list Analytics renders — the assistant can never
                quote a number the screen beside it does not. */}
            {deriveInsights(dreams).map(item => (
              <article key={item.kind} className="fn-ai-card">
                <div className="fn-ai-card-meta">{item.kind}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      {tab === 'ask' && (
        <footer className="fn-ai-foot">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={dream ? `Ask about "${dream.title}"...` : 'Ask about the workspace...'}
          />
          <div className="fn-ai-prompt-row">
            {quickPrompts.map(item => (
              <button key={item} type="button" onClick={() => send(item)}>
                {item}
              </button>
            ))}
          </div>
          <button type="button" className="fn-btn fn-btn-primary" onClick={() => send()}>
            <Send size={13} /> Send
          </button>
        </footer>
      )}
    </aside>
  )
}

export function NewDreamModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [brand, setBrand] = useState('product')
  const [status, setStatus] = useState('idea')
  const [tags, setTags] = useState('')
  const titleRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setTitle('')
    setDescription('')
    setBrand('product')
    setStatus('idea')
    setTags('')
    requestAnimationFrame(() => titleRef.current?.focus())
  }, [open])

  if (!open) return null

  const submit = e => {
    e.preventDefault()
    onCreate({
      title: title.trim() || 'Untitled Dream',
      description: description.trim() || 'Start shaping this dream from captured fragments.',
      brand,
      status,
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
    })
  }

  return (
    <div className="fn-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        className="fn-modal"
        role="dialog"
        aria-modal="true"
        aria-label="New Dream"
        onSubmit={submit}
        onMouseDown={e => e.stopPropagation()}
      >
        <header className="fn-modal-head">
          <div>
            <h2>New Dream</h2>
            <p>Seed a portfolio-ready project workspace.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="fn-icon-btn"
            aria-label="Close New Dream"
          >
            <X size={15} />
          </button>
        </header>

        <label className="fn-field">
          <span>Title</span>
          <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} />
        </label>
        <label className="fn-field">
          <span>Description</span>
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
        </label>
        <div className="fn-field-grid">
          <label className="fn-field">
            <span>Brand</span>
            <select value={brand} onChange={e => setBrand(e.target.value)}>
              {BRANDS.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="fn-field">
            <span>Status</span>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="fn-field">
          <span>Tags</span>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="demo, portfolio"
          />
        </label>

        <footer className="fn-modal-actions">
          <button type="button" className="fn-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="fn-btn fn-btn-primary">
            <Wand2 size={13} /> Create Dream
          </button>
        </footer>
      </form>
    </div>
  )
}

export function NewFragmentModal({ open, dream, onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('Manual')
  const [content, setContent] = useState('')
  const titleRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setTitle('')
    setSource('Manual')
    setContent('')
    requestAnimationFrame(() => titleRef.current?.focus())
  }, [open])

  if (!open || !dream) return null

  const submit = e => {
    e.preventDefault()
    onCreate({
      title: title.trim() || 'New fragment',
      source,
      content: content.trim() || 'Captured note waiting for triage.',
    })
  }

  return (
    <div className="fn-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        className="fn-modal"
        role="dialog"
        aria-modal="true"
        aria-label="New Fragment"
        onSubmit={submit}
        onMouseDown={e => e.stopPropagation()}
      >
        <header className="fn-modal-head">
          <div>
            <h2>New Fragment</h2>
            <p>{dream.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="fn-icon-btn"
            aria-label="Close New Fragment"
          >
            <X size={15} />
          </button>
        </header>

        <label className="fn-field">
          <span>Title</span>
          <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} />
        </label>
        <label className="fn-field">
          <span>Source</span>
          <input value={source} onChange={e => setSource(e.target.value)} />
        </label>
        <label className="fn-field">
          <span>Content</span>
          <textarea value={content} onChange={e => setContent(e.target.value)} />
        </label>

        <footer className="fn-modal-actions">
          <button type="button" className="fn-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="fn-btn fn-btn-primary">
            Create Fragment
          </button>
        </footer>
      </form>
    </div>
  )
}

export function FragmentReader({ fragment, dream, onClose }) {
  if (!fragment || !dream) return null
  return (
    <div className="fn-reader-overlay" onClick={onClose}>
      <div
        className="fn-reader"
        role="dialog"
        aria-modal="true"
        aria-label="Fragment Reader"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="fn-reader-close"
          onClick={onClose}
          aria-label="Close Fragment Reader"
        >
          <X size={15} />
        </button>
        <div className="fn-reader-eyebrow">
          Fragment · <span>{dream.title}</span> · {fragment.source}
        </div>
        <h2 className="fn-reader-title">{fragment.title}</h2>
        <div className="fn-reader-content">{fragment.content || fragment.excerpt}</div>
        {fragment.features?.length > 0 && (
          <div className="fn-reader-features">
            {fragment.features.map(feature => (
              <span key={feature}>{feature}</span>
            ))}
          </div>
        )}
        <div className="fn-reader-source">
          <span>
            {fragment.date
              ? new Date(fragment.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })
              : 'Captured'}
          </span>
          <span>id · F{fragment.id}</span>
        </div>
      </div>
    </div>
  )
}

export const ONBOARDING_KEY = 'fn:onboarding:v1'

// The tour narrates whatever shell the visitor actually has. Below 900px the
// rail does not exist (bottom tab bar instead) and Settings' sidebar nav is a
// native section picker; below 1024px the dream-detail "On this page" rail is
// hidden. Steps are chosen from those facts at open time, so a phone never
// gets a spotlight on a display:none element — the companion-surface rule
// that guided tours skip steps narrating surfaces the device doesn't show.
const TOUR_MOBILE_QUERY = '(max-width: 900px)'
const TOUR_DETAIL_RAIL_HIDDEN_QUERY = '(max-width: 1024px)'

function matches(query) {
  return typeof window !== 'undefined' && window.matchMedia(query).matches
}

function buildTourSteps() {
  const mobile = matches(TOUR_MOBILE_QUERY)
  const detailRailHidden = matches(TOUR_DETAIL_RAIL_HIDDEN_QUERY)
  return [
    mobile
      ? {
          target: '[data-tour="fn-mtab"]',
          title: 'Companion tabs',
          body: 'Today, Dreams, and Inbox travel with you on the phone. "More" holds the rest — authoring surfaces are marked "desk" and open on desktop.',
          route: { kind: 'today' },
          position: 'top',
        }
      : {
          target: '[data-tour="fn-rail"]',
          title: 'Workspace map',
          body: 'The rail keeps workspace views, brands, tools, recent dreams, and account controls visible without leaving the notebook.',
          route: { kind: 'today' },
          position: 'right',
        },
    {
      target: '[data-tour="fn-search"]',
      title: 'Command search',
      body: 'Search opens the command palette for dreams, fragments, todos, and fast route switching.',
      route: { kind: 'today' },
      position: 'bottom',
    },
    {
      target: '[data-tour="fn-new-dream"]',
      title: 'Create from anywhere',
      body: 'New Dream seeds a portfolio-ready workspace while fragment capture appears inside a dream detail view.',
      route: { kind: 'today' },
      position: 'bottom',
    },
    {
      target: '[data-tour="fn-dreams-board"]',
      title: 'All Dreams',
      body: 'The aggregate view supports status, brand, sorting, and list/card switching without shifting the page header.',
      route: { kind: 'all' },
      position: 'top',
    },
    {
      target: '[data-tour="fn-dream-card"]',
      title: mobile ? 'Dream cards' : 'Dream rows',
      body: 'Each dream summarizes progress, collaborators, fragments, todos, status, and brand before you open the wiki.',
      route: { kind: 'all' },
      position: mobile ? 'bottom' : 'right',
    },
    ...(detailRailHidden
      ? []
      : [
          {
            target: '[data-tour="fn-wiki-rail"]',
            title: 'Wiki sections',
            body: 'The detail rail tracks scroll position across wiki, documents, versions, retrospective, team, and timeline sections.',
            route: { kind: 'dream', id: 1 },
            position: 'left',
          },
        ]),
    {
      target: '[data-tour="fn-state-controls"]',
      title: 'Dream lifecycle',
      body: 'State controls let the demo pause, complete, archive, restore, and delete local dreams without pretending to hit production services.',
      route: { kind: 'dream', id: 1 },
      position: mobile ? 'bottom' : 'left',
    },
    {
      target: mobile ? '[data-tour="fn-settings-jump"]' : '[data-tour="fn-settings-nav"]',
      title: 'Production surfaces',
      body: 'Settings shows the intended production contract: appearance, workspace policy, AI, GitHub, integrations, export, and privacy.',
      route: { kind: 'settings' },
      position: mobile ? 'bottom' : 'right',
    },
  ]
}

export function FieldNotebookTour({ open, onClose, onRoute }) {
  const [index, setIndex] = useState(0)
  const [targetRect, setTargetRect] = useState(null)

  // Re-derived on every open so a rotation or resize between tours picks
  // the right shell.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const steps = useMemo(() => buildTourSteps(), [open])

  const step = steps[index]
  const complete = useCallback(() => {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, 'done')
    } catch {
      /* no-op */
    }
    onClose?.()
  }, [onClose])

  useEffect(() => {
    if (!open) {
      setIndex(0)
      setTargetRect(null)
    }
  }, [open])

  useEffect(() => {
    if (!open || !step) return
    if (step.route) onRoute?.(step.route)
  }, [open, onRoute, step])

  useEffect(() => {
    if (!open || !step) return undefined
    let raf = null
    let timeout = null

    const measure = () => {
      const target = document.querySelector(step.target)
      if (!target) {
        timeout = window.setTimeout(measure, 80)
        return
      }
      target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      raf = window.requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) {
          // Target is in the DOM but not rendered (display:none at this
          // viewport). Never spotlight nothing: skip forward, or finish.
          setIndex(current => (current >= steps.length - 1 ? current : current + 1))
          if (index >= steps.length - 1) complete()
          return
        }
        setTargetRect({
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        })
      })
    }

    timeout = window.setTimeout(measure, 90)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)

    return () => {
      if (raf != null) window.cancelAnimationFrame(raf)
      if (timeout != null) window.clearTimeout(timeout)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open, step, index, steps.length, complete])

  useEffect(() => {
    if (!open) return undefined
    const onKey = event => {
      if (event.key === 'Escape') complete()
      if (event.key === 'ArrowRight') setIndex(current => Math.min(steps.length - 1, current + 1))
      if (event.key === 'ArrowLeft') setIndex(current => Math.max(0, current - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [complete, open, steps.length])

  if (!open || !step) return null

  const tooltipStyle = targetRect ? getTourTooltipStyle(step.position, targetRect) : {}
  const spotlightStyle = targetRect
    ? {
        top: targetRect.top - 8,
        left: targetRect.left - 8,
        width: targetRect.width + 16,
        height: targetRect.height + 16,
      }
    : null
  const isLast = index === steps.length - 1

  return (
    <div className="fn-tour-layer" role="dialog" aria-modal="true" aria-label="Field Notebook tour">
      <div className="fn-tour-scrim" />
      {spotlightStyle && <div className="fn-tour-spotlight" style={spotlightStyle} />}
      <article className="fn-tour-card" style={tooltipStyle}>
        <div className="fn-tour-kicker">
          Field Notebook tour
          <span>
            {index + 1}/{steps.length}
          </span>
        </div>
        <h2>{step.title}</h2>
        <p>{step.body}</p>
        <footer>
          <button type="button" className="fn-btn fn-btn-ghost" onClick={complete}>
            Skip
          </button>
          <div className="fn-tour-actions">
            {index > 0 && (
              <button
                type="button"
                className="fn-btn"
                onClick={() => setIndex(current => Math.max(0, current - 1))}
              >
                Back
              </button>
            )}
            <button
              type="button"
              className="fn-btn fn-btn-primary"
              onClick={() => {
                if (isLast) complete()
                else setIndex(current => current + 1)
              }}
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </footer>
      </article>
    </div>
  )
}

function getTourTooltipStyle(position, rect) {
  const gap = 14
  const margin = 16
  const width = 344
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
  const maxLeft = Math.max(margin, window.innerWidth - width - margin)
  const fitX = value => clamp(value, margin, maxLeft)
  const fitY = value => clamp(value, margin, Math.max(margin, window.innerHeight - 230 - margin))
  const base = {
    width,
    maxWidth: `calc(100vw - ${margin * 2}px)`,
  }

  switch (position) {
    case 'left':
      return { ...base, top: fitY(rect.top), left: fitX(rect.left - width - gap) }
    case 'right':
      return { ...base, top: fitY(rect.top), left: fitX(rect.right + gap) }
    case 'top':
      return { ...base, top: fitY(rect.top - 230 - gap), left: fitX(rect.left) }
    case 'bottom':
    default:
      return { ...base, top: fitY(rect.bottom + gap), left: fitX(rect.left) }
  }
}

export function useStoredRoute(defaultRoute) {
  const [route, setRoute] = useState(() => {
    try {
      const raw = window.localStorage.getItem('fn:route:v1')
      return raw ? JSON.parse(raw) : defaultRoute
    } catch {
      return defaultRoute
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem('fn:route:v1', JSON.stringify(route))
    } catch {
      /* no-op */
    }
  }, [route])

  return [route, setRoute]
}

export function useWorkspaceCounts(dreams) {
  return useMemo(
    () => ({
      total: dreams.length,
      fragments: dreams.reduce((sum, dream) => sum + dream.fragments.length, 0),
      openTodos: dreams.reduce(
        (sum, dream) => sum + dream.todos.filter(todo => !todo.done).length,
        0
      ),
      active: dreams.filter(dream => ['in-progress', 'planning'].includes(dream.status)).length,
    }),
    [dreams]
  )
}
