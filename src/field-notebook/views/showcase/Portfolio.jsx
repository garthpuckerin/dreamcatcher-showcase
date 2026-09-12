import { PORTFOLIO } from '../../fixtures'
import { fmtDate } from '../../helpers'
import { DEFAULT_PORTFOLIO_META, PORTFOLIO_META } from './_shared'

export function Portfolio({ dreams, onCompose, onDemoAction }) {
  return (
    <div className="portfolio" data-screen-label="Portfolio">
      <div className="page-head-2">
        <div>
          <div className="l">
            Portfolio · public case studies <span className="tier-pill">Pro</span>
          </div>
          <h1>
            Ship a dream <em>as a story</em>.
          </h1>
          <p className="lead">
            Promote a completed dream to a public case study. AI drafts the seven sections from your
            wiki and fragments; you edit, pick a theme, publish.
          </p>
        </div>
        <button
          type="button"
          className="fn-btn fn-btn-primary"
          onClick={() =>
            onDemoAction?.(
              'New case studies are production-scaffolded here; edit an existing demo case to preview the flow.'
            )
          }
        >
          + New case study
        </button>
      </div>

      <div className="portfolio-grid">
        {PORTFOLIO.map(item => {
          const dream = dreams.find(d => d.id === item.dreamId)
          const meta = PORTFOLIO_META[item.id] ?? DEFAULT_PORTFOLIO_META
          if (!dream) return null
          return (
            <article key={item.id} className="portfolio-card">
              <div className="portfolio-thumb">
                <div className="tag">Case study · {meta.theme}</div>
                <h4>{dream.title}</h4>
                <div className="accent-line" />
              </div>
              <div className="portfolio-meta">
                <div className="row">
                  <span>Slug</span>
                  <b>/{meta.slug}</b>
                </div>
                <div className="row">
                  <span>Published</span>
                  <b>{fmtDate(meta.published)}</b>
                </div>
                <div className="row">
                  <span>Visits</span>
                  <b>{meta.visits.toLocaleString()}</b>
                </div>
              </div>
              <div className="portfolio-foot">
                <span
                  className={`status-badge ${item.status === 'published' ? 'public' : 'draft'}`}
                >
                  {item.status}
                </span>
                <button
                  type="button"
                  className="fn-btn fn-btn-ghost"
                  onClick={() => onCompose(dream.id)}
                >
                  Edit →
                </button>
              </div>
            </article>
          )
        })}
        {dreams
          .filter(
            dream =>
              dream.status === 'completed' && !PORTFOLIO.find(item => item.dreamId === dream.id)
          )
          .map(dream => (
            <article key={`new-${dream.id}`} className="portfolio-card portfolio-card-dashed">
              <div className="portfolio-thumb portfolio-thumb-muted">
                <div className="tag">Ready to promote</div>
                <h4>{dream.title}</h4>
                <div className="accent-line" />
              </div>
              <div className="portfolio-meta">
                <div className="row">
                  <span>Fragments</span>
                  <b>{dream.fragments.length}</b>
                </div>
                <div className="row">
                  <span>Wiki sections</span>
                  <b>{dream.wiki.length}</b>
                </div>
              </div>
              <div className="portfolio-foot">
                <button
                  type="button"
                  className="fn-btn fn-btn-primary"
                  onClick={() => onCompose(dream.id)}
                >
                  * AI-draft case study
                </button>
              </div>
            </article>
          ))}
      </div>
    </div>
  )
}
