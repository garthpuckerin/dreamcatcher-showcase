import { useMemo, useState } from 'react'
import { DEMO_GRAPH } from '../fixtures'

const NODE_R = 8
const STEP_X = 150
const MARGIN_X = 70
const LANE_TOP = 70
const LANE_BOTTOM = 150

// Deterministic, time-ordered layout: node position is derived purely from
// its index in the fixture array, so the same input always renders the same
// graph — no physics simulation, nothing that could settle differently on
// two runs.
function layout(nodes) {
  const positions = {}
  nodes.forEach((node, index) => {
    positions[node.id] = {
      x: MARGIN_X + index * STEP_X,
      y: index % 2 === 0 ? LANE_TOP : LANE_BOTTOM,
    }
  })
  return positions
}

function edgePath(from, to) {
  const midX = (from.x + to.x) / 2
  const midY = Math.min(from.y, to.y) - 40
  return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`
}

// `graph` is derived upstream from the fixture graph + the current revision
// decision (see ../revisions.js): a ratified split adds its dreams and quoted
// links here without this view knowing why.
export default function GraphView({ graph = DEMO_GRAPH }) {
  const { nodes, edges, unattributed } = graph
  const positions = useMemo(() => layout(nodes), [nodes])
  const [selectedIndex, setSelectedIndex] = useState(null)
  const nodeById = useMemo(() => Object.fromEntries(nodes.map(node => [node.id, node])), [nodes])
  const selectedEdge = selectedIndex != null ? edges[selectedIndex] : null

  const width = MARGIN_X * 2 + (nodes.length - 1) * STEP_X
  const height = LANE_BOTTOM + 60

  const selectEdge = index => setSelectedIndex(current => (current === index ? null : index))
  const onEdgeKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectEdge(index)
    }
  }

  return (
    <div className="fn-canvas-page" data-screen-label="Graph">
      <header className="page-head-2">
        <div>
          <div className="l">Graph · citation-edged</div>
          <h1>
            Every edge is <em>a citation</em>.
          </h1>
          <p className="lead">
            Nodes are laid out in capture order — same data, same layout, every time. No edge is
            drawn from similarity or co-occurrence: click any edge to see the verbatim quote or
            commit that justifies it.
          </p>
        </div>
      </header>

      <div className="graph-shell">
        <div className="graph-canvas-wrap fn-scroll">
          <svg
            className="graph-svg"
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            role="group"
            aria-label="Dream graph: nodes in capture order, connected by cited edges"
          >
            {edges.map((edge, index) => {
              const from = positions[edge.from]
              const to = positions[edge.to]
              if (!from || !to) return null
              const active = selectedIndex === index
              return (
                <g
                  key={`${edge.from}-${edge.to}-${index}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  aria-label={`Edge from ${nodeById[edge.from]?.name} to ${nodeById[edge.to]?.name}. Activate to view the citation.`}
                  className="graph-edge-group"
                  onClick={() => selectEdge(index)}
                  onKeyDown={event => onEdgeKeyDown(event, index)}
                >
                  <path
                    d={edgePath(from, to)}
                    className="graph-edge-hit"
                    fill="none"
                    stroke="transparent"
                    strokeWidth={20}
                  />
                  <path
                    d={edgePath(from, to)}
                    className="graph-edge"
                    data-active={active}
                    fill="none"
                  />
                </g>
              )
            })}

            {nodes.map(node => {
              const pos = positions[node.id]
              const isArtifact = node.kind === 'artifact'
              return (
                <g key={node.id} className="graph-node" transform={`translate(${pos.x}, ${pos.y})`}>
                  {isArtifact ? (
                    <rect
                      x={-NODE_R}
                      y={-NODE_R}
                      width={NODE_R * 2}
                      height={NODE_R * 2}
                      className="graph-node-mark graph-node-artifact"
                    />
                  ) : (
                    <circle r={NODE_R} className="graph-node-mark graph-node-chat" />
                  )}
                  <text
                    className="graph-node-glyph"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {isArtifact ? '▦' : '◌'}
                  </text>
                  <text className="graph-node-label" x={0} y={NODE_R + 16} textAnchor="middle">
                    {node.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <aside className="graph-side" aria-live="polite">
          {selectedEdge ? (
            <>
              <div className="graph-side-kicker">Citation</div>
              <div className="graph-side-path">
                <span>{nodeById[selectedEdge.from]?.name}</span>
                <span aria-hidden="true">→</span>
                <span>{nodeById[selectedEdge.to]?.name}</span>
              </div>
              <p className="graph-side-quote">&ldquo;{selectedEdge.quote}&rdquo;</p>
              <button type="button" className="fn-btn" onClick={() => setSelectedIndex(null)}>
                Close
              </button>
            </>
          ) : (
            <>
              <div className="graph-side-kicker">Citation</div>
              <p className="graph-side-empty">
                Select an edge to see the verbatim quote or commit that justifies it. Nothing is
                drawn here from similarity — an edge with no citation is not drawn at all.
              </p>
            </>
          )}
        </aside>
      </div>

      <div className="graph-legend">
        <span className="graph-legend-item">
          <span className="graph-node-mark graph-node-artifact graph-legend-mark" aria-hidden="true" />
          artifact-anchored
        </span>
        <span className="graph-legend-item">
          <span className="graph-node-mark graph-node-chat graph-legend-mark" aria-hidden="true" />
          chat-only
        </span>
      </div>

      <p className="graph-unattributed">{unattributed} statements remain unattributed.</p>
    </div>
  )
}
