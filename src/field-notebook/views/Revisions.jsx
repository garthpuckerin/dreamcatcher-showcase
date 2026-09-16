import { DEMO_REVISION } from '../fixtures'
import { fmtDate, fmtRel } from '../helpers'

// Retro-tracing console. Ratify APPLIES the split to this workspace (the
// same thing production does: four dreams created, the origin archived,
// recorded and reversible); reject leaves the origin exactly as it was.
// State lives in FieldNotebookApp so the Graph, Archive, Today and the rail
// all re-derive from the same decision.
export default function Revisions({
  decision,
  splitDreams = [],
  originDream,
  onRatify,
  onReject,
  onRevert,
  onReopen,
  onOpenDream,
}) {
  const revision = DEMO_REVISION
  const status = decision?.status ?? null

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
          Split the conflated <em>Connex · Nexus · Dreamcatcher · PipelineOS</em> origin backlog
        </h2>
        <p className="revision-detail">
          These four artifacts were captured into one dream early on
          {originDream ? (
            <>
              {' — '}
              <button
                type="button"
                className="revision-origin-link"
                onClick={() => onOpenDream?.(originDream.id)}
              >
                {originDream.title}
              </button>
            </>
          ) : null}
          . The trace found artifact-anchored boundaries between them and proposes separating each
          into its own dream, carrying its statements with it.
        </p>

        <section className="revision-section">
          <h3>Proposed splits</h3>
          <div className="revision-splits">
            {revision.splits.map(split => (
              <div key={split.key} className="revision-split-row">
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
          {revision.unattributed} statements from this origin backlog remain unattributed — the
          trace could not anchor them to any of the four artifacts. They stay with the origin.
        </p>

        {status === 'ratified' && (
          <div className="revision-decided" data-decision="ratified" role="status">
            <p className="revision-decided-lead">
              <strong>Ratified {decision.at ? fmtRel(decision.at) : ''}</strong> — applied to
              this workspace. The origin backlog is archived with the reason recorded; these four
              dreams now exist, each holding the fragments the trace attributed to it, and the
              Graph carries the quoted links as edges.
            </p>
            <div className="revision-created">
              {splitDreams.map(dream => (
                <button
                  key={dream.id}
                  type="button"
                  className="fn-chip"
                  onClick={() => onOpenDream?.(dream.id)}
                >
                  {dream.title}
                </button>
              ))}
            </div>
            <div className="revision-actions">
              <button type="button" className="fn-btn" onClick={onRevert}>
                Revert revision
              </button>
            </div>
            <p className="revision-decided-note">
              Recorded and reversible: revert restores the origin backlog exactly and removes the
              four dreams. Restoring the origin from Archive does the same.
            </p>
          </div>
        )}

        {status === 'rejected' && (
          <div className="revision-decided" data-decision="rejected" role="status">
            <p className="revision-decided-lead">
              <strong>Rejected {decision.at ? fmtRel(decision.at) : ''}</strong> — the origin
              backlog is unchanged. The decision is recorded either way.
            </p>
            <div className="revision-actions">
              <button type="button" className="fn-btn" onClick={onReopen}>
                Reopen proposal
              </button>
            </div>
          </div>
        )}

        {!status && (
          <footer className="revision-actions">
            <button type="button" className="fn-btn fn-btn-ghost" onClick={onReject}>
              Reject
            </button>
            <button type="button" className="fn-btn fn-btn-primary" onClick={onRatify}>
              Ratify split
            </button>
          </footer>
        )}
      </article>
    </div>
  )
}
