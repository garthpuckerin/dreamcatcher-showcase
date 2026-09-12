import { CheckCircle2, Circle } from 'lucide-react'

export function TemplateAppliedNotice({ template, onClose }) {
  if (!template) return null
  return (
    <div className="fn-toast" role="status">
      <CheckCircle2 size={15} />
      <span>{template.title} applied as a new dream.</span>
      <button type="button" onClick={onClose}>
        <Circle size={12} />
      </button>
    </div>
  )
}

export function DemoNotice({ message, onClose }) {
  if (!message) return null
  return (
    <div className="fn-toast fn-toast-demo" role="status">
      <SparkleMark />
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss demo notice">
        <Circle size={12} />
      </button>
    </div>
  )
}

function SparkleMark() {
  return <span aria-hidden="true">*</span>
}
