export function CaseStudyComposer({ dream, onClose, onBackToPortfolio, onDemoAction }) {
  const sections = [
    ['Problem', dream.description],
    ['Approach', dream.summary],
    [
      'Key decisions',
      dream.wiki
        ?.filter(block => block.kind === 'h')
        .map(block => block.text)
        .join(', '),
    ],
    [
      'Execution proof',
      `${dream.fragments.length} fragments and ${dream.todos.length} todos captured.`,
    ],
    [
      'Outcome',
      dream.status === 'completed'
        ? 'Shipped and ready to publish.'
        : 'Draft case study pending completion.',
    ],
  ]

  return (
    <div className="casestudy" data-screen-label="Case Study Composer">
      <main className="casestudy-main">
        <div className="page-head-2">
          <div>
            <button type="button" className="fn-back-link" onClick={onBackToPortfolio}>
              ← Portfolio
            </button>
            <div className="l">Portfolio Composer</div>
            <h1>
              Shape <em>{dream.title}</em> into a public case study.
            </h1>
            <p className="lead">AI drafts the first pass; you edit the narrative and publish.</p>
          </div>
        </div>
        {sections.map(([title, body], index) => (
          <section key={title} className="cs-section">
            <div className="ai-badge">* AI draft · {String(index + 1).padStart(2, '0')}</div>
            <h3>{title}</h3>
            <p>
              {body || 'Draft this section from the dream wiki, fragments, and completed todos.'}
            </p>
          </section>
        ))}
      </main>
      <aside className="casestudy-rail">
        <button type="button" className="fn-btn" onClick={onClose}>
          Back to Dream
        </button>
        <button
          type="button"
          className="fn-btn fn-btn-primary"
          onClick={() =>
            onDemoAction?.(
              'Publishing is represented in this demo; production publishing is wired in the private build.'
            )
          }
        >
          Publish preview
        </button>
        <div className="fn-detail-rail-label">Sections</div>
        <nav className="fn-anchor-list">
          {sections.map(([title], index) => (
            <a key={title} className="fn-anchor" href={`#case-${index + 1}`}>
              <span className="label">{title}</span>
              <span className="num">{String(index + 1).padStart(2, '0')}</span>
            </a>
          ))}
        </nav>
      </aside>
    </div>
  )
}
