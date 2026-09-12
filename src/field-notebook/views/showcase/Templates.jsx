import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { TEMPLATES } from '../../fixtures'
import { TEMPLATE_META } from './_shared'

export function Templates({ onApply }) {
  const [filter, setFilter] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const list = TEMPLATES.filter(template => {
    const meta = TEMPLATE_META[template.id]
    if (filter === 'free') return meta.free
    if (filter === 'paid') return !meta.free
    return true
  })

  return (
    <div className="templates" data-screen-label="Templates">
      <div className="page-head-2">
        <div>
          <div className="l">Templates · marketplace</div>
          <h1>
            Do not start from a <em>blank page</em>.
          </h1>
          <p className="lead">
            Apply a community template to skip the structural work. Authors keep 70% of paid sales.
          </p>
        </div>
        <div className="fn-chip-row">
          <button
            type="button"
            className="fn-chip"
            data-active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All ({TEMPLATES.length})
          </button>
          <button
            type="button"
            className="fn-chip"
            data-active={filter === 'free'}
            onClick={() => setFilter('free')}
          >
            Free
          </button>
          <button
            type="button"
            className="fn-chip"
            data-active={filter === 'paid'}
            onClick={() => setFilter('paid')}
          >
            Paid
          </button>
        </div>
      </div>

      <div className="templates-grid">
        {list.map(template => {
          const meta = TEMPLATE_META[template.id]
          return (
            <article key={template.id} className="template-card">
              <div className="author">by {meta.author}</div>
              <h4>{template.title}</h4>
              <p className="desc">{template.description}</p>
              <div className="meta">
                <span>
                  {template.sections} sections · {template.includedTodos} todos
                </span>
                <span className="stars">★ {meta.rating}</span>
              </div>
              <div className="meta template-price-row">
                <span>{meta.downloads.toLocaleString()} downloads</span>
                <span className={`price ${meta.free ? 'free' : ''}`}>{meta.price}</span>
              </div>
              <div className="template-card-actions">
                <button
                  type="button"
                  className="fn-btn"
                  onClick={() => setSelectedTemplate(template)}
                >
                  Preview
                </button>
                <button
                  type="button"
                  className="fn-btn fn-btn-primary"
                  onClick={() => setSelectedTemplate(template)}
                >
                  Use template
                </button>
              </div>
            </article>
          )
        })}
      </div>
      <TemplatePreviewDialog
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onApply={template => {
          setSelectedTemplate(null)
          onApply(template)
        }}
      />
    </div>
  )
}

function TemplatePreviewDialog({ template, onClose, onApply }) {
  useEffect(() => {
    if (!template) return undefined
    const onKey = event => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, template])

  if (!template) return null
  const meta = TEMPLATE_META[template.id]

  return (
    <div className="template-preview-back" role="presentation" onClick={onClose}>
      <section
        className="template-preview"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-preview-title"
        aria-label={`${template.title} template preview`}
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          className="template-preview-close"
          onClick={onClose}
          aria-label="Close template preview"
        >
          <X size={14} />
        </button>
        <div className="fn-mono-label">Template preview</div>
        <h2 id="template-preview-title">{template.title}</h2>
        <p>{template.description}</p>
        <dl>
          <div>
            <dt>Author</dt>
            <dd>{meta.author}</dd>
          </div>
          <div>
            <dt>Structure</dt>
            <dd>
              {template.sections} sections · {template.includedTodos} starter todos
            </dd>
          </div>
          <div>
            <dt>Tags</dt>
            <dd>{template.tags.map(tag => `#${tag}`).join(' ')}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{meta.price}</dd>
          </div>
        </dl>
        <div className="template-preview-actions">
          <button type="button" className="fn-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="fn-btn fn-btn-primary" onClick={() => onApply(template)}>
            Create dream from template
          </button>
        </div>
      </section>
    </div>
  )
}
