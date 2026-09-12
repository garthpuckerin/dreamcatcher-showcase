import { useAppearanceSettings } from '../helpers'

export default function PublicCaseStudy({ onOpenDemo }) {
  const [appearance] = useAppearanceSettings()
  return (
    <div data-fn-root="" data-theme={appearance.theme} data-accent={appearance.accent} className="public-case">
      <header className="public-case-top">
        <a className="public-case-brand" href="/">
          dreamcatcher<sup>v3</sup>
        </a>
        <nav aria-label="Case study actions">
          <button type="button" className="fn-btn fn-btn-primary" onClick={onOpenDemo}>
            Open demo
          </button>
        </nav>
      </header>

      <main className="public-case-main">
        <section className="public-case-hero">
          <div className="builder-kicker">Portfolio case study</div>
          <h1>Dreamcatcher: from an AI-chat idea backlog to AI-native field notebook.</h1>
          <p>
            Dreamcatcher captures fragments from AI-assisted work, organizes them into durable
            dreams, and turns execution history into wikis, retrospectives, timelines, and case
            studies.
          </p>
          <div className="public-case-actions">
            <button type="button" className="fn-btn fn-btn-primary" onClick={onOpenDemo}>
              Launch interactive demo
            </button>
            <a className="fn-btn" href="#ui-evolution">
              View product tour
            </a>
          </div>
        </section>

        <section className="public-case-section public-case-origin">
          <div>
            <div className="builder-kicker">Origin</div>
            <h2>It started as an idea backlog tracker before it had a name.</h2>
          </div>
          <p>
            The name came later from an offhand framing: throwing dreams into the backlog tracker.
            That phrase clarified the product metaphor. The backlog was not just a task list; it was
            a place to catch early ideas, preserve context, and return to them when they were ready
            to become real work.
          </p>
          <p>
            The current Field Notebook UI began later as an interactive static JSX proof of intent.
            This demo ports that UI into the public preview as a dry run for production.
          </p>
        </section>

        <section className="public-case-section" id="ui-evolution">
          <div className="builder-kicker">The product</div>
          <h2>A tour of the Field Notebook.</h2>
          <div className="public-media-grid">
            <figure>
              <img
                src="/media/field-notebook-auth.png"
                alt="Field Notebook sign-in screen in demo mode"
              />
              <figcaption>Sign-in (demo mode)</figcaption>
            </figure>
            <figure>
              <img
                src="/media/field-notebook-today.png"
                alt="Field Notebook today view — daily triage"
              />
              <figcaption>Today — daily triage</figcaption>
            </figure>
            <figure>
              <img
                src="/media/field-notebook-all-dreams.png"
                alt="Field Notebook all dreams view"
              />
              <figcaption>All dreams</figcaption>
            </figure>
            <figure>
              <img
                src="/media/field-notebook-wiki.png"
                alt="Field Notebook dream wiki"
              />
              <figcaption>Dream wiki</figcaption>
            </figure>
            <figure>
              <img
                src="/media/field-notebook-settings-appearance.png"
                alt="Field Notebook appearance and theming settings"
              />
              <figcaption>Appearance &amp; theming</figcaption>
            </figure>
            <figure>
              <img
                src="/media/field-notebook-assistant.png"
                alt="Field Notebook AI assistant"
              />
              <figcaption>AI assistant</figcaption>
            </figure>
          </div>
        </section>

        <section className="public-case-section">
          <div className="builder-kicker">Walkthrough</div>
          <h2>Desktop preview video.</h2>
          <video
            className="public-case-video"
            src="/media/field-notebook-walkthrough.webm"
            poster="/media/field-notebook-today.png"
            preload="metadata"
            controls
            muted
            playsInline
          />
        </section>

        <section className="public-case-section public-case-grid-section">
          <div>
            <div className="builder-kicker">Demo contract</div>
            <h2>Frontend-led by choice, not frontend-only by ability.</h2>
            <p>
              The public preview shows the intended product experience while keeping sensitive
              production systems out of the repo and deployment.
            </p>
          </div>
          <div className="public-case-card-grid">
            <article>
              <h3>Visible in demo</h3>
              <p>
                Field Notebook shell, simulated auth, local state, wiki sections, settings,
                portfolio composer, and demo feedback.
              </p>
            </article>
            <article>
              <h3>Scaffolded in repo</h3>
              <p>
                Service modules, tests, CI, API/server boundaries, hooks, extension workspaces, and
                integration surfaces.
              </p>
            </article>
            <article>
              <h3>Production-bound</h3>
              <p>
                Real auth, persistence, AI provider routing, OAuth sync, collaboration, publishing,
                billing, audit history, and MCP layer.
              </p>
            </article>
          </div>
        </section>

        <section className="public-case-section public-case-roadmap">
          <div className="builder-kicker">Platform direction</div>
          <h2>Capture surfaces first, MCP-aware platform next.</h2>
          <ol>
            <li>Browser extension captures web research, AI chat context, and sources.</li>
            <li>
              VS Code extension captures development flow, branches, commits, and agent
              conversations.
            </li>
            <li>
              Web app organizes dreams, wiki pages, todos, timelines, retrospectives, and case
              studies.
            </li>
            <li>
              MCP support connects external tools and exposes structured Dreamcatcher memory back to
              agents.
            </li>
          </ol>
        </section>
      </main>
    </div>
  )
}
