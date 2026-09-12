import { lazy, Suspense, useEffect, useMemo, useState, useCallback } from 'react'
import './theme.css'
import { DREAMS, INBOX, AI_SUGGESTIONS, USER } from './fixtures'
import { useAppearanceSettings, useStoredDreams } from './helpers'
import Rail from './Rail'
import Topbar from './Topbar'
import CommandPalette from './CommandPalette'
import AppearancePanel from './AppearancePanel'
import DemoChatReplay from './DemoChatReplay'
import {
  AIAssistant,
  FieldNotebookTour,
  FragmentReader,
  NewDreamModal,
  NewFragmentModal,
  ONBOARDING_KEY,
  useStoredRoute,
} from './DemoOverlays'
import AllDreams from './views/AllDreams'
import DreamDetail from './views/DreamDetail'
import Today from './views/Today'
import Inbox from './views/Inbox'
import Suggestions from './views/Suggestions'
import Archive from './views/Archive'
import Revisions from './views/Revisions'
import GraphView from './views/GraphView'
import {
  Analytics,
  CaseStudyComposer,
  DemoNotice,
  Integrations,
  Portfolio,
  Settings,
  TemplateAppliedNotice,
  Templates,
} from './views/ShowcaseViews'

const BuilderNotes = lazy(() => import('./views/BuilderNotes'))

const SESSION_KEY = 'fn:session:v1'

function shouldOpenOnboarding() {
  try {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(ONBOARDING_KEY) !== 'done'
  } catch {
    return false
  }
}

