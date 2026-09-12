import { cloneElement, isValidElement, useState } from 'react'
import { INTEGRATIONS, USER } from '../../fixtures'
import { INTEGRATION_META } from './_shared'

const SETTINGS_TAB_KEY = 'fn:settings-tab:v1'

export function Settings({
  appearance,
  onUpdateAppearance,
  onOpenAppearance,
  onReplayOnboarding,
  onDemoAction,
}) {
  const [tab, setTabState] = useState(() => {
    try {
      return window.localStorage.getItem(SETTINGS_TAB_KEY) || 'account'
    } catch {
      return 'account'
    }
  })
  const [prefs, setPrefs] = useState({
    publicProfile: false,
    notifEmail: true,
    notifSlack: false,
    notifDigest: true,
    aiAutoSummary: true,
    aiAutoTags: true,
    aiAutoBreakdown: false,
    aiSemanticSearch: true,
    aiLocalEmbeddings: false,
    githubConnected: false,
    githubPrSync: true,
    githubIssueSync: true,
    githubAiSummaries: true,
    exportAutoBackup: false,
    exportMarkdown: true,
    exportJson: true,
    workspaceAutoArchive: false,
    workspaceWeeklyReview: true,
    workspaceDefaultPrivate: true,
    workspaceRequirePromotion: true,
    dataLocalFirst: true,
    dataRetention: true,
    dataTelemetry: false,
    dataPrivateIndex: true,
  })
  const set = (key, value) => setPrefs(current => ({ ...current, [key]: value }))
  const setTab = nextTab => {
    setTabState(nextTab)
    try {
      window.localStorage.setItem(SETTINGS_TAB_KEY, nextTab)
    } catch {
      /* no-op */
    }
  }
  const setAppearance = (key, value) => onUpdateAppearance?.({ [key]: value })
  const themeOptions = [
    ['paper', 'Paper'],
    ['slate', 'Slate'],
    ['ink', 'Ink'],
    ['ocean', 'Ocean'],
  ]
  const hueOptions = [
    ['violet', 'Violet'],
    ['amber', 'Amber'],
    ['forest', 'Forest'],
    ['rust', 'Rust'],
    ['sky', 'Sky'],
    ['sun', 'Sun'],
  ]
  const densityOptions = [
    ['comfy', 'Comfy'],
    ['compact', 'Compact'],
  ]
  const sections = [
    ['account', 'Account'],
    ['appearance', 'Appearance'],
    ['workspace', 'Workspace'],
    ['ai', 'AI configuration'],
    ['github', 'GitHub'],
    ['integrations', 'Integrations'],
    ['export', 'Export & backup'],
    ['notifications', 'Notifications'],
    ['data', 'Data & privacy'],
    ['danger', 'Danger zone'],
  ]

  return (
    <div className="settings" data-screen-label="Settings">
      <nav className="settings-nav" data-tour="fn-settings-nav">
        {sections.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {/* Phone section picker: a native <select> (OS picker sheet on iOS /
          Android) instead of the 220px sidebar squeezed beside the content.
          Visibility is swapped with .settings-nav in theme.css at ≤900px. */}
      <div className="settings-jump" data-tour="fn-settings-jump">
        <label className="fn-mono-label" htmlFor="settings-section-picker">
          Section
        </label>
        <select
          id="settings-section-picker"
          className="settings-input"
          value={tab}
          onChange={event => setTab(event.target.value)}
        >
          {sections.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        {tab === 'account' && (
          <div className="settings-section">
            <h2>Account</h2>
            <p className="sub">Identity, profile, and login methods.</p>
            <SettingsRow title="Name" body="Shown to collaborators and on public case studies.">
              <input className="settings-input settings-input-wide" defaultValue={USER.name} />
            </SettingsRow>
            <SettingsRow title="Email" body="Used for sign-in and notifications.">
              <input className="settings-input settings-input-wide" defaultValue={USER.email} />
            </SettingsRow>
            <SettingsRow title="Public profile" body={`Show portfolio at /${USER.workspace}.`}>
              <Toggle
                label="Toggle public profile"
                on={prefs.publicProfile}
                onClick={() => set('publicProfile', !prefs.publicProfile)}
              />
            </SettingsRow>
            <SettingsRow title="Workspace handle" body="The slug used for portfolio URLs.">
              <span className="settings-value">dreamcatcher.dev/{USER.workspace}</span>
            </SettingsRow>
            <SettingsRow title="Onboarding" body="Replay the guided Field Notebook walkthrough.">
              <button type="button" className="fn-btn" onClick={onReplayOnboarding}>
                Replay tour
              </button>
            </SettingsRow>
          </div>
        )}

        {tab === 'appearance' && (
          <div className="settings-section">
            <h2>Appearance</h2>
            <p className="sub">Theme, hue, and density for this workspace.</p>
            <SettingsRow title="Theme" body="Surface palette for the whole app.">
              <div className="settings-control-group">
                {themeOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={appearance.theme === value ? 'fn-btn fn-btn-primary' : 'fn-btn'}
                    onClick={() => setAppearance('theme', value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </SettingsRow>
            <SettingsRow title="Hue" body="Accent color used for highlights and primary actions.">
              <div className="settings-control-group">
                {hueOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={appearance.accent === value ? 'fn-btn fn-btn-primary' : 'fn-btn'}
                    onClick={() => setAppearance('accent', value)}
                  >
                    <span className="settings-swatch" data-hue={value} />
                    {label}
                  </button>
                ))}
              </div>
            </SettingsRow>
            <SettingsRow
              title="Density"
              body="Comfy adds breathing room; compact fits more on screen."
            >
              <div className="settings-control-group">
                {densityOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={appearance.density === value ? 'fn-btn fn-btn-primary' : 'fn-btn'}
                    onClick={() => setAppearance('density', value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </SettingsRow>
            <SettingsRow title="Serif headlines" body="Use Newsreader for titles and headings.">
              <Toggle
                label="Toggle serif headlines"
                on={appearance.serif}
                onClick={() => setAppearance('serif', !appearance.serif)}
              />
            </SettingsRow>
            <SettingsRow
              title="Floating controls"
              body="Open the compact production Appearance panel."
            >
              <button type="button" className="fn-btn" onClick={onOpenAppearance}>
                Open Appearance
              </button>
            </SettingsRow>
          </div>
        )}

        {tab === 'workspace' && (
          <div className="settings-section">
            <h2>Workspace</h2>
            <p className="sub">Defaults, taxonomy, review cadence, and collaboration policy.</p>
            <div className="plan-card">
              <div>
                <div className="label">Workspace</div>
                <div className="name">{USER.workspace}</div>
              </div>
              <div>
                <div className="settings-value">
                  {USER.used}/{USER.limit} dreams
                </div>
                <div className="usage-bar">
                  <i style={{ width: `${(USER.used / USER.limit) * 100}%` }} />
                </div>
              </div>
            </div>
            <SettingsRow title="Default brand" body="Brand assigned to newly created dreams.">
              <select className="settings-input" defaultValue="product">
                <option value="product">Product</option>
                <option value="client">Client</option>
                <option value="team">Team Ops</option>
                <option value="research">Research</option>
                <option value="personal">Personal</option>
              </select>
            </SettingsRow>
            <SettingsRow title="Default status" body="State used when a dream is created manually.">
              <select className="settings-input" defaultValue="planning">
                <option value="idea">Idea</option>
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
              </select>
            </SettingsRow>
            <SettingsRow
              title="Review cadence"
              body="How often stale dreams are surfaced for triage."
            >
              <select className="settings-input" defaultValue="weekly">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Every two weeks</option>
                <option value="monthly">Monthly</option>
              </select>
            </SettingsRow>
            <SettingsRow
              title="Auto-archive stale dreams"
              body="Move inactive abandoned dreams into Archive."
            >
              <Toggle
                label="Toggle auto-archive stale dreams"
                on={prefs.workspaceAutoArchive}
                onClick={() => set('workspaceAutoArchive', !prefs.workspaceAutoArchive)}
              />
            </SettingsRow>
            <SettingsRow
              title="Weekly review ritual"
              body="Keep the Today dashboard review module active."
            >
              <Toggle
                label="Toggle weekly review ritual"
                on={prefs.workspaceWeeklyReview}
                onClick={() => set('workspaceWeeklyReview', !prefs.workspaceWeeklyReview)}
              />
            </SettingsRow>
            <SettingsRow
              title="Default private"
              body="New dreams stay private until explicitly published."
            >
              <Toggle
                label="Toggle default private"
                on={prefs.workspaceDefaultPrivate}
                onClick={() => set('workspaceDefaultPrivate', !prefs.workspaceDefaultPrivate)}
              />
            </SettingsRow>
            <SettingsRow
              title="Require wiki promotion"
              body="Fragments must be promoted before todos are finalized."
            >
              <Toggle
                label="Toggle wiki promotion requirement"
                on={prefs.workspaceRequirePromotion}
                onClick={() => set('workspaceRequirePromotion', !prefs.workspaceRequirePromotion)}
              />
            </SettingsRow>
            <SettingsRow
              title="Invite policy"
              body="Production teams can restrict invites by domain."
            >
              <select className="settings-input" defaultValue="workspace">
                <option value="owner">Owner only</option>
                <option value="workspace">Workspace members</option>
                <option value="domain">Approved domain</option>
              </select>
            </SettingsRow>
          </div>
        )}
        {tab === 'ai' && (
          <div className="settings-section">
            <h2>AI configuration</h2>
            <p className="sub">
              Production-bound AI surfaces from the legacy build, represented here without storing
              public-demo secrets.
            </p>
            <div className="settings-callout">
              Public preview mode: provider credentials, encrypted key storage, rate limits, and
              production observability are not wired in this repo.
            </div>
            <SettingsRow
              title="AI features"
              body="Master switch for summaries, tags, todos, and search."
            >
              <Toggle
                label="Toggle AI features"
                on={prefs.aiAutoSummary || prefs.aiAutoTags || prefs.aiAutoBreakdown}
                onClick={() => {
                  const next = !(prefs.aiAutoSummary || prefs.aiAutoTags || prefs.aiAutoBreakdown)
                  set('aiAutoSummary', next)
                  set('aiAutoTags', next)
                  set('aiAutoBreakdown', next)
                }}
              />
            </SettingsRow>
            <SettingsRow title="Provider" body="Default model provider for production AI routing.">
              <select className="settings-input" defaultValue="default">
                <option value="default">Default</option>
                <option value="local">Local embeddings</option>
                <option value="router">Provider router</option>
                <option value="custom">Custom endpoint…</option>
              </select>
            </SettingsRow>
            <SettingsRow
              title="Primary model"
              body="Used for summarization and case-study drafting."
            >
              <select className="settings-input" defaultValue="default">
                <option value="default">Default</option>
                <option value="fast">Fast</option>
                <option value="local">Local model</option>
                <option value="custom">Custom model…</option>
              </select>
            </SettingsRow>
            <SettingsRow
              title="API key storage"
              body="Production stores provider keys server-side and encrypted."
            >
              <span className="settings-status" data-tone="warn">
                Not stored in this preview
              </span>
            </SettingsRow>
            <SettingsRow title="Auto summaries" body="Generate summaries when fragments are added.">
              <Toggle
                label="Toggle auto summaries"
                on={prefs.aiAutoSummary}
                onClick={() => set('aiAutoSummary', !prefs.aiAutoSummary)}
              />
            </SettingsRow>
            <SettingsRow title="Auto tags" body="Suggest tags and brands for new captures.">
              <Toggle
                label="Toggle auto tags"
                on={prefs.aiAutoTags}
                onClick={() => set('aiAutoTags', !prefs.aiAutoTags)}
              />
            </SettingsRow>
            <SettingsRow title="Todo breakdown" body="Break long fragments into draft todos.">
              <Toggle
                label="Toggle todo breakdown"
                on={prefs.aiAutoBreakdown}
                onClick={() => set('aiAutoBreakdown', !prefs.aiAutoBreakdown)}
              />
            </SettingsRow>
            <SettingsRow title="Semantic search" body="Index fragments for workspace search.">
              <Toggle
                label="Toggle semantic search"
                on={prefs.aiSemanticSearch}
                onClick={() => set('aiSemanticSearch', !prefs.aiSemanticSearch)}
              />
            </SettingsRow>
            <SettingsRow
              title="Local embeddings"
              body="Production option for private/local vector generation."
            >
              <Toggle
                label="Toggle local embeddings"
                on={prefs.aiLocalEmbeddings}
                onClick={() => set('aiLocalEmbeddings', !prefs.aiLocalEmbeddings)}
              />
            </SettingsRow>
          </div>
        )}
        {tab === 'github' && (
          <div className="settings-section">
            <h2>GitHub</h2>
            <p className="sub">
              Repository linking, commit/PR capture, and wiki sync from the legacy settings flow.
            </p>
            <div className="settings-integration-card">
              <div className="integration-logo">GH</div>
              <div>
                <h3 className="integration-name">GitHub workspace connection</h3>
                <p className="integration-detail">
                  Link repos to dreams, convert commits and pull requests into fragments, and sync
                  activity into the dream wiki.
                </p>
              </div>
              <span className="settings-status" data-tone={prefs.githubConnected ? 'good' : 'warn'}>
                {prefs.githubConnected ? 'connected' : 'demo disconnected'}
              </span>
              <button
                type="button"
                className="fn-btn fn-btn-primary"
                onClick={() => {
                  set('githubConnected', !prefs.githubConnected)
                  onDemoAction?.('GitHub OAuth is simulated in this public preview.')
                }}
              >
                {prefs.githubConnected ? 'Disconnect' : 'Connect GitHub'}
              </button>
            </div>
            <SettingsRow
              title="OAuth scopes"
              body="Production requests repo, user, and read:org scopes."
            >
              <div className="settings-token-row">
                {['repo', 'user', 'read:org'].map(scope => (
                  <span key={scope}>{scope}</span>
                ))}
              </div>
            </SettingsRow>
            <SettingsRow title="Repository linking" body="Attach one or more repos to a dream.">
              <span className="settings-status" data-tone="good">
                Available in product UI
              </span>
            </SettingsRow>
            <SettingsRow
              title="Pull request sync"
              body="Capture PR title, summary, status, and links."
            >
              <Toggle
                label="Toggle pull request sync"
                on={prefs.githubPrSync}
                onClick={() => set('githubPrSync', !prefs.githubPrSync)}
              />
            </SettingsRow>
            <SettingsRow
              title="Issue sync"
              body="Bring issues and milestones into timeline context."
            >
              <Toggle
                label="Toggle issue sync"
                on={prefs.githubIssueSync}
                onClick={() => set('githubIssueSync', !prefs.githubIssueSync)}
              />
            </SettingsRow>
            <SettingsRow
              title="AI activity summaries"
              body="Summarize commits and PRs before wiki updates."
            >
              <Toggle
                label="Toggle AI activity summaries"
                on={prefs.githubAiSummaries}
                onClick={() => set('githubAiSummaries', !prefs.githubAiSummaries)}
              />
            </SettingsRow>
          </div>
        )}
        {tab === 'integrations' && (
          <div className="settings-section">
            <h2>Integrations</h2>
            <p className="sub">Provider connection settings mirrored from the product surface.</p>
            <div className="settings-card-grid">
              {INTEGRATIONS.map(integration => {
                const meta = INTEGRATION_META[integration.id]
                return (
                  <article key={integration.id} className="settings-mini-card">
                    <div className="settings-mini-card-head">
                      <div className="integration-logo">
                        {integration.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        className="settings-status"
                        data-tone={integration.status === 'connected' ? 'good' : 'warn'}
                      >
                        {integration.status}
                      </span>
                    </div>
                    <h3>{integration.name}</h3>
                    <p>{integration.detail}</p>
                    <div className="settings-value">
                      {meta.tier} · {meta.events.toLocaleString()} events
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}
        {tab === 'export' && (
          <div className="settings-section">
            <h2>Export & backup</h2>
            <p className="sub">
              Legacy export/backup controls brought forward for portfolio review.
            </p>
            <SettingsRow title="Auto backup" body="Schedule recurring exports in production.">
              <Toggle
                label="Toggle auto backup"
                on={prefs.exportAutoBackup}
                onClick={() => set('exportAutoBackup', !prefs.exportAutoBackup)}
              />
            </SettingsRow>
            <SettingsRow
              title="Markdown export"
              body="Export dream wiki, todos, fragments, and timeline."
            >
              <Toggle
                label="Toggle Markdown export"
                on={prefs.exportMarkdown}
                onClick={() => set('exportMarkdown', !prefs.exportMarkdown)}
              />
            </SettingsRow>
            <SettingsRow
              title="JSON export"
              body="Machine-readable workspace export for migration."
            >
              <Toggle
                label="Toggle JSON export"
                on={prefs.exportJson}
                onClick={() => set('exportJson', !prefs.exportJson)}
              />
            </SettingsRow>
            <SettingsRow title="Last backup" body="Demo workspace has no remote backup schedule.">
              <span className="settings-value">Not configured</span>
            </SettingsRow>
          </div>
        )}
        {tab === 'notifications' && (
          <div className="settings-section">
            <h2>Notifications</h2>
            <p className="sub">Digest and collaboration notifications.</p>
            <SettingsRow title="Email digest" body="Weekly summary of stale dreams and open todos.">
              <Toggle
                label="Toggle email digest"
                on={prefs.notifEmail}
                onClick={() => set('notifEmail', !prefs.notifEmail)}
              />
            </SettingsRow>
            <SettingsRow title="Slack pings" body="Notify on mentions and assigned todos.">
              <Toggle
                label="Toggle Slack pings"
                on={prefs.notifSlack}
                onClick={() => set('notifSlack', !prefs.notifSlack)}
              />
            </SettingsRow>
          </div>
        )}
        {tab === 'data' && (
          <div className="settings-section">
            <h2>Data & privacy</h2>
            <p className="sub">
              Public-preview data policy, retention defaults, and privacy controls for production.
            </p>
            <div className="settings-callout">
              This demo stores preview state in browser localStorage. Production persistence,
              encryption, access logs, and account deletion workflows live outside this public repo.
            </div>
            <SettingsRow
              title="Storage mode"
              body="Where this public preview stores editable state."
            >
              <span className="settings-status" data-tone="good">
                Local browser
              </span>
            </SettingsRow>
            <SettingsRow
              title="Local-first mode"
              body="Allow work to continue when backend sync is unavailable."
            >
              <Toggle
                label="Toggle local-first mode"
                on={prefs.dataLocalFirst}
                onClick={() => set('dataLocalFirst', !prefs.dataLocalFirst)}
              />
            </SettingsRow>
            <SettingsRow title="Fragment retention" body="Default production retention window.">
              <select className="settings-input" defaultValue="forever">
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="forever">Keep until deleted</option>
              </select>
            </SettingsRow>
            <SettingsRow
              title="Private search index"
              body="Keep semantic indexes scoped to the workspace."
            >
              <Toggle
                label="Toggle private search index"
                on={prefs.dataPrivateIndex}
                onClick={() => set('dataPrivateIndex', !prefs.dataPrivateIndex)}
              />
            </SettingsRow>
            <SettingsRow title="Telemetry" body="Share anonymized product usage in production.">
              <Toggle
                label="Toggle telemetry"
                on={prefs.dataTelemetry}
                onClick={() => set('dataTelemetry', !prefs.dataTelemetry)}
              />
            </SettingsRow>
            <SettingsRow
              title="Audit log"
              body="Track restore, delete, publish, and integration actions."
            >
              <span className="settings-status" data-tone="warn">
                Production-bound
              </span>
            </SettingsRow>
            <SettingsRow
              title="Export workspace"
              body="Download all dreams, fragments, todos, and wiki pages."
            >
              <button
                type="button"
                className="fn-btn"
                onClick={() =>
                  onDemoAction?.(
                    'Workspace export is represented here; production export is backend-wired.'
                  )
                }
              >
                Export data
              </button>
            </SettingsRow>
            <SettingsRow
              title="Clear local demo state"
              body="Reset the browser-only public preview data."
            >
              <button
                type="button"
                className="fn-btn settings-danger-button"
                onClick={() =>
                  onDemoAction?.(
                    'Use browser storage controls to clear local preview data for this demo.'
                  )
                }
              >
                Clear local data
              </button>
            </SettingsRow>
          </div>
        )}
        {tab === 'danger' && (
          <div className="settings-section">
            <h2 className="settings-danger-title">Danger zone</h2>
            <p className="sub">Things that cannot be undone. Read twice.</p>
            <SettingsRow
              title="Reset workspace"
              body="Delete every dream, fragment, todo, and document."
            >
              <button
                type="button"
                className="fn-btn settings-danger-button"
                onClick={() =>
                  onDemoAction?.('Workspace reset is disabled in the public preview demo.')
                }
              >
                Reset...
              </button>
            </SettingsRow>
            <SettingsRow
              title="Delete account"
              body="Permanent. Within 30 days a recovery is possible; after that it is gone."
            >
              <button
                type="button"
                className="fn-btn settings-danger-button"
                onClick={() =>
                  onDemoAction?.('Account deletion is disabled in the public preview demo.')
                }
              >
                Delete...
              </button>
            </SettingsRow>
          </div>
        )}
      </div>
    </div>
  )
}

// A bare <select>/<input> control inherits the row title as its accessible
// name (axe: select-name / label) — the visual label is the row's <h4>, which
// is not associated with the control by markup.
const NATIVE_FIELD_TYPES = new Set(['select', 'input', 'textarea'])

function SettingsRow({ title, body, children }) {
  const control =
    isValidElement(children) &&
    typeof children.type === 'string' &&
    NATIVE_FIELD_TYPES.has(children.type) &&
    !children.props['aria-label']
      ? cloneElement(children, { 'aria-label': title })
      : children
  return (
    <div className="settings-row">
      <div>
        <h4>{title}</h4>
        <p>{body}</p>
      </div>
      <div className="control">{control}</div>
    </div>
  )
}

function Toggle({ label, on, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label ?? 'Toggle setting'}
      className={`toggle ${on ? 'on' : ''}`}
      onClick={onClick}
    />
  )
}
