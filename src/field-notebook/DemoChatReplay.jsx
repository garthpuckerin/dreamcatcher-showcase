import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X, Play, Pause, SkipForward, RotateCcw, Check, ChevronRight } from 'lucide-react'
import { REPLAY_CONVERSATIONS } from './sampleConversation'

/**
 * DemoChatReplay — capture-from-AI-chat showcase for the Field Notebook.
 *
 * Replays a scripted AI conversation with a typewriter reveal, then lets the
 * viewer capture excerpts as real fragments via the app's createFragment flow.
 * Fixtures only — no backend, no streaming. Honors prefers-reduced-motion by
 * revealing messages instantly. Esc closes; controls are focusable.
 *
 * @param {{
 *   open: boolean,
 *   dreams: Array<{ id: number, title: string }>,
 *   defaultDreamId?: number,
 *   onCapture: (dreamId: number, drafts: Array<object>) => void,
 *   onClose: () => void,
 * }} props
 */
export default function DemoChatReplay({ open, dreams, defaultDreamId, onCapture, onClose }) {
  const reducedMotion = usePrefersReducedMotion()
  const [conversation, setConversation] = useState(null)
  const [phase, setPhase] = useState('select') // select | replay | capture
  const [visibleCount, setVisibleCount] = useState(0)
  const [typed, setTyped] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const [destination, setDestination] = useState(defaultDreamId ?? null)
  const [captured, setCaptured] = useState(0)

  const scrollEndRef = useRef(null)
  const typeTimer = useRef(null)
  const stepTimer = useRef(null)
  const wasOpenRef = useRef(false)
  // Latest values for the open-transition reset, read without re-triggering it.
  const initRef = useRef({ defaultDreamId, dreams })
  initRef.current = { defaultDreamId, dreams }

  const clearTimers = useCallback(() => {
    if (typeTimer.current) {
      window.clearTimeout(typeTimer.current)
      typeTimer.current = null
    }
    if (stepTimer.current) {
      window.clearTimeout(stepTimer.current)
      stepTimer.current = null
    }
  }, [])

  const resetReplay = useCallback(() => {
    clearTimers()
    setVisibleCount(0)
    setTyped('')
    setIsTyping(false)
    setIsPlaying(false)
  }, [clearTimers])

  // Reset everything only on the closed -> open transition. Capturing a
  // fragment changes route/props mid-session; resetting on those would wipe the
  // confirmation screen, so the reset is gated to the open transition only.
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const { defaultDreamId: id, dreams: list } = initRef.current
      setConversation(null)
      setPhase('select')
      setSelected(new Set())
      setCaptured(0)
      setDestination(id ?? list?.[0]?.id ?? null)
      resetReplay()
    }
    wasOpenRef.current = open
  }, [open, resetReplay])

  // Tear down timers on unmount.
  useEffect(() => clearTimers, [clearTimers])

  // Esc to close (overlay-local; complements the app-level handler).
  useEffect(() => {
    if (!open) return undefined
    const onKey = event => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Auto-scroll the transcript as it grows.
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [visibleCount, typed, reducedMotion])

  const messages = conversation?.messages ?? []
  const finished = conversation ? visibleCount >= messages.length : false

  // Drive the replay forward when playing.
  useEffect(() => {
    if (phase !== 'replay' || !conversation || !isPlaying || isTyping) return undefined
    if (visibleCount >= messages.length) {
      setIsPlaying(false)
      setPhase('capture')
      return undefined
    }

    const next = messages[visibleCount]
    const delay = next.role === 'user' ? 480 : 760

    stepTimer.current = window.setTimeout(() => {
      if (next.role === 'user' || reducedMotion) {
        // User lines (and everything under reduced motion) appear at once.
        setVisibleCount(count => count + 1)
        return
      }
      // Assistant lines get the typewriter reveal.
      setIsTyping(true)
      setTyped('')
      let index = 0
      const tick = () => {
        index += 1
        setTyped(next.content.slice(0, index))
        if (index >= next.content.length) {
          setIsTyping(false)
          setVisibleCount(count => count + 1)
          setTyped('')
          return
        }
        const char = next.content[index]
        const speed = char === '\n' ? 24 : char === ' ' ? 12 : 9
        typeTimer.current = window.setTimeout(tick, speed)
      }
      tick()
    }, delay)

    return () => {
      if (stepTimer.current) {
        window.clearTimeout(stepTimer.current)
        stepTimer.current = null
      }
    }
  }, [phase, conversation, isPlaying, isTyping, visibleCount, messages, reducedMotion])

  const chooseConversation = conv => {
    setConversation(conv)
    setPhase('replay')
    setSelected(new Set())
    resetReplay()
    // Reduced motion: surface the whole transcript immediately.
    if (reducedMotion) {
      setVisibleCount(conv.messages.length)
    }
  }

  const play = () => setIsPlaying(true)

  const pause = () => {
    clearTimers()
    setIsPlaying(false)
    // Settle the in-progress line so nothing is left half-typed.
    if (isTyping) {
      setVisibleCount(count => count + 1)
      setTyped('')
      setIsTyping(false)
    }
  }

  const skipToEnd = () => {
    clearTimers()
    setIsPlaying(false)
    setIsTyping(false)
    setTyped('')
    setVisibleCount(messages.length)
    setPhase('capture')
  }

  const restart = () => {
    resetReplay()
    setPhase('replay')
    if (reducedMotion && conversation) setVisibleCount(conversation.messages.length)
  }

  const toggleExcerpt = index => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const commitCapture = () => {
    if (!conversation || destination == null || selected.size === 0) return
    const drafts = conversation.excerpts
      .filter((_, index) => selected.has(index))
      .map(excerpt => ({
        title: excerpt.title,
        source: `${conversation.source} replay`,
        content: excerpt.content,
        features: excerpt.features ?? [],
      }))
    onCapture(destination, drafts)
    setCaptured(drafts.length)
  }

  if (!open) return null

  const progress = messages.length ? Math.round((visibleCount / messages.length) * 100) : 0
  const typingMessage = isTyping ? messages[visibleCount] : null

  return (
    <div className="fn-reader-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="fn-replay"
        role="dialog"
        aria-modal="true"
        aria-label="Capture from AI chat"
        onMouseDown={event => event.stopPropagation()}
      >
        <header className="fn-replay-head">
          <div>
            <div className="fn-replay-eyebrow">
              Capture session{conversation ? <> · {conversation.source}</> : null}
            </div>
            <h2>
              {phase === 'capture'
                ? 'Capture excerpts as fragments'
                : conversation
                  ? conversation.title
                  : 'Replay a capture session'}
            </h2>
          </div>
          <button
            type="button"
            className="fn-icon-btn"
            onClick={onClose}
            aria-label="Close capture session"
          >
            <X size={15} />
          </button>
        </header>

        {phase === 'select' && (
          <div className="fn-replay-body fn-scroll">
            <p className="fn-replay-lead">
              Watch a scripted AI conversation replay with a typewriter reveal, then capture the
              parts worth keeping as fragments. Everything here runs on a local fixture — no live
              model is called.
            </p>
            <div className="fn-replay-picker">
              {REPLAY_CONVERSATIONS.map(conv => (
                <button
                  key={conv.id}
                  type="button"
                  className="fn-replay-pick"
                  onClick={() => chooseConversation(conv)}
                >
                  <span className="fn-replay-pick-glyph">{conv.glyph}</span>
                  <span className="fn-replay-pick-copy">
                    <span className="fn-replay-pick-title">{conv.title}</span>
                    <span className="fn-replay-pick-meta">
                      {conv.source} · {conv.messages.length} messages · {conv.excerpts.length}{' '}
                      capturable
                    </span>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'replay' && conversation && (
          <>
            <div className="fn-replay-progress" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="fn-replay-body fn-scroll" aria-live="polite">
              {messages.slice(0, visibleCount).map((message, index) => (
                <ReplayBubble key={index} message={message} glyph={conversation.glyph} />
              ))}
              {typingMessage && (
                <ReplayBubble
                  message={{ ...typingMessage, content: typed }}
                  glyph={conversation.glyph}
                  typing
                />
              )}
              {visibleCount === 0 && !isTyping && (
                <div className="fn-replay-empty">
                  Press play to watch the conversation unfold, then capture excerpts.
                </div>
              )}
              <div ref={scrollEndRef} />
            </div>
            <footer className="fn-replay-controls">
              {isPlaying ? (
                <button type="button" className="fn-btn" onClick={pause}>
                  <Pause size={14} /> Pause
                </button>
              ) : (
                <button
                  type="button"
                  className="fn-btn fn-btn-primary"
                  onClick={finished ? () => setPhase('capture') : play}
                >
                  <Play size={14} />
                  {finished ? 'Capture excerpts' : visibleCount === 0 ? 'Play conversation' : 'Resume'}
                </button>
              )}
              {visibleCount > 0 && (
                <button type="button" className="fn-btn fn-btn-ghost" onClick={restart}>
                  <RotateCcw size={14} /> Restart
                </button>
              )}
              <button
                type="button"
                className="fn-btn fn-btn-ghost"
                onClick={skipToEnd}
                disabled={finished}
              >
                <SkipForward size={14} /> Skip to end
              </button>
            </footer>
          </>
        )}

        {phase === 'capture' && conversation && (
          <>
            {captured > 0 ? (
              <div className="fn-replay-body fn-scroll">
                <div className="fn-replay-done" role="status">
                  <span className="fn-replay-done-mark" aria-hidden="true">
                    <Check size={20} />
                  </span>
                  <div className="fn-replay-done-title">
                    {captured} fragment{captured === 1 ? '' : 's'} captured
                  </div>
                  <p>
                    Filed into{' '}
                    <strong>{dreams.find(d => d.id === destination)?.title ?? 'the dream'}</strong>.
                    Opening it now so you can see them land in the fragments list.
                  </p>
                  <button type="button" className="fn-btn fn-btn-primary" onClick={onClose}>
                    View captured fragments
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="fn-replay-body fn-scroll">
                  <p className="fn-replay-lead">
                    Select the excerpts worth keeping. Each becomes a fragment in the destination
                    dream.
                  </p>
                  <ul className="fn-replay-excerpts">
                    {conversation.excerpts.map((excerpt, index) => {
                      const checked = selected.has(index)
                      return (
                        <li key={index}>
                          <button
                            type="button"
                            className="fn-replay-excerpt"
                            data-checked={checked}
                            aria-pressed={checked}
                            onClick={() => toggleExcerpt(index)}
                          >
                            <span className="fn-replay-check" aria-hidden="true">
                              {checked && <Check size={12} />}
                            </span>
                            <span className="fn-replay-excerpt-copy">
                              <span className="fn-replay-excerpt-title">{excerpt.title}</span>
                              <span className="fn-replay-excerpt-text">{excerpt.content}</span>
                              <span className="fn-replay-excerpt-tags">
                                {excerpt.features.map(feature => (
                                  <span key={feature}>{feature}</span>
                                ))}
                              </span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                <footer className="fn-replay-controls fn-replay-capture-bar">
                  <label className="fn-replay-dest">
                    <span>File into</span>
                    <select
                      value={destination ?? ''}
                      onChange={event => setDestination(Number(event.target.value))}
                    >
                      {dreams.map(dream => (
                        <option key={dream.id} value={dream.id}>
                          {dream.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="fn-replay-capture-actions">
                    <button type="button" className="fn-btn fn-btn-ghost" onClick={restart}>
                      <RotateCcw size={14} /> Replay
                    </button>
                    <button
                      type="button"
                      className="fn-btn fn-btn-primary"
                      onClick={commitCapture}
                      disabled={selected.size === 0 || destination == null}
                    >
                      Capture {selected.size || ''} fragment{selected.size === 1 ? '' : 's'}
                    </button>
                  </div>
                </footer>
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function ReplayBubble({ message, glyph, typing }) {
  const isUser = message.role === 'user'
  return (
    <div className="fn-replay-row" data-role={isUser ? 'user' : 'assistant'}>
      <div className="fn-replay-avatar" aria-hidden="true">
        {isUser ? 'You' : glyph}
      </div>
      <div className="fn-replay-bubble">
        <span className="fn-replay-bubble-text">
          {message.content}
          {typing && <span className="fn-replay-caret" aria-hidden="true" />}
        </span>
      </div>
    </div>
  )
}

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mql = window.matchMedia(query)
    const onChange = event => setReduced(event.matches)
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}
