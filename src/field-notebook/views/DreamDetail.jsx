import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { COLLABORATORS, DOCUMENTS, RETROS, STATUSES, VERSIONS } from '../fixtures'
import { statusMap, brandMap, fmtDate, fmtRel, dueLabel, dueTone } from '../helpers'

const DEMO_PRESENCE_TOOLTIP =
  'Demo presence indicator. In production, this reflects live collaborator activity.'

export default function DreamDetail({
  dream,
  onBack,
  onToggleTodo,
  onUpdateStatus,
  onArchive,
  onDelete,
  onOpenFragment,
  onOpenAI,
  onDemoAction,
}) {
  const [activeAnchor, setActiveAnchor] = useState('overview')
  const sectionRefs = useRef({})
  const status = statusMap[dream.status]
  const brand = brandMap[dream.brand]
  const done = dream.todos.filter(t => t.done).length
  const open = dream.todos.length - done
  const docs = DOCUMENTS[dream.id] ?? []
  const versions = VERSIONS[dream.id] ?? []
  const retros = RETROS[dream.id] ?? []
  const collaborators = COLLABORATORS[dream.id] ?? [
    {
      id: 'u-demo',
      name: 'Demo User',
      initials: 'DU',
      role: 'Owner',
      online: true,
      color: 'violet',
    },
  ]
  const timeline = [...dream.fragments].sort((a, b) => new Date(b.date) - new Date(a.date))
  const anchors = useMemo(
    () => [
      ['overview', 'Overview', '00'],
      ['summary', 'AI Summary', '01'],
      ['wiki', 'Wiki', '02'],
      ['todos', 'Todos', open],
      ['fragments', 'Fragments', dream.fragments.length],
      ['documents', 'Documents', docs.length],
      ['versions', 'Versions', versions.length],
      ['retro', 'Retrospective', retros.length],
      ['collaborators', 'Team', collaborators.length],
      ['timeline', 'Timeline', '09'],
    ],
    [
      collaborators.length,
      docs.length,
      dream.fragments.length,
      open,
      retros.length,
      versions.length,
    ]
  )

  const setSectionRef = useCallback(
    id => element => {
      if (element) sectionRefs.current[id] = element
      else delete sectionRefs.current[id]
    },
    []
  )

  useEffect(() => {
    setActiveAnchor('overview')
    const firstSection = sectionRefs.current[anchors[0]?.[0]]
    const scroller = firstSection?.closest('.fn-scroll')
    let frame = null

    const readActiveSection = () => {
      frame = null
      const rootTop = scroller?.getBoundingClientRect().top ?? 0
      const rootHeight = scroller?.clientHeight ?? window.innerHeight
      const marker = rootTop + rootHeight * 0.34
      const scrollBottom = scroller
        ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4
        : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4

      if (scrollBottom) {
        setActiveAnchor(anchors[anchors.length - 1][0])
        return
      }

      const current = anchors
        .map(([id]) => [id, sectionRefs.current[id]])
        .filter(([, element]) => element)
        .reduce((active, [id, element]) => {
          const top = element.getBoundingClientRect().top
          return top <= marker ? id : active
        }, anchors[0][0])

      setActiveAnchor(current)
    }

    const scheduleRead = () => {
      if (frame == null) frame = window.requestAnimationFrame(readActiveSection)
    }

    scheduleRead()
    const target = scroller ?? window
    target.addEventListener('scroll', scheduleRead, { passive: true })
    window.addEventListener('resize', scheduleRead)

    return () => {
      if (frame != null) window.cancelAnimationFrame(frame)
      target.removeEventListener('scroll', scheduleRead)
      window.removeEventListener('resize', scheduleRead)
    }
  }, [dream.id, anchors])

  const scrollToSection = useCallback(id => {
    setActiveAnchor(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <article className="fn-detail-grid prototype-detail">
      <div className="fn-detail-main">
        <section id="overview" ref={setSectionRef('overview')} className="fn-detail-overview">
          <header className="fn-detail-head">
            <div>
              <button type="button" className="fn-back-link" onClick={onBack}>
                ← All Dreams
              </button>
              <h1 className="fn-detail-title">{dream.title}</h1>
              <p className="fn-detail-sub">{dream.description}</p>
            </div>
            <div className="fn-detail-actions">
              <div
                className="fn-avatar-stack"
                aria-label={`${collaborators.length} collaborators. ${DEMO_PRESENCE_TOOLTIP}`}
                title={DEMO_PRESENCE_TOOLTIP}
              >
                {collaborators.slice(0, 3).map(person => (
                  <span key={person.id} title={`${person.name} · ${person.role}`}>
                    {person.initials}
                  </span>
                ))}
              </div>
              <button type="button" className="fn-btn" onClick={onOpenAI}>
                * AI Assistant
              </button>
              <DreamStateControls
                dream={dream}
                onUpdateStatus={onUpdateStatus}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            </div>
          </header>

          <dl className="fn-detail-meta-card">
            <dt>Status</dt>
            <dd>
              <span className="fn-status">
                <span className="gly">{status?.glyph}</span>
                {status?.label}
              </span>
            </dd>
            <dt>Brand</dt>
            <dd>{brand?.label}</dd>
            <dt>Created</dt>
            <dd>{fmtDate(dream.created)}</dd>
            <dt>Updated</dt>
            <dd>
              {fmtDate(dream.updated)} · {fmtRel(dream.updated)}
            </dd>
            <dt>Fragments</dt>
            <dd>{dream.fragments.length}</dd>
            <dt>Todos</dt>
            <dd>
              {done} done · {open} open
            </dd>
            <dt>Tags</dt>
            <dd>{dream.tags.map(tag => `#${tag}`).join('  ')}</dd>
          </dl>
        </section>

        <DetailSection
          ref={setSectionRef('summary')}
          id="summary"
          n="01"
          title="AI Summary"
          actions={['↻ Regenerate', 'Open assistant →']}
          onAction={action => {
            if (action.includes('assistant')) onOpenAI?.()
            else onDemoAction?.('AI summary regeneration is simulated in the public preview.')
          }}
        >
          <div className="fn-summary-card" data-eyebrow="AI · Assistant">
            <p>{dream.summary}</p>
            <div className="meta">
              <span>GENERATED · {fmtRel(dream.updated)}</span>
              <span>{dream.fragments.length} sources</span>
              <span>· ⌘⇧S to copy</span>
            </div>
          </div>
        </DetailSection>

        <DetailSection
          ref={setSectionRef('wiki')}
          id="wiki"
          n="02"
          title="Wiki"
          actions={['+ Paragraph', '+ Heading', '⇩ Export']}
          onAction={() =>
            onDemoAction?.(
              'Wiki editing and export are shown as product surfaces in this public preview.'
            )
          }
        >
          <div className="fn-prose fn-detail-prose">
            {dream.wiki.map((block, index) => {
              if (block.kind === 'h') {
                return (
                  <h3 key={index} className="fn-wiki-heading">
                    {block.text}
                  </h3>
                )
              }
              if (block.kind === 'pull') {
                return (
                  <blockquote key={index} className="fn-pull">
                    {block.text}
                  </blockquote>
                )
              }
              if (block.kind === 'ai') {
                return (
                  <aside
                    key={index}
                    className="fn-summary-card fn-inline-ai"
                    data-eyebrow="AI · Insight"
                  >
                    <p>{block.text}</p>
                  </aside>
                )
              }
              return <p key={index}>{block.text}</p>
            })}
          </div>
        </DetailSection>

        <DetailSection
          ref={setSectionRef('todos')}
          id="todos"
          n="03"
          title="Todos"
          meta={`${open} open · ${done} done`}
        >
          <ul className="fn-detail-todos">
            {dream.todos.map(todo => (
              <li key={todo.id} className="fn-todo" data-done={todo.done}>
                <button
                  type="button"
                  onClick={() => onToggleTodo?.(todo.id)}
                  className="fn-checkbox"
                  data-checked={todo.done}
                  aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {todo.done && <Check size={11} strokeWidth={3} />}
                </button>
                <span className="fn-todo-title">{todo.title}</span>
                <span className="fn-mono-label">{todo.category}</span>
                <span className={['fn-mono-meta', dueTone(todo.deadline)].join(' ')}>
                  {dueLabel(todo.deadline)}
                </span>
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection
          ref={setSectionRef('fragments')}
          id="fragments"
          n="04"
          title="Fragments"
          meta={`${dream.fragments.length} captured`}
        >
          <div className="fn-frag-grid">
            {dream.fragments.map(fragment => (
              <button
                key={fragment.id}
                type="button"
                className="fn-frag-card"
                onClick={() => onOpenFragment?.(fragment.id)}
              >
                <div className="head">
                  <span>{fragment.source}</span>
                  <span className="fn-mono-num">{fmtDate(fragment.date)}</span>
                </div>
                <h3 className="title">{fragment.title}</h3>
                <p className="excerpt">{fragment.excerpt}</p>
              </button>
            ))}
          </div>
        </DetailSection>

        <DetailSection
          ref={setSectionRef('documents')}
          id="documents"
          n="05"
          title="Documents"
          meta={`${docs.length} files`}
          actions={['+ Upload']}
          onAction={() =>
            onDemoAction?.(
              'Document upload and parsing are scaffolded; the public preview uses fixture documents.'
            )
          }
        >
          {docs.length > 0 && (
            <div className="fn-docs-grid">
              {docs.map(doc => (
                <article key={doc.id} className="fn-doc-card">
                  <div className="kind">{doc.kind}</div>
                  <div className="name">{doc.name}</div>
                  <div className="meta">
                    <span>
                      {doc.size}
                      {doc.pages > 1 ? ` · ${doc.pages}p` : ''}
                    </span>
                    <span>{fmtDate(doc.uploaded)}</span>
                  </div>
                  {doc.extracted > 0 && (
                    <div className="fn-doc-extracted">* {doc.extracted} fragments extracted</div>
                  )}
                </article>
              ))}
            </div>
          )}
          <DocDrop onDemoAction={onDemoAction} />
        </DetailSection>

        <DetailSection
          ref={setSectionRef('versions')}
          id="versions"
          n="06"
          title="Versions"
          badge="Pro"
          actions={['+ Snapshot now', 'Branch']}
          onAction={() =>
            onDemoAction?.(
              'Version snapshots are represented with demo history; restore/branch wiring lives in production.'
            )
          }
        >
          {versions.length === 0 ? (
            <p className="fn-empty-note">
              No snapshots yet. The first manual snapshot is free; auto-snapshots happen at every
              status change.
            </p>
          ) : (
            <div className="fn-versions">
              {versions.map(version => (
                <article key={version.id} className="fn-version-row" data-current={version.current}>
                  <div className="fn-version-dot" />
                  <div>
                    <div className="fn-version-head">
                      <span className="fn-version-label">{version.label}</span>
                      {version.current && <span className="fn-version-current">Current</span>}
                    </div>
                    <p className="fn-version-note">{version.note}</p>
                    <div className="fn-version-meta">
                      <span>
                        {fmtDate(version.date)} · @{version.author}
                      </span>
                      <span className="added">+ {version.changes.added}</span>
                      <span className="removed">- {version.changes.removed}</span>
                      <span>{version.changes.frags} new fragments</span>
                    </div>
                  </div>
                  {!version.current && (
                    <div className="fn-version-actions">
                      <button
                        type="button"
                        className="fn-btn fn-btn-ghost"
                        onClick={() =>
                          onDemoAction?.(
                            'Version diff is a production-bound action in this public preview.'
                          )
                        }
                      >
                        Diff
                      </button>
                      <button
                        type="button"
                        className="fn-btn fn-btn-ghost"
                        onClick={() =>
                          onDemoAction?.('Version restore is disabled in the public preview demo.')
                        }
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        className="fn-btn fn-btn-ghost"
                        onClick={() =>
                          onDemoAction?.(
                            'Version branching is represented here and wired in the production build.'
                          )
                        }
                      >
                        Branch
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </DetailSection>

        <DetailSection
          ref={setSectionRef('retro')}
          id="retro"
          n="07"
          title="Retrospective"
          badge="Pro"
          actions={['Start · Stop · Continue', '+ Run retro']}
          onAction={() =>
            onDemoAction?.(
              'Retrospective generation is shown with demo data in the public preview.'
            )
          }
        >
          {retros.length === 0 ? (
            <p className="fn-empty-note">
              No retros yet. The AI assistant suggests one after every 10 fragments or 30 days of
              activity.
            </p>
          ) : (
            retros.map(retro => <Retro key={retro.id} retro={retro} />)
          )}
        </DetailSection>

        <DetailSection
          ref={setSectionRef('collaborators')}
          id="collaborators"
          n="08"
          title="Team"
          badge="Teams"
          actions={['+ Invite', 'Share link']}
          onAction={() =>
            onDemoAction?.('Team invite/share actions are simulated for portfolio evaluation.')
          }
        >
          <div className="fn-collab-list">
            {collaborators.map(person => (
              <article key={person.id} className="fn-collab-row">
                <Avatar person={person} />
                <div className="fn-collab-name">{person.name}</div>
                <div className="fn-collab-role">{person.role}</div>
                <div
                  className="fn-collab-status"
                  data-online={person.online}
                  title={DEMO_PRESENCE_TOOLTIP}
                  aria-label={`${person.name} is ${
                    person.online ? 'online now' : 'offline'
                  }. ${DEMO_PRESENCE_TOOLTIP}`}
                >
                  {person.online ? '● online now' : '○ offline'}
                </div>
              </article>
            ))}
          </div>
        </DetailSection>

        <DetailSection
          ref={setSectionRef('timeline')}
          id="timeline"
          n="09"
          title="Timeline"
          actions={['Download PDF']}
          onAction={() =>
            onDemoAction?.('Timeline export is a production-bound action in this public preview.')
          }
        >
          <div className="fn-timeline">
            {timeline.map(fragment => (
              <article key={fragment.id} className="fn-tl-item">
                <div className="fn-tl-date">
                  {fmtDate(fragment.date)} · {fragment.source.split(' · ')[0]}
                </div>
                <h3 className="fn-tl-title">{fragment.title}</h3>
                <p className="fn-tl-body">{fragment.excerpt}</p>
              </article>
            ))}
          </div>
        </DetailSection>
      </div>

      <aside className="fn-detail-rail" data-tour="fn-wiki-rail">
        <div className="fn-detail-rail-label">On this page</div>
        <nav className="fn-anchor-list">
          {anchors.map(([id, label, n]) => (
            <a
              key={id}
              className="fn-anchor"
              data-active={activeAnchor === id}
              href={`#${id}`}
              onClick={event => {
                event.preventDefault()
                scrollToSection(id)
              }}
            >
              <span className="label">{label}</span>
              <span className="num">{n}</span>
            </a>
          ))}
        </nav>
      </aside>
    </article>
  )
}

const DetailSection = forwardRef(function DetailSection(
  { id, n, title, meta, badge, actions, onAction, children },
  ref
) {
  return (
    <section id={id} ref={ref} className="fn-detail-section">
      <header className="fn-sec-head">
        <h2 className="fn-sec-h">
          <span className="n">{n}</span>
          {title}
          {meta && <span className="fn-sec-meta">{meta}</span>}
          {badge && <span className="tier-pill">{badge}</span>}
        </h2>
        {actions?.length > 0 && (
          <div className="fn-sec-actions">
            {actions.map(action => (
              <button
                key={action}
                type="button"
                className="fn-btn fn-btn-ghost"
                onClick={() => onAction?.(action)}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </header>
      {children}
    </section>
  )
})

function DreamStateControls({ dream, onUpdateStatus, onArchive, onDelete }) {
  const destructiveDelete = () => {
    const confirmed = window.confirm(`Delete "${dream.title}" from this demo workspace?`)
    if (confirmed) onDelete?.()
  }

  return (
    <div
      className="fn-dream-state-controls"
      aria-label="Dream state controls"
      data-tour="fn-state-controls"
    >
      <label>
        <span className="fn-mono-label">State</span>
        <select
          value={dream.status}
          onChange={event => onUpdateStatus?.(event.target.value)}
          className="fn-select"
          aria-label="Dream state"
        >
          {STATUSES.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="fn-btn" onClick={() => onUpdateStatus?.('paused')}>
        Pause
      </button>
      <button type="button" className="fn-btn" onClick={() => onUpdateStatus?.('completed')}>
        Complete
      </button>
      <button type="button" className="fn-btn" onClick={onArchive}>
        Archive
      </button>
      <button type="button" className="fn-btn fn-btn-danger" onClick={destructiveDelete}>
        Delete
      </button>
    </div>
  )
}

function DocDrop({ onDemoAction }) {
  return (
    <button
      type="button"
      className="fn-doc-drop"
      onClick={() =>
        onDemoAction?.(
          'File upload is disabled in the public preview; document parsing is production-scaffolded.'
        )
      }
    >
      <span className="glyph">↓</span>
      <span>Drop a file here, or click to browse.</span>
      <span className="types">PDF · DOCX · MD · TXT · PNG · JPG · max 25 MB</span>
    </button>
  )
}

function Retro({ retro }) {
  return (
    <article>
      <div className="fn-retro-meta">
        <span>
          {fmtDate(retro.date)} · {retro.kind}
        </span>
        <span>
          {retro.participants.length} participants · @{retro.facilitator}
        </span>
      </div>
      <div className="fn-retro-board">
        {Object.entries(retro.columns).map(([label, items]) => (
          <section key={label} className="fn-retro-col">
            <h3>
              <span>{label}</span>
              <span className="count">{items.length}</span>
            </h3>
            <ul>
              {items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="fn-retro-insight">
        <span className="ico">*</span>
        <p>
          <strong>AI insight</strong>
          {retro.aiInsight}
        </p>
      </div>
    </article>
  )
}

function Avatar({ person }) {
  return (
    <span
      className="fn-collab-avatar"
      data-color={person.color}
      data-online={person.online}
      title={`${person.name} · ${person.role}. ${DEMO_PRESENCE_TOOLTIP}`}
    >
      {person.initials}
    </span>
  )
}
