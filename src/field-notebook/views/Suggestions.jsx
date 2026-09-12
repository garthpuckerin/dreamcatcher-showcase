import { useState } from 'react'
import { AI_SUGGESTIONS } from '../fixtures'

export default function Suggestions({ dreams, onOpenDream }) {
  const [dismissed, setDismissed] = useState(new Set())
  const live = AI_SUGGESTIONS.filter(suggestion => !dismissed.has(suggestion.id))
  const dreamMap = Object.fromEntries(dreams.map(dream => [dream.id, dream]))

  return (
    <div className="suggest-page" data-screen-label="AI Suggestions">
      <div className="page-head-2">
        <div>
          <div className="l">AI Suggestions · weekly review</div>
          <h1>
            What I think you should <em>look at</em> this week.
          </h1>
          <p className="lead">
            Where the matcher proposes which dream a captured segment belongs to — and flags the
            ones that belong to no dream at all. Accept what helps, dismiss what does not help;
            the model learns from both.
          </p>
        </div>
      </div>

      {live.map(suggestion => {
        const dream = dreamMap[suggestion.dreamId]
        return (
          <article key={suggestion.id} className="suggest-card">
            <div className="suggest-head">
              <span className={`suggest-kind ${suggestion.kind}`}>{suggestion.kind}</span>
              <span>
                in{' '}
                <button type="button" onClick={() => onOpenDream(suggestion.dreamId)}>
                  {dream?.title}
                </button>
              </span>
            </div>
            <h3 className="suggest-title">{suggestion.title}</h3>
            <p className="suggest-detail">{suggestion.detail}</p>
            <div className="suggest-foot">
              <div className="suggest-basis">
                Patterned on: <span>{suggestion.basedOn}</span>
              </div>
              <div className="suggest-actions">
                <button
                  type="button"
                  className="fn-btn fn-btn-ghost"
                  onClick={() => setDismissed(current => new Set([...current, suggestion.id]))}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="fn-btn fn-btn-primary"
                  onClick={() => onOpenDream(suggestion.dreamId)}
                >
                  Open dream →
                </button>
              </div>
            </div>
          </article>
        )
      })}

      {live.length === 0 && (
        <div className="empty">
          <h3>No suggestions right now.</h3>
          <p>The model will check again every six hours, and on every new capture.</p>
        </div>
      )}
    </div>
  )
}
