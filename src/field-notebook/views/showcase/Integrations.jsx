import { useState } from 'react'
import { INTEGRATIONS } from '../../fixtures'
import { fmtRel } from '../../helpers'
import { INTEGRATION_META } from './_shared'

export function Integrations({ onDemoAction }) {
  const [connections, setConnections] = useState(
    Object.fromEntries(INTEGRATIONS.map(integration => [integration.id, integration.status]))
  )
  const toggle = id => {
    setConnections(current => ({
      ...current,
      [id]: current[id] === 'connected' ? 'available' : 'connected',
    }))
    onDemoAction?.('Integration connection state is simulated locally for the public preview.')
  }

  return (
    <div className="integrations" data-screen-label="Integrations">
      <div className="page-head-2">
        <div>
          <div className="l">Integrations</div>
          <h1>
            Connect Dreamcatcher to where <em>work happens</em>.
          </h1>
          <p className="lead">
            GitHub commits become fragments. Slack threads file into dreams. Calendar holds your
            todo deadlines. Mostly Teams-tier.
          </p>
        </div>
      </div>

      {INTEGRATIONS.map(integration => {
        const status = connections[integration.id]
        const meta = INTEGRATION_META[integration.id]
        return (
          <article key={integration.id} className="integration-row">
            <div className="integration-logo">{integration.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <h3 className="integration-name">{integration.name}</h3>
              <p className="integration-detail">{integration.detail}</p>
              {status === 'connected' && (
                <div className="integration-sync">
                  {meta.events.toLocaleString()} events · last sync{' '}
                  {meta.lastSync ? fmtRel(meta.lastSync) : '—'}
                </div>
              )}
            </div>
            <div className="integration-tier">{meta.tier}</div>
            <div className="integration-actions">
              <span className={`status ${status}`}>
                {status === 'connected' ? '● connected' : '○ available'}
              </span>
              <button
                type="button"
                className={`fn-btn ${status === 'connected' ? '' : 'fn-btn-primary'}`}
                onClick={() => toggle(integration.id)}
              >
                {status === 'connected' ? 'Manage' : 'Connect'}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
