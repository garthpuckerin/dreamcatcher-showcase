import { useMemo, useState } from 'react'
import { BRANDS } from '../../fixtures'
import { isoFromToday, TODAY } from '../../dates'

// Last 12 weeks (84 days) of activity, ending TODAY. Index 0 is the oldest day,
// index 83 is today, so the heatmap always closes on the current period. Counts
// follow a fixed deterministic pattern — no Math.random.
const ACTIVITY = Array.from({ length: 84 }, (_, index) => ({
  date: isoFromToday(index - 83),
  count: [0, 1, 4, 2, 7, 3, 1, 5, 8, 2, 0, 3][index % 12],
}))

export function Analytics({ dreams }) {
  const totals = useMemo(() => {
    const fragments = dreams.reduce((n, dream) => n + dream.fragments.length, 0)
    const todosDone = dreams.reduce(
      (n, dream) => n + dream.todos.filter(todo => todo.done).length,
      0
    )
    const todosAll = dreams.reduce((n, dream) => n + dream.todos.length, 0)
    return {
      dreams: dreams.length,
      fragments,
      velocity: '4.2',
      doneRate: todosAll ? Math.round((todosDone / todosAll) * 100) : 0,
    }
  }, [dreams])
  const bars = [3, 8, 5, 11, 7, 14, 9, 12, 6, 18, 10, 14]
  const maxBar = Math.max(...bars)
  const trendSeries = useMemo(() => buildTrendSeries(dreams, 8), [dreams])
  const velocity = useMemo(() => buildVelocity(dreams), [dreams])
  const byBrand = BRANDS.map(brand => ({
    ...brand,
    count: dreams
      .filter(dream => dream.brand === brand.value)
      .reduce((n, dream) => n + dream.fragments.length, 0),
  }))
  const totalFrag = byBrand.reduce((n, brand) => n + brand.count, 0) || 1
  const palette = {
    product: 'var(--accent)',
    client: 'oklch(0.62 0.14 65)',
    team: 'oklch(0.48 0.11 155)',
    research: 'oklch(0.52 0.15 35)',
    personal: 'oklch(0.55 0.01 60)',
  }
  let offset = 0
  const circumference = 2 * Math.PI * 50

  return (
    <div className="analytics" data-screen-label="Analytics">
      <div className="page-head-2">
        <div>
          <div className="l">Analytics · last 12 weeks</div>
          <h1>
            Velocity, density, and where your <em>thinking</em> lives.
          </h1>
          <p className="lead">
            A measure of how the workspace is moving. Not productivity theatre — patterns to help
            you decide where to spend the next week.
          </p>
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi label="Dream velocity" value={totals.velocity} delta="+ 0.6 vs prior quarter" />
        <Kpi label="Fragments / week" value="9.7" delta="+ 22% vs 90-day avg" />
        <Kpi label="Todo completion" value={`${totals.doneRate}%`} delta="- 4 pts" down />
        <Kpi label="AI accepts" value="71%" delta="+ 8 pts vs prior month" />
      </div>

      <div className="analytics-row">
        <section className="analytics-card">
          <h3>Fragments per week</h3>
          <div className="sub">last 12 weeks · all dreams</div>
          <div className="bars">
            {bars.map((value, index) => (
              <div
                key={index}
                className="bar"
                style={{ height: `${(value / maxBar) * 100}%` }}
                data-v={value}
              />
            ))}
          </div>
          <div className="bars-axis">
            <span>12w ago</span>
            <span>9w</span>
            <span>6w</span>
            <span>3w</span>
            <span>now</span>
          </div>
        </section>
        <section className="analytics-card">
          <h3>Fragments by brand</h3>
          <div className="sub">all-time distribution</div>
          <div className="donut-row">
            <svg
              className="donut-svg"
              viewBox="0 0 120 120"
              aria-label={`${totals.fragments} fragments`}
            >
              <circle className="track" cx="60" cy="60" r="50" />
              {byBrand.map(brand => {
                if (!brand.count) return null
                const len = (brand.count / totalFrag) * circumference
                const element = (
                  <circle
                    key={brand.value}
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={palette[brand.value]}
                    strokeDasharray={`${len} ${circumference}`}
                    strokeDashoffset={-offset}
                  />
                )
                offset += len
                return element
              })}
            </svg>
            <div className="donut-legend">
              {byBrand.map(brand => (
                <div key={brand.value} className="row">
                  <span>
                    <span className="sw" style={{ background: palette[brand.value] }} />
                    {brand.label}
                  </span>
                  <span className="v">{brand.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="analytics-row">
        <section className="analytics-card">
          <h3>Capture vs. completion trend</h3>
          <div className="sub">last 8 weeks · fragments vs. todos done</div>
          <TrendsChart series={trendSeries} />
        </section>
        <section className="analytics-card">
          <h3>Completion velocity</h3>
          <div className="sub">days to complete · color by speed</div>
          <VelocityChart velocity={velocity} />
        </section>
      </div>

      <div className="analytics-row analytics-even">
        <section className="analytics-card">
          <h3>Activity heatmap</h3>
          <div className="sub">last 12 weeks · daily fragments + todos</div>
          <div className="heatmap">
            {ACTIVITY.map((item, index) => (
              <div
                key={`${item.date}-${index}`}
                className="cell"
                data-l={Math.min(4, Math.floor(item.count / 2))}
                title={`${item.date} · ${item.count}`}
              />
            ))}
          </div>
          <div className="heatmap-legend">
            <span>less</span>
            <div className="ramp">
              {[0, 1, 2, 3, 4].map(level => (
                <div key={level} className="cell" data-l={level} />
              ))}
            </div>
            <span>more</span>
          </div>
        </section>
        <section className="analytics-card">
          <h3>Insights</h3>
          <div className="sub">automated · refreshes hourly</div>
          <div className="insight-list">
            <Insight
              icon="!"
              title="Promotion lag."
              body="Median fragment age before wiki promotion is 11 days — up from 6 last month."
            />
            <Insight
              icon="↗"
              title="Research is heating up."
              body="Embeddings research had three captures this week; no prior week had more than one."
            />
            <Insight
              icon="↓"
              title="Northwind retainer is closing."
              body="Last fragment 38 days ago; consider archiving or starting an analytics-phase dream."
            />
            <Insight
              icon="*"
              title="You write best on Tuesdays."
              body="4.1x more captures on Tuesdays than weekends. Schedule deep work accordingly."
            />
          </div>
        </section>
      </div>
    </div>
  )
}

// ── Analytics: derived series (computed from existing fixtures, no backend) ──

// Bucket fragment captures and completed-todo deadlines into the last N ISO
// weeks so the trends line chart is fed entirely from the dreams prop.
function buildTrendSeries(dreams, weeks = 8) {
  const dayMs = 86400000
  // Trailing window ends on the real current week so the chart always closes on
  // "now"; fragment/todo dates have been shifted by the same offset (dates.js),
  // so they fall into the same buckets they did against the old frozen anchor.
  const now = TODAY
  const start = new Date(now.getTime() - (weeks - 1) * 7 * dayMs)
  const buckets = Array.from({ length: weeks }, (_, index) => ({
    date: new Date(start.getTime() + index * 7 * dayMs),
    fragments: 0,
    todosDone: 0,
  }))
  const indexOf = value => {
    if (!value) return -1
    const week = Math.floor((new Date(value).getTime() - start.getTime()) / (7 * dayMs))
    return week >= 0 && week < weeks ? week : -1
  }
  dreams.forEach(dream => {
    dream.fragments.forEach(fragment => {
      const week = indexOf(fragment.date)
      if (week >= 0) buckets[week].fragments += 1
    })
    dream.todos.forEach(todo => {
      if (!todo.done) return
      const week = indexOf(todo.deadline)
      if (week >= 0) buckets[week].todosDone += 1
    })
  })
  return buckets
}

// Days-to-complete velocity across dreams. Prefer genuinely completed dreams;
// fall back to created→updated spans so the three bars always populate.
function buildVelocity(dreams) {
  const dayMs = 86400000
  const span = dream =>
    Math.max(1, Math.round((new Date(dream.updated) - new Date(dream.created)) / dayMs))
  const completed = dreams.filter(dream => dream.status === 'completed')
  const source = completed.length >= 2 ? completed : dreams
  const spans = source.map(span).filter(Number.isFinite)
  if (!spans.length) return { fastest: 0, average: 0, slowest: 0, count: 0 }
  const average = spans.reduce((sum, value) => sum + value, 0) / spans.length
  return {
    fastest: Math.min(...spans),
    average,
    slowest: Math.max(...spans),
    count: source.length,
  }
}

// Trends — hand-rolled SVG line chart (fragments vs. completed todos over time).
// Lines value-colored with field-notebook tokens: accent for fragments, --good
// for completed todos. Grid + axis + points + native <title> hover tooltips.
function TrendsChart({ series }) {
  const [hover, setHover] = useState(null)
  const width = 720
  const height = 240
  const padL = 34
  const padR = 16
  const padT = 16
  const padB = 28
  const maxY = Math.max(1, ...series.map(point => Math.max(point.fragments, point.todosDone)))
  const stepX = series.length > 1 ? (width - padL - padR) / (series.length - 1) : 0
  const xAt = index => padL + index * stepX
  const yAt = value => height - padB - (value / maxY) * (height - padT - padB)
  const pathFor = key =>
    series
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xAt(index)} ${yAt(point[key])}`)
      .join(' ')
  const gridLines = [0, 1, 2, 3, 4]

  return (
    <div className="trend-chart">
      <svg
        className="trend-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Fragments captured versus todos completed, by week"
      >
        {gridLines.map(line => {
          const y = padT + (line / 4) * (height - padT - padB)
          const value = Math.round(maxY - (line / 4) * maxY)
          return (
            <g key={line}>
              <line className="trend-grid" x1={padL} y1={y} x2={width - padR} y2={y} />
              <text className="trend-axis-y" x={padL - 8} y={y + 3} textAnchor="end">
                {value}
              </text>
            </g>
          )
        })}
        {series.map((point, index) => {
          if (index % 2 !== 0 && index !== series.length - 1) return null
          const label = `W${index + 1}`
          return (
            <text
              key={`x-${index}`}
              className="trend-axis-x"
              x={xAt(index)}
              y={height - padB + 16}
              textAnchor="middle"
            >
              {label}
            </text>
          )
        })}
        <path className="trend-line trend-line-todos" d={pathFor('todosDone')} />
        <path className="trend-line trend-line-fragments" d={pathFor('fragments')} />
        {series.map((point, index) => (
          <circle
            key={`t-${index}`}
            className="trend-dot trend-dot-todos"
            cx={xAt(index)}
            cy={yAt(point.todosDone)}
            r={hover === index ? 4.5 : 3}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
          >
            <title>{`Week ${index + 1}: ${point.todosDone} todos completed`}</title>
          </circle>
        ))}
        {series.map((point, index) => (
          <circle
            key={`f-${index}`}
            className="trend-dot trend-dot-fragments"
            cx={xAt(index)}
            cy={yAt(point.fragments)}
            r={hover === index ? 4.5 : 3}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
          >
            <title>{`Week ${index + 1}: ${point.fragments} fragments captured`}</title>
          </circle>
        ))}
      </svg>
      <div className="trend-legend">
        <span className="trend-legend-item">
          <span className="sw sw-fragments" />
          Fragments captured
        </span>
        <span className="trend-legend-item">
          <span className="sw sw-todos" />
          Todos completed
        </span>
      </div>
    </div>
  )
}

// Velocity — threshold-colored horizontal bars. Color is value-driven:
// fastest → --good, average → --warn, slowest → --danger.
function VelocityChart({ velocity }) {
  if (!velocity.count) {
    return <div className="velocity-empty">No completed dreams yet to measure velocity.</div>
  }
  const max = Math.max(velocity.fastest, velocity.average, velocity.slowest) * 1.12 || 1
  const bars = [
    { key: 'fastest', label: 'Fastest', value: velocity.fastest, tone: 'good' },
    { key: 'average', label: 'Average', value: velocity.average, tone: 'warn' },
    { key: 'slowest', label: 'Slowest', value: velocity.slowest, tone: 'danger' },
  ]
  return (
    <div className="velocity-chart">
      {bars.map(bar => (
        <div key={bar.key} className="velocity-row">
          <span className="velocity-label">{bar.label}</span>
          <div className="velocity-track">
            <div
              className="velocity-fill"
              data-tone={bar.tone}
              style={{ width: `${Math.max(4, (bar.value / max) * 100)}%` }}
            />
          </div>
          <span className="velocity-value">{Math.round(bar.value)}d</span>
        </div>
      ))}
      <div className="velocity-foot">
        Based on {velocity.count} dream{velocity.count === 1 ? '' : 's'} · days from first capture to
        last activity
      </div>
    </div>
  )
}

function Kpi({ label, value, delta, down }) {
  return (
    <article className="kpi">
      <div className="l">{label}</div>
      <div className="n">{value}</div>
      <div className={down ? 'd down' : 'd'}>{delta}</div>
    </article>
  )
}

function Insight({ icon, title, body }) {
  return (
    <div className="insight">
      <div className="ico">{icon}</div>
      <div>
        <b>{title}</b> {body}
      </div>
    </div>
  )
}