export default function FieldNotebookApp() {
  const [appearance, updateAppearance] = useAppearanceSettings()
  const [signedIn, setSignedIn] = useState(() => {
    try {
      if (typeof window === 'undefined') return false
      return window.localStorage.getItem(SESSION_KEY) === 'active'
    } catch {
      return false
    }
  })
  const [dreams, setDreams] = useStoredDreams(DREAMS)
  const [route, setRoute] = useStoredRoute({ kind: 'today' })
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [newDreamOpen, setNewDreamOpen] = useState(false)
  const [newFragmentOpen, setNewFragmentOpen] = useState(false)
  const [replayOpen, setReplayOpen] = useState(false)
  const [openFragmentId, setOpenFragmentId] = useState(null)
  const [appliedTemplate, setAppliedTemplate] = useState(null)
  const [demoNotice, setDemoNotice] = useState(null)
  const [tourOpen, setTourOpen] = useState(() => signedIn && shouldOpenOnboarding())

  useEffect(() => {
    const onKey = e => {
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(v => !v)
      } else if (e.key === 'Escape') {
        setPaletteOpen(false)
        setAppearanceOpen(false)
        setAiOpen(false)
        setNewDreamOpen(false)
        setNewFragmentOpen(false)
        setReplayOpen(false)
        setOpenFragmentId(null)
      } else if (isMod && e.key.toLowerCase() === '/') {
        e.preventDefault()
        setAiOpen(true)
      } else if (isMod && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setNewDreamOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const counts = useMemo(() => ({ inbox: INBOX.length, suggestions: AI_SUGGESTIONS.length }), [])
  const activeDreams = useMemo(() => dreams.filter(dream => !dream.archived), [dreams])
  const archivedDreams = useMemo(() => dreams.filter(dream => dream.archived), [dreams])

  const openDream = useCallback(id => setRoute({ kind: 'dream', id }), [setRoute])
  const notifyDemo = useCallback(message => setDemoNotice(message), [])
  const enterPreview = useCallback(() => {
    try {
      window.localStorage.setItem(SESSION_KEY, 'active')
    } catch {
      /* no-op */
    }
    setSignedIn(true)
    setRoute({ kind: 'today' })
    if (shouldOpenOnboarding()) setTourOpen(true)
  }, [setRoute])
  const signOut = useCallback(() => {
    try {
      window.localStorage.setItem(SESSION_KEY, 'signed-out')
    } catch {
      /* no-op */
    }
    setSignedIn(false)
    setPaletteOpen(false)
    setAppearanceOpen(false)
    setAiOpen(false)
    setNewDreamOpen(false)
    setNewFragmentOpen(false)
    setReplayOpen(false)
    setOpenFragmentId(null)
    setTourOpen(false)
  }, [])
  const openFragment = useCallback(
    (dreamId, fragmentId) => {
      setRoute({ kind: 'dream', id: dreamId })
      setOpenFragmentId(fragmentId)
    },
    [setRoute]
  )
  const goRoute = useCallback(r => setRoute(r), [setRoute])
  const dream =
    route.kind === 'dream' || route.kind === 'case' ? dreams.find(d => d.id === route.id) : null

  const updateDreamStatus = useCallback(
    (dreamId, status) => {
      const now = new Date().toISOString()
      setDreams(ds =>
        ds.map(item =>
          item.id === dreamId ? { ...item, status, archived: null, updated: now } : item
        )
      )
    },
    [setDreams]
  )

  const archiveDream = useCallback(
    dreamId => {
      const now = new Date().toISOString()
      setDreams(ds =>
        ds.map(item =>
          item.id === dreamId
            ? {
                ...item,
                archived: now,
                updated: now,
                reason: item.reason ?? 'Archived from the Field Notebook demo workspace.',
              }
            : item
        )
      )
      setRoute({ kind: 'all' })
    },
    [setDreams, setRoute]
  )

  const deleteDream = useCallback(
    dreamId => {
      setDreams(ds => ds.filter(item => item.id !== dreamId))
      setRoute({ kind: 'all' })
    },
    [setDreams, setRoute]
  )

  const restoreDream = useCallback(
    dreamId => {
      const now = new Date().toISOString()
      setDreams(ds =>
        ds.map(item =>
          item.id === dreamId ? { ...item, archived: null, updated: now, reason: null } : item
        )
      )
      setRoute({ kind: 'dream', id: dreamId })
    },
    [setDreams, setRoute]
  )

  const createDream = useCallback(
    draft => {
      const now = new Date().toISOString()
      const id = dreams.reduce((max, d) => Math.max(max, d.id), 0) + 1
      const dream = {
        id,
        title: draft.title,
        description: draft.description,
        status: draft.status,
        brand: draft.brand,
        tags: draft.tags,
        created: now,
        updated: now,
        summary: draft.description,
        wiki: [
          {
            kind: 'p',
            text: draft.description || 'Start shaping this dream from captured fragments.',
          },
          { kind: 'h', text: 'Direction' },
          {
            kind: 'p',
            text: 'Use this space to preserve the project narrative as the work moves from capture to execution.',
          },
        ],
        todos: [],
        fragments: [],
      }
      setDreams(ds => [dream, ...ds])
      setNewDreamOpen(false)
      setRoute({ kind: 'dream', id })
    },
    [dreams, setDreams, setRoute]
  )

  const createFragment = useCallback(
    draft => {
      if (!dream) return
      const id = dream.fragments.reduce((max, fragment) => Math.max(max, fragment.id), 0) + 1
      const now = new Date().toISOString()
      const fragment = {
        id,
        title: draft.title,
        source: `${draft.source} · ${new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })}`,
        date: now,
        excerpt: draft.content.slice(0, 180),
        content: draft.content,
      }
      setDreams(ds =>
        ds.map(item =>
          item.id === dream.id
            ? { ...item, fragments: [fragment, ...item.fragments], updated: now }
            : item
        )
      )
      setNewFragmentOpen(false)
      setOpenFragmentId(id)
    },
    [dream, setDreams]
  )

  // Capture-from-AI-chat: file replay excerpts as real fragments on a chosen
  // dream, then route there so they appear in the fragments list.
  const captureReplayFragments = useCallback(
    (dreamId, drafts) => {
      if (!dreamId || !drafts?.length) return
      const now = new Date().toISOString()
      const label = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      setDreams(ds =>
        ds.map(item => {
          if (item.id !== dreamId) return item
          let nextId = item.fragments.reduce((max, fragment) => Math.max(max, fragment.id), 0)
          const created = drafts.map(draft => {
            nextId += 1
            return {
              id: nextId,
              title: draft.title,
              source: `${draft.source} · ${label}`,
              date: now,
              excerpt: draft.content.slice(0, 180),
              content: draft.content,
              features: draft.features ?? [],
            }
          })
          return { ...item, fragments: [...created, ...item.fragments], updated: now }
        })
      )
      notifyDemo(
        `Captured ${drafts.length} fragment${drafts.length === 1 ? '' : 's'} from the replay into this dream.`
      )
      setRoute({ kind: 'dream', id: dreamId })
    },
    [setDreams, setRoute, notifyDemo]
  )

  const applyTemplate = useCallback(
    template => {
      const now = new Date().toISOString()
      const id = dreams.reduce((max, d) => Math.max(max, d.id), 0) + 1
      const dream = {
        id,
        title: template.title,
        description: template.description,
        status: 'planning',
        brand: 'product',
        tags: template.tags,
        created: now,
        updated: now,
        summary: template.description,
        wiki: [
          { kind: 'p', text: `Drafted from template: ${template.title}` },
          ...Array.from({ length: template.sections - 1 }, (_, index) => ({
            kind: 'h',
            text: `Section ${index + 2}`,
          })),
        ],
        todos: Array.from({ length: template.includedTodos }, (_, index) => ({
          id: id * 1000 + index,
          title: `Template todo ${index + 1}`,
          category: 'admin',
          deadline: new Date(Date.now() + (index + 3) * 86400000).toISOString(),
          done: false,
        })),
        fragments: [],
      }
      setDreams(ds => [dream, ...ds])
      setAppliedTemplate(template)
      setRoute({ kind: 'dream', id })
    },
    [dreams, setDreams, setRoute]
  )

  const toggleTodo = useCallback(
    (todoId, dreamId) => {
      setDreams(ds =>
        ds.map(d => {
          if (dreamId != null && d.id !== dreamId) return d
          const next = d.todos.map(t => (t.id === todoId ? { ...t, done: !t.done } : t))
          if (next === d.todos) return d
          const changed = next.some((t, i) => t !== d.todos[i])
          return changed ? { ...d, todos: next } : d
        })
      )
    },
    [setDreams]
  )

  let canvas
  if (route.kind === 'dream' && dream) {
    canvas = (
      <DreamDetail
        dream={dream}
        onBack={() => setRoute({ kind: 'all' })}
        onToggleTodo={id => toggleTodo(id, dream.id)}
        onUpdateStatus={status => updateDreamStatus(dream.id, status)}
        onArchive={() => archiveDream(dream.id)}
        onDelete={() => deleteDream(dream.id)}
        onOpenFragment={setOpenFragmentId}
        onOpenAI={() => setAiOpen(true)}
        onDemoAction={notifyDemo}
      />
    )
  } else if (route.kind === 'today') {
    canvas = <Today dreams={activeDreams} onOpenDream={openDream} onDemoAction={notifyDemo} />
  } else if (route.kind === 'inbox') {
    canvas = (
      <Inbox
        dreams={activeDreams}
        onDemoAction={notifyDemo}
        onReplay={() => setReplayOpen(true)}
      />
    )
  } else if (route.kind === 'suggest') {
    canvas = <Suggestions dreams={activeDreams} onOpenDream={openDream} />
  } else if (route.kind === 'archive') {
    canvas = (
      <Archive
        archivedDreams={archivedDreams}
        onRestore={restoreDream}
        onDelete={deleteDream}
        onDemoAction={notifyDemo}
      />
    )
  } else if (route.kind === 'brand') {
    const filtered = activeDreams.filter(d => d.brand === route.id)
    canvas = <AllDreams dreams={filtered} onOpenDream={openDream} />
  } else if (route.kind === 'builder') {
    canvas = (
      <Suspense
        fallback={
          <div className="builder-notes">
            <div className="builder-section">Loading Builder Notes...</div>
          </div>
        }
      >
        <BuilderNotes onDemoAction={notifyDemo} />
      </Suspense>
    )
  } else if (route.kind === 'analytics') {
    canvas = <Analytics dreams={activeDreams} />
  } else if (route.kind === 'portfolio') {
    canvas = (
      <Portfolio
        dreams={activeDreams}
        onOpenDream={openDream}
        onCompose={id => setRoute({ kind: 'case', id })}
        onDemoAction={notifyDemo}
      />
    )
  } else if (route.kind === 'case' && dream) {
    canvas = (
      <CaseStudyComposer
        dream={dream}
        onClose={() => setRoute({ kind: 'dream', id: dream.id })}
        onBackToPortfolio={() => setRoute({ kind: 'portfolio' })}
        onDemoAction={notifyDemo}
      />
    )
  } else if (route.kind === 'templates') {
    canvas = <Templates onApply={applyTemplate} />
  } else if (route.kind === 'integrations') {
    canvas = <Integrations onDemoAction={notifyDemo} />
  } else if (route.kind === 'revisions') {
    canvas = <Revisions onDemoAction={notifyDemo} />
  } else if (route.kind === 'graph') {
    canvas = <GraphView />
  } else if (route.kind === 'settings') {
    canvas = (
      <Settings
        appearance={appearance}
        onUpdateAppearance={updateAppearance}
        onOpenAppearance={() => setAppearanceOpen(true)}
        onReplayOnboarding={() => {
          setAppearanceOpen(false)
          setTourOpen(false)
          window.requestAnimationFrame(() => setTourOpen(true))
        }}
        onDemoAction={notifyDemo}
      />
    )
  } else {
    canvas = <AllDreams dreams={activeDreams} onOpenDream={openDream} />
  }

  if (!signedIn) {
    return (
      <FieldNotebookAuthScreen
        appearance={appearance}
        onAuthed={enterPreview}
        onCaseStudy={() => {
          window.location.href = '/?case-study=1'
        }}
      />
    )
  }

  return (
    <div
      data-fn-root=""
      data-theme={appearance.theme}
      data-accent={appearance.accent}
      data-density={appearance.density}
      data-serif={appearance.serif ? 'true' : 'false'}
      className="fn-shell h-screen w-screen overflow-hidden"
    >
      <Rail
        route={route}
        onRoute={goRoute}
        dreams={activeDreams}
        counts={counts}
        onSignOut={signOut}
      />
      <main className="flex min-w-0 flex-col overflow-hidden">
        <Topbar
          route={route}
          dreamTitle={dream?.title}
          onRoute={goRoute}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenAI={() => setAiOpen(true)}
          onOpenAppearance={() => setAppearanceOpen(true)}
          onNewDream={() => setNewDreamOpen(true)}
          onNewFragment={() => setNewFragmentOpen(true)}
        />
        <div className="fn-scroll fn-main-scroll flex-1 overflow-y-auto">{canvas}</div>
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        dreams={activeDreams}
        onOpenDream={openDream}
        onOpenFragment={openFragment}
        onRoute={goRoute}
        onReplay={() => {
          setPaletteOpen(false)
          setReplayOpen(true)
        }}
      />
      <AppearancePanel
        open={appearanceOpen}
        onClose={() => setAppearanceOpen(false)}
        appearance={appearance}
        onUpdate={updateAppearance}
      />
      <AIAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        dream={dream}
        dreams={activeDreams}
        onOpenDream={openDream}
        onDemoAction={notifyDemo}
      />
      <NewDreamModal
        open={newDreamOpen}
        onClose={() => setNewDreamOpen(false)}
        onCreate={createDream}
      />
      <NewFragmentModal
        open={newFragmentOpen}
        dream={dream}
        onClose={() => setNewFragmentOpen(false)}
        onCreate={createFragment}
      />
      <DemoChatReplay
        open={replayOpen}
        dreams={activeDreams}
        defaultDreamId={dream?.id ?? activeDreams[0]?.id}
        onCapture={(dreamId, drafts) => captureReplayFragments(dreamId, drafts)}
        onClose={() => setReplayOpen(false)}
      />
      <FragmentReader
        dream={dream}
        fragment={dream?.fragments.find(fragment => fragment.id === openFragmentId)}
        onClose={() => setOpenFragmentId(null)}
      />
      <TemplateAppliedNotice template={appliedTemplate} onClose={() => setAppliedTemplate(null)} />
      <DemoNotice message={demoNotice} onClose={() => setDemoNotice(null)} />
      <FieldNotebookTour open={tourOpen} onClose={() => setTourOpen(false)} onRoute={goRoute} />
    </div>
  )
}

function FieldNotebookAuthScreen({ appearance, onAuthed, onCaseStudy }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isSignIn = mode === 'signin'

  const submit = event => {
    event.preventDefault()
    onAuthed()
  }

  return (
    <div
      data-fn-root=""
      data-theme={appearance.theme}
      data-accent={appearance.accent}
      data-density={appearance.density}
      data-serif={appearance.serif ? 'true' : 'false'}
      className="auth-screen"
      data-screen-label="Auth"
    >
      <section className="auth-art" aria-label="Dreamcatcher preview">
        <div className="auth-mark">
          dreamcatcher<sup>v3</sup>
        </div>
        <div className="auth-quote">
          Capture cheaply, summarize ruthlessly, execute on the smallest committed unit.
          <span className="attribution">Operating principle no. 1</span>
        </div>
        <div className="auth-foot">
          <span>public preview</span>
          <span aria-hidden="true">/</span>
          <span>local session</span>
          <span aria-hidden="true">/</span>
          <button type="button" onClick={onCaseStudy}>
            case study
          </button>
        </div>
      </section>

      <section className="auth-form-wrap" aria-label="Workspace access">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-eyebrow">{isSignIn ? 'Welcome back' : 'Get started'}</div>
          <h1 className="auth-title">
            {isSignIn ? 'Sign in to your workspace.' : 'Create your workspace.'}
          </h1>
          <p className="auth-sub">
            {isSignIn
              ? 'Your dreams, fragments, and todos are waiting.'
              : 'Create a simulated workspace session for this public preview.'}
          </p>

          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={isSignIn}
              className={`auth-tab ${isSignIn ? 'active' : ''}`}
              onClick={() => setMode('signin')}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isSignIn}
              className={`auth-tab ${!isSignIn ? 'active' : ''}`}
              onClick={() => setMode('signup')}
            >
              Sign up
            </button>
          </div>

          <div
            className="auth-demo-notice"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              marginBottom: '0.75rem',
              borderRadius: '6px',
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              fontSize: '0.8rem',
              color: '#a78bfa',
            }}
          >
            <span aria-hidden="true">⚹</span>
            <span>Demo mode — no real sign-in. All buttons enter the mock workspace.</span>
          </div>
          <div className="auth-providers">
            <button type="button" className="auth-provider" onClick={onAuthed}>
              <span className="ico">G</span>
              Continue with Google
            </button>
            <button type="button" className="auth-provider" onClick={onAuthed}>
              <span className="ico">GH</span>
              Continue with GitHub
            </button>
            <button type="button" className="auth-provider" onClick={onAuthed}>
              <span className="ico">@</span>
              Magic link to email
            </button>
          </div>

          <div className="auth-divider">or with password</div>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder={USER.email}
              autoComplete="email"
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="••••••••••"
              autoComplete={isSignIn ? 'current-password' : 'new-password'}
            />
          </label>

          <button type="submit" className="auth-submit">
            {isSignIn ? 'Sign in' : 'Create account'}
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="auth-skip" onClick={onAuthed}>
            Skip - explore the demo workspace
          </button>
          <button type="button" className="auth-legacy" onClick={onCaseStudy}>
            Read case study
          </button>

          <p className="auth-legal">
            This public preview simulates account access and stores demo state locally. Production
            authentication, permissions, and workspace services live outside this repo.
          </p>
        </form>
      </section>
    </div>
  )
}
