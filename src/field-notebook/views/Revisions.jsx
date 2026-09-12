import { useState } from 'react'
import { DEMO_REVISION } from '../fixtures'
import { fmtDate } from '../helpers'

export default function Revisions({ onDemoAction }) {
  const [decision, setDecision] = useState(null)
  const revision = DEMO_REVISION

  const ratify = () => {
    setDecision('ratified')
    onDemoAction?.(
      'In production this would apply the split to the live workspace after your confirmation — recorded and reversible. This preview does not mutate anything.'
    )
  }

  const reject = () => {
    setDecision('rejected')
    onDemoAction?.(
      'In production this would discard the proposal and keep the conflated dream as-is — recorded either way. This preview does not mutate anything.'
    )
  }

  return (
    <div className="fn-canvas-page" data-screen-label="Revisions">
      <header className="page-head-2">
        <div>
          <div className="l">Revisions · retro-tracing</div>
          <h1>
            Proposed splits, <em>waiting on you</em>.
          </h1>
          <p className="lead">
            A trace walks a dream's captured statements and proposes where they actually belong —
            by artifact, not by guesswork. Every link below quotes the statement it patterns on.
            Nothing here has been applied: a human ratifies a revision before anything in the
            workspace changes.
          </p>
        </div>
      </header>

      <article className="revision-card">
        <div className="revision-head">
          <span className="revision-kind">proposed split</span>
          <span className="revision-date">opened {fmtDate(revision.createdAt)}</span>
        </div>

        <h2 className="revision-title">
          Split the conflated <em>Connex · Nexus · Dreamcatcher · PipelineOS</em> mega-dream
        </h2>
        <p className="revision-detail">
          These four artifacts were captured into one dream early on. The trace found
          artifact-anchored boundaries between them and proposes separating each into its own
          dream, carrying its statements with it.
        </p>

        <section className="revision-section">
          <h3>Proposed splits</h3>
          <div className="revision-splits">
            {revision.splits.map(split => (
              <div key={split.names} className="revision-split-row">
                <span className="revision-split-name">{split.names}</span>
                <span className="revision-split-count">{split.statements} statements</span>
              </div>
            ))}
          </div>
        </section>

        <section className="revision-section">
          <h3>Inter-dream links</h3>
          <div className="revision-links">
            {revision.links.map(link => (
              <div key={`${link.from}-${link.to}`} className="revision-link-row">
                <div className="revision-link-path">
                  <span>{link.from}</span>
                  <span aria-hidden="true">→</span>
                  <span>{link.to}</span>
                </div>
                <p className="revision-link-quote">&ldquo;{link.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        <section className="revision-section">
          <h3>Former-name candidates</h3>
          <div className="revision-links">
            {revision.nameLinks.map(nameLink => (
              <div key={`${nameLink.former}-${nameLink.current}`} className="revision-link-row">
                <div className="revision-link-path">
                  <span>{nameLink.former}</span>
                  <span aria-hidden="true">→</span>
                  <span>{nameLink.current}</span>
                </div>
                <p className="revision-link-quote">&ldquo;{nameLink.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        <p className="revision-unattributed">
          {revision.unattributed} statements from this mega-dream remain unattributed — the trace
          could not anchor them to any of the four artifacts.
        </p>

        {decision ? (
          <div className="revision-decided" data-decision={decision} role="status">
            {decision === 'ratified'
              ? 'Ratified in this preview session — no workspace data changed.'
              : 'Rejected in this preview session — no workspace data changed.'}
          </div>
        ) : (
          <footer className="revision-actions">
            <button type="button" className="fn-btn fn-btn-ghost" onClick={reject}>
              Reject
            </button>
            <button type="button" className="fn-btn fn-btn-primary" onClick={ratify}>
              Ratify split
            </button>
          </footer>
        )}
      </article>
    </div>
  )
}
