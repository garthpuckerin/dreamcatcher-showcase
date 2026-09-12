import { X } from 'lucide-react'

const THEMES = [
  { value: 'paper', label: 'Paper' },
  { value: 'slate', label: 'Slate' },
  { value: 'ink', label: 'Ink' },
  { value: 'ocean', label: 'Ocean' },
]

const ACCENTS = [
  { value: 'violet', label: 'Violet' },
  { value: 'amber', label: 'Amber' },
  { value: 'forest', label: 'Forest' },
  { value: 'rust', label: 'Rust' },
  { value: 'sky', label: 'Sky' },
  { value: 'sun', label: 'Sun' },
]

export default function AppearancePanel({ open, onClose, appearance, onUpdate }) {
  if (!open) return null
  return (
    <aside className="fn-appearance-panel" role="dialog" aria-modal="true" aria-label="Appearance">
      <header className="fn-appearance-head">
        <h2>Appearance</h2>
        <button
          type="button"
          onClick={onClose}
          className="fn-icon-btn"
          aria-label="Close Appearance"
        >
          <X size={14} />
        </button>
      </header>

      <div className="fn-appearance-body">
        <Group label="Theme">
          <Swatches
            options={THEMES}
            value={appearance.theme}
            onChange={v => onUpdate({ theme: v })}
          />
        </Group>
        <Group label="Accent">
          <Swatches
            options={ACCENTS}
            value={appearance.accent}
            onChange={v => onUpdate({ accent: v })}
          />
        </Group>
        <Group label="Density">
          <Pill
            options={[
              { value: 'comfy', label: 'Comfy' },
              { value: 'compact', label: 'Compact' },
            ]}
            value={appearance.density}
            onChange={v => onUpdate({ density: v })}
          />
        </Group>
        <Group label="Headlines">
          <Pill
            options={[
              { value: true, label: 'Serif' },
              { value: false, label: 'Sans' },
            ]}
            value={appearance.serif}
            onChange={v => onUpdate({ serif: v })}
          />
        </Group>
      </div>
    </aside>
  )
}

function Group({ label, children }) {
  return (
    <div className="fn-appearance-group">
      <div className="fn-appearance-label">{label}</div>
      {children}
    </div>
  )
}

function Swatches({ options, value, onChange }) {
  return (
    <div className="fn-appearance-swatches">
      {options.map(opt => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className="fn-appearance-swatch"
          data-active={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Pill({ options, value, onChange }) {
  return (
    <div className="fn-appearance-pill">
      {options.map(opt => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          data-active={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
