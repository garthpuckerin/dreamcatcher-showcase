import { INBOX } from '../fixtures'

export default function Inbox({ dreams, onDemoAction, onReplay }) {
  const dreamMap = Object.fromEntries(dreams.map(d => [d.id, d]))
  return (
    <div className="inbox-page" data-screen-label="Inbox">
      <div className="page-head-2">
        <div>
          <div className="l">Inbox · unsorted captures</div>
          <h1>
            <em>{INBOX.length}</em> captures waiting to be filed.
          </h1>
          <p className="lead">
            New from your AI assistants, coding tools, and the browser extension. Click the chevron
            to file under the AI-suggested dream — or pick another.
          </p>
        </div>
        <div className="fn-topbar-actions">
          <button type="button" className="fn-btn fn-btn-primary" onClick={() => onReplay?.()}>
            ▷ Capture from AI chat
          </button>
          <button
            type="button"
            className="fn-btn"
            onClick={() =>
              onDemoAction?.(
                'Auto-file is simulated in this public preview; production uses capture routing.'
              )
            }
          >
            * Auto-file all (suggested matches)
          </button>
        </div>
      </div>

      <div className="inbox-list">
        {INBOX.map(item => (
          <article key={item.id} className="inbox-row">
            <div className="inbox-glyph">↘</div>
            <div>
              <div className="inbox-title">{item.title}</div>
              <div className="inbox-preview">{item.preview}</div>
            </div>
            <div className="inbox-source">{item.source}</div>
            <div className="inbox-suggest">
              {item.suggested ? (
                <>→ {dreamMap[item.suggested]?.title ?? 'New dream'}</>
              ) : (
                <span>no match</span>
              )}
            </div>
            <div className="inbox-actions">
              {item.suggested && (
                <button
                  type="button"
                  className="fn-btn fn-btn-ghost"
                  title="File under suggested dream"
                  onClick={() =>
                    onDemoAction?.(
                      'Filing captures is represented with fixture inbox data in the public preview.'
                    )
                  }
                >
                  ✓ File
                </button>
              )}
              <button
                type="button"
                className="fn-btn fn-btn-ghost"
                title="Open picker"
                onClick={() =>
                  onDemoAction?.(
                    'Dream picker is production-bound; suggested routing is shown here.'
                  )
                }
              >
                ...
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
