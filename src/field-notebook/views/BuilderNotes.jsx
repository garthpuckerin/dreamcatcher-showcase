const BUILD_PROOF = [
  [
    'Service layer',
    'AI assistant, analytics, templates, integrations, versioning, websocket, and wiki-sync modules.',
  ],
  [
    'Automated checks',
    'CI runs lint, format, unit coverage, E2E, VS Code extension compile, and production build.',
  ],
  [
    'Extension direction',
    'Browser-extension workspace and VS Code extension scaffold preserve the original capture-surface vision.',
  ],
  [
    'Safe public mode',
    'Local demo state replaces production secrets, provider credentials, paid APIs, and real user data.',
  ],
]

const DEMO_BOUNDARIES = [
  {
    area: 'Authentication',
    demo: 'Simulated sign-in, sign-up, provider, magic-link, skip, and sign-out flow.',
    repo: 'Auth hooks and API client boundaries exist from the legacy/product scaffolding.',
    production:
      'Real identity, sessions, workspace membership, invite policy, and account deletion.',
  },
  {
    area: 'AI and search',
    demo: 'Local suggestions, command palette search, and intentional demo notices.',
    repo: 'AI assistant service, tests, semantic-search surfaces, and provider settings.',
    production:
      'Provider routing, encrypted keys, rate limits, observability, and real embeddings.',
  },
  {
    area: 'Collaboration',
    demo: 'Fixture-backed presence, collaborators, team sections, and review signals.',
    repo: 'Collaboration hooks and websocket-style service boundaries.',
    production:
      'Realtime presence, comments, cursors, team invites, audit history, and permissions.',
  },
  {
    area: 'Publishing',
    demo: 'Portfolio composer and case-study drafting flow with demo feedback.',
    repo: 'Portfolio feature modules and case-study generation surface.',
    production:
      'Publish workflow, custom domains, review gates, analytics, and billing enforcement.',
  },
]

export default function BuilderNotes({ onDemoAction }) {
  return (
    <div className="builder-notes" data-screen-label="Builder Notes">
      <div className="page-head-2">
        <div>
          <div className="l">Portfolio evaluation notes</div>
          <h1>
            Frontend-led by choice. <em>Built</em>, not just imagined.
          </h1>
          <p className="lead">
            This public preview keeps the Field Notebook experience portable and safe while leaving
            the engineering boundaries visible. Not wired in the public demo does not mean not
            architected.
          </p>
        </div>
        <button
          type="button"
          className="fn-btn fn-btn-primary"
          onClick={() =>
            onDemoAction?.(
              'Public preview mode keeps production secrets, provider keys, and real user data out of this repo.'
            )
          }
        >
          Public preview contract
        </button>
      </div>

      <section className="builder-hero">
        <div>
          <div className="builder-kicker">Demo strategy</div>
          <h2>Interactive product preview with production-shaped boundaries.</h2>
          <p>
            Dreamcatcher began as an AI-chat-era idea backlog tracker before the name existed. The
            Field Notebook UI began later as an interactive static JSX proof of intent; this demo
            shows that UI port with local state, simulated onboarding, settings, wiki flows, and
            portfolio publishing while keeping live backend wiring out of the public preview.
          </p>
        </div>
        <div className="builder-proof-stack" aria-label="Engineering evidence summary">
          <div>
            <span>Release</span>
            <b>v3.0.0</b>
          </div>
          <div>
            <span>Preview</span>
            <b>Vercel-ready</b>
          </div>
          <div>
            <span>Branch policy</span>
            <b>develop to main</b>
          </div>
        </div>
      </section>

      <section className="builder-section">
        <div className="builder-section-head">
          <div>
            <div className="builder-kicker">Engineering evidence</div>
            <h2>What evaluators can verify in the repo.</h2>
          </div>
        </div>
        <div className="builder-proof-grid">
          {BUILD_PROOF.map(([title, body]) => (
            <article key={title} className="builder-proof-card">
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="builder-section">
        <div className="builder-section-head">
          <div>
            <div className="builder-kicker">Demo vs production</div>
            <h2>Visible product surface, scaffolded plumbing, production wiring.</h2>
          </div>
        </div>
        <div className="builder-matrix" role="table" aria-label="Demo capability matrix">
          <div className="builder-matrix-row builder-matrix-head" role="row">
            <span role="columnheader">Area</span>
            <span role="columnheader">Visible in demo</span>
            <span role="columnheader">Scaffolded in repo</span>
            <span role="columnheader">Production-bound</span>
          </div>
          {DEMO_BOUNDARIES.map(item => (
            <div key={item.area} className="builder-matrix-row" role="row">
              <b role="cell">{item.area}</b>
              <span role="cell">{item.demo}</span>
              <span role="cell">{item.repo}</span>
              <span role="cell">{item.production}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="builder-section builder-direction">
        <div>
          <div className="builder-kicker">Original product direction</div>
          <h2>Capture surfaces first, MCP-aware platform next.</h2>
          <p>
            The browser extension and VS Code plugin remain the right capture surfaces: they meet
            users where AI-assisted work happens. MCP support belongs in the platform layer so
            Dreamcatcher can connect external tools and expose structured project memory back to
            agents.
          </p>
        </div>
        <div className="builder-direction-list">
          <span>Browser extension captures web and AI chat context.</span>
          <span>VS Code extension captures dev flow and project decisions.</span>
          <span>MCP layer connects tools and serves structured memory.</span>
        </div>
      </section>
    </div>
  )
}
