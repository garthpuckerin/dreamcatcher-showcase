// Field Notebook fixtures — demo data for the Dreamcatcher public demo.
// Pure ES module. No window globals. No raw HTML in text fields.
//
// All dates are anchored on the REAL "today": every literal below is the
// ORIGINAL frozen value, passed through `shiftIso` (see ./dates.js) so the
// whole dataset slides by one constant offset (today − 2026-05-22 anchor).
// Edit the literals as if the anchor were still in place; relative ages,
// timelines, and analytics buckets stay internally consistent automatically.

import { shiftIso, fmtDayMonYear, fmtDayMon } from './dates'

// Re-base a legacy ISO/datetime literal onto today (preserves clock time).
const iso = s => shiftIso(s)

// Build a fragment "source" label whose date is derived from the (shifted)
// fragment date, so the displayed "11 Oct 2025" tracks the relative timeline.
// `actor` is the agent/source name; `isoDate` is the already-shifted iso().
const source = (actor, isoDate) => `${actor} · ${fmtDayMonYear(new Date(isoDate))}`

export const STATUSES = [
  { value: 'idea', label: 'Idea', glyph: '○' },
  { value: 'planning', label: 'Planning', glyph: '◐' },
  { value: 'in-progress', label: 'In Progress', glyph: '◑' },
  { value: 'paused', label: 'Paused', glyph: '◔' },
  { value: 'completed', label: 'Completed', glyph: '●' },
  { value: 'abandoned', label: 'Abandoned', glyph: '×' },
]

export const BRANDS = [
  { value: 'product', label: 'Product', glyph: 'P' },
  { value: 'client', label: 'Client', glyph: 'C' },
  { value: 'team', label: 'Team Ops', glyph: 'T' },
  { value: 'research', label: 'Research', glyph: 'R' },
  { value: 'personal', label: 'Personal', glyph: '·' },
]

export const CATEGORIES = [
  { value: 'coding', label: 'Coding' },
  { value: 'admin', label: 'Admin' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'devops', label: 'DevOps' },
  { value: 'strategy', label: 'Strategy' },
]

const BASE_DREAMS = [
  {
    id: 1,
    title: 'Dreamcatcher Workspace Foundation',
    description:
      'Core workspace setup for organizing AI conversations into actionable project plans — defaults, filters, naming conventions, weekly review cadence.',
    status: 'in-progress',
    brand: 'product',
    tags: ['foundation', 'workflow', 'organization', 'onboarding'],
    created: iso('2025-10-11T14:00'),
    updated: iso('2026-05-21T09:00'),
    summary:
      'Setup plan for capturing fragmented AI context, grouping work by project, and turning notes into trackable next actions. The system that holds all other dreams.',
    wiki: [
      {
        kind: 'p',
        text: 'This is the meta-dream. Everything Dreamcatcher does, it does because of decisions captured here — the shape of a project, what counts as a fragment, how todos roll up out of conversation. Read this dream first; the rest of the workspace inherits from its conventions.',
      },
      {
        kind: 'pull',
        text: 'Capture cheaply, summarize ruthlessly, execute on the smallest committed unit.',
      },
      { kind: 'h', text: 'Operating principles' },
      {
        kind: 'p',
        text: 'Three rules govern the workspace. First, every fragment lives inside a dream — never floating. Second, the wiki is the truth; fragments are evidence. Third, todos are derived, not authored — they fall out of fragments through review.',
      },
      {
        kind: 'p',
        text: 'The rules exist because the failure mode of every previous attempt at this workspace was the same: capture became disorganized, wiki and fragments diverged, and the todos drifted from what the actual work needed. Constraints prevent that drift.',
      },
      {
        kind: 'ai',
        eyebrow: 'AI · Assistant',
        text: 'The three operating rules are load-bearing. If any one is relaxed, the others collapse within a week of use — historically the wiki/fragment separation has been the first to slip, and once it does, the system reverts to a generic note-taking tool.',
        meta: [
          `Captured ${fmtDayMonYear(new Date(iso('2026-05-24')))}`,
          'Recurring pattern across capture history',
          '14 supporting fragments',
        ],
      },
      { kind: 'h', text: 'Cadence' },
      {
        kind: 'p',
        text: 'Daily: capture from your AI assistants and coding sessions. Weekly: triage fragments, promote to wiki, generate todos. Monthly: retire stale dreams, archive abandoned threads, write retrospectives.',
      },
      {
        kind: 'p',
        text: 'The cadence is intentionally asymmetric — capture is cheap and continuous, promotion is expensive and weekly, governance is rare and monthly. Spending equal effort at each level was the previous mistake; this one is calibrated against measured time-to-promotion.',
      },
      { kind: 'h', text: 'Anatomy of a dream' },
      {
        kind: 'p',
        text: 'A dream has four parts: a wiki (the truth), fragments (the evidence), todos (the next actions), and documents (the artifacts). The wiki narrates; fragments substantiate; todos commit; documents preserve. Each part has a different write cadence and a different audience.',
      },
      {
        kind: 'pull',
        text: 'The wiki is for the reader six months from now who has never seen this project.',
      },
      {
        kind: 'p',
        text: 'That framing — write for the reader six months out — is the single best heuristic for what belongs in the wiki vs. what stays as fragment evidence. If a sentence would only make sense to someone who lived through the conversation, it is a fragment, not wiki.',
      },
      { kind: 'h', text: 'Promotion ritual' },
      {
        kind: 'p',
        text: 'Friday afternoons. Read every fragment captured this week. Decide: promote, derive, or discard. A promoted fragment becomes wiki content. A derived fragment becomes a todo. A discarded fragment stays as evidence but does not influence the wiki.',
      },
      {
        kind: 'p',
        text: 'The ritual takes 20–40 minutes per active dream. Across a workspace of eight dreams that is a fixed two-hour weekly cost. The cost is the feature: it forces selection.',
      },
      { kind: 'h', text: 'When to abandon' },
      {
        kind: 'p',
        text: 'A dream that has not earned a promoted fragment in 14 days is a candidate for the abandoned column. Abandonment is not failure — it is honest. Keeping a dead dream on the active list dilutes attention from the live ones.',
      },
      {
        kind: 'p',
        text: 'Move the dream, write a one-line abandonment reason, and let it rest. Abandoned dreams stay searchable, stay readable, stay revivable. They just stop accruing weekly review cost.',
      },
    ],
    todos: [
      {
        id: 1001,
        title: 'Finalize workspace defaults and filters',
        category: 'devops',
        deadline: iso('2026-05-25'),
        done: false,
      },
      {
        id: 1002,
        title: 'Define weekly review cadence',
        category: 'strategy',
        deadline: iso('2026-05-26'),
        done: false,
      },
      {
        id: 1003,
        title: 'Write contributor onboarding notes',
        category: 'admin',
        deadline: iso('2026-05-29'),
        done: false,
      },
      {
        id: 1004,
        title: 'Improve task and wiki linking flow',
        category: 'coding',
        deadline: iso('2026-06-04'),
        done: false,
      },
      {
        id: 1005,
        title: 'Set up database project and schema',
        category: 'devops',
        deadline: iso('2026-06-10'),
        done: false,
      },
      {
        id: 1006,
        title: 'Publish internal usage guide',
        category: 'admin',
        deadline: iso('2026-05-15'),
        done: true,
      },
    ],
    fragments: [
      {
        id: 101,
        title: 'Initial Launch Request',
        source: source('AI Assistant', iso('2025-10-11T14:00')),
        date: iso('2025-10-11T14:00'),
        excerpt:
          'Started with: "Help me finally launch Dreamcatcher". This began a six-hour conversation that evolved into a complete strategic planning session.',
      },
      {
        id: 102,
        title: 'Fragment Consolidation Pattern',
        source: source('AI Assistant', iso('2025-10-11T15:00')),
        date: iso('2025-10-11T15:00'),
        excerpt:
          'Defined a repeatable method: capture raw snippets first, then consolidate related fragments into a single dream summary.',
      },
      {
        id: 103,
        title: 'Cross-Project Context Mapping',
        source: source('AI Assistant', iso('2025-10-11T16:00')),
        date: iso('2025-10-11T16:00'),
        excerpt:
          'Mapped related ideas from multiple chat sessions into clear project buckets so priorities and dependencies are visible.',
      },
      {
        id: 104,
        title: 'Capture-to-Execution Workflow',
        source: source('AI Assistant', iso('2025-10-11T16:30')),
        date: iso('2025-10-11T16:30'),
        excerpt: 'Capture ideas quickly, summarize weekly, convert validated fragments into todos.',
      },
      {
        id: 105,
        title: 'The Meta Moment',
        source: source('AI Assistant', iso('2025-10-11T19:00')),
        date: iso('2025-10-11T19:00'),
        excerpt:
          '"This entire chat is the perfect example of why I needed Dreamcatcher in the first place."',
      },
    ],
  },
  {
    id: 2,
    title: 'Chrome Extension — One-Click Capture',
    description:
      'Browser extension that grabs the current AI-chat conversation, detects project context, and files it into the right dream without disrupting the flow.',
    status: 'in-progress',
    brand: 'product',
    tags: ['extension', 'chrome', 'capture', 'manifest-v3'],
    created: iso('2025-12-02'),
    updated: iso('2026-05-22T11:15'),
    summary:
      'Capture button injected into your AI chats. Auto-detects active project from URL and recent dreams. Queues offline writes for sync when the popup re-opens.',
    wiki: [
      {
        kind: 'p',
        text: 'The friction of switching apps to file an idea is the entire reason Dreamcatcher exists. The extension removes that friction — one click, one keypress, never leave the conversation.',
      },
      { kind: 'h', text: 'Surface' },
      {
        kind: 'p',
        text: 'A small capture pill anchored to the bottom-right of any AI-chat tab. Hover expands to show the destination dream; click commits; right-click reveals a destination picker.',
      },
    ],
    todos: [
      {
        id: 2001,
        title: 'Ship Manifest V3 service worker',
        category: 'coding',
        deadline: iso('2026-05-26'),
        done: false,
      },
      {
        id: 2002,
        title: 'Wire offline IndexedDB queue',
        category: 'coding',
        deadline: iso('2026-05-30'),
        done: false,
      },
      {
        id: 2003,
        title: 'Project auto-detection heuristic',
        category: 'coding',
        deadline: iso('2026-06-05'),
        done: false,
      },
      {
        id: 2004,
        title: 'Chrome Web Store listing copy',
        category: 'marketing',
        deadline: iso('2026-06-12'),
        done: false,
      },
      {
        id: 2005,
        title: 'OAuth handshake with web app',
        category: 'devops',
        deadline: iso('2026-05-20'),
        done: true,
      },
    ],
    fragments: [
      {
        id: 201,
        title: 'Hotkey vs. button debate',
        source: source('AI Assistant', iso('2025-12-02')),
        date: iso('2025-12-02'),
        excerpt:
          'Should capture be a visible button or an invisible hotkey? Settled on both — hotkey for power users, pill for discovery.',
      },
      {
        id: 202,
        title: 'Offline queue design',
        source: source('AI Assistant', iso('2026-01-19')),
        date: iso('2026-01-19'),
        excerpt:
          'IndexedDB queue with monotonic IDs, drain on popup open, retry with exponential backoff.',
      },
      {
        id: 203,
        title: 'Project auto-detection heuristic',
        source: source('Editor', iso('2026-03-14')),
        date: iso('2026-03-14'),
        excerpt:
          'Bag-of-words match against recent dream titles, descriptions, and fragment text — top-1 if score > 0.4, else show picker.',
      },
    ],
  },
  {
    id: 3,
    title: 'Portfolio Builder for Side-Projects',
    description:
      'Promote a dream to a public case study page. AI drafts seven sections from the dream wiki and fragments; user edits, picks a theme, ships.',
    status: 'planning',
    brand: 'product',
    tags: ['portfolio', 'ai', 'case-study', 'public'],
    created: iso('2026-02-10'),
    updated: iso('2026-05-18T16:42'),
    summary:
      'Pro-tier feature. Takes a completed dream and produces a polished case study at username.dreamcatcher.dev/dream-slug.',
    wiki: [
      {
        kind: 'p',
        text: 'Every dream is already a case study in waiting — the wiki has the narrative, fragments have the evidence, todos have the execution trail. The portfolio builder just rearranges what is already there.',
      },
      { kind: 'h', text: 'The seven sections' },
      {
        kind: 'p',
        text: 'Problem · Approach · Constraints · Decisions · Build · Outcome · Reflection. AI drafts each from the dream content; user edits inline; nothing leaves the workspace until publish.',
      },
    ],
    todos: [
      {
        id: 3001,
        title: 'Seven-section prompt template',
        category: 'strategy',
        deadline: iso('2026-05-30'),
        done: false,
      },
      {
        id: 3002,
        title: 'Theme system (4 starters)',
        category: 'design',
        deadline: iso('2026-06-15'),
        done: false,
      },
      {
        id: 3003,
        title: 'Public route + SSR cache',
        category: 'coding',
        deadline: iso('2026-06-22'),
        done: false,
      },
    ],
    fragments: [
      {
        id: 301,
        title: 'Case study research',
        source: source('AI Assistant', iso('2026-02-10')),
        date: iso('2026-02-10'),
        excerpt:
          'Surveyed 30 portfolio sites. The ones that read well share a structure: problem framing first, then the choice that mattered, then proof.',
      },
      {
        id: 302,
        title: 'Theme system shape',
        source: source('AI Assistant', iso('2026-05-04')),
        date: iso('2026-05-04'),
        excerpt:
          "Four themes, all editorial. No template will rescue bad copy; don't try to be Webflow.",
      },
    ],
  },
  {
    id: 4,
    title: 'Version Control for Ideas',
    description:
      "Git-inspired snapshot, restore, diff, branch — but for a dream's wiki, fragments, and todos. A/B branch directions and merge back.",
    status: 'idea',
    brand: 'product',
    tags: ['versioning', 'branching', 'history'],
    created: iso('2026-04-22'),
    updated: iso('2026-05-19T08:00'),
    summary:
      'Conceptual sketch. The dream content is the file tree; commits are checkpoints; branches are alternate directions.',
    wiki: [
      {
        kind: 'p',
        text: "If a dream is a project then a dream's history is a series of decisions. Make those decisions inspectable. Make alternate paths explorable.",
      },
    ],
    todos: [
      {
        id: 4001,
        title: 'Storage shape — what do we actually diff?',
        category: 'strategy',
        deadline: iso('2026-06-01'),
        done: false,
      },
      {
        id: 4002,
        title: 'UI metaphor exploration',
        category: 'design',
        deadline: iso('2026-06-10'),
        done: false,
      },
    ],
    fragments: [
      {
        id: 401,
        title: 'Why git for ideas?',
        source: source('AI Assistant', iso('2026-04-22')),
        date: iso('2026-04-22'),
        excerpt:
          "Most idea tools are write-only. Notion, Apple Notes, even Linear — you can't see the shape of how a thought evolved.",
      },
    ],
  },
  {
    id: 5,
    title: 'Real-time Collaboration',
    description:
      'Multiple users on the same dream — live cursors, presence, conflict-free editing via operational transform.',
    status: 'paused',
    brand: 'product',
    tags: ['realtime', 'collaboration', 'websocket', 'teams'],
    created: iso('2026-01-08'),
    updated: iso('2026-04-30T12:30'),
    summary: 'Teams-tier feature. Paused while the extension and portfolio ship; resume Q3.',
    wiki: [
      {
        kind: 'p',
        text: 'Paused, not abandoned. The architecture is sketched, the OT layer is mostly proven, but shipping it costs more focus than the team has this quarter.',
      },
    ],
    todos: [
      {
        id: 5001,
        title: 'Resume when extension ships',
        category: 'strategy',
        deadline: iso('2026-08-01'),
        done: false,
      },
    ],
    fragments: [
      {
        id: 501,
        title: 'OT vs. CRDT',
        source: source('Editor', iso('2026-01-08')),
        date: iso('2026-01-08'),
        excerpt:
          'OT for now — simpler server, fewer libraries to vet, mature in production at Figma and Google Docs.',
      },
    ],
  },
  {
    id: 6,
    title: 'Smart Templates Marketplace',
    description:
      'Community templates: MVP launch, side-project starter, technical post-mortem. Apply with one click; sellers earn 70%.',
    status: 'idea',
    brand: 'team',
    tags: ['marketplace', 'templates', 'community'],
    created: iso('2026-03-30'),
    updated: iso('2026-05-12T09:15'),
    summary:
      'Earliest-possible community surface. Even a curated list of 8 templates would 10× new-user activation.',
    wiki: [
      {
        kind: 'p',
        text: "The fastest activation path is starting from a template that is already structured. Don't make the first dream a blank page.",
      },
    ],
    todos: [
      {
        id: 6001,
        title: 'Curate 8 launch templates',
        category: 'strategy',
        deadline: iso('2026-06-20'),
        done: false,
      },
      {
        id: 6002,
        title: 'Author flow + payment rails',
        category: 'coding',
        deadline: iso('2026-07-15'),
        done: false,
      },
    ],
    fragments: [
      {
        id: 601,
        title: 'Curation > openness, at first',
        source: source('AI Assistant', iso('2026-03-30')),
        date: iso('2026-03-30'),
        excerpt:
          'Marketplaces without curation become spam. Eight hand-picked templates on launch day.',
      },
    ],
  },
  {
    id: 7,
    title: 'Northwind Health — Onboarding Redesign',
    description:
      'Client engagement. Reduce 7-step signup to 3, cut drop-off by half, ship in six weeks.',
    status: 'completed',
    brand: 'client',
    tags: ['client', 'onboarding', 'conversion'],
    created: iso('2026-02-01'),
    updated: iso('2026-04-15T17:00'),
    summary: `Shipped ${fmtDayMon(new Date(iso('2026-04-14')))}. Drop-off down from 62% to 28%. Retainer extended for analytics phase.`,
    wiki: [
      {
        kind: 'p',
        text: "Six-week sprint, two designers, one engineer. The win wasn't a clever flow — it was deleting four screens of consent the legal team had defended for years.",
      },
    ],
    todos: [],
    fragments: [
      {
        id: 701,
        title: 'Kickoff workshop notes',
        source: source('Workshop', iso('2026-02-01')),
        date: iso('2026-02-01'),
        excerpt:
          'Three personas, two flows, one north-star metric: time-to-first-appointment. Everything else is secondary.',
      },
    ],
  },
  {
    id: 8,
    title: 'Memory & Embeddings Research',
    description:
      'Vector store experiments for semantic search across fragments. pgvector vs. Pinecone vs. local FAISS.',
    status: 'in-progress',
    brand: 'research',
    tags: ['embeddings', 'research', 'pgvector'],
    created: iso('2026-03-12'),
    updated: iso('2026-05-22T10:00'),
    summary:
      'pgvector winning so far — colocated with Postgres, no extra infra, recall at k=10 within 6% of Pinecone.',
    wiki: [
      {
        kind: 'p',
        text: 'The honest answer is that all three work. pgvector wins on operational simplicity, which is the right thing to optimize for at our scale.',
      },
    ],
    todos: [
      {
        id: 8001,
        title: 'Recall benchmark vs. Pinecone',
        category: 'coding',
        deadline: iso('2026-05-28'),
        done: false,
      },
      {
        id: 8002,
        title: 'Embedding model selection memo',
        category: 'strategy',
        deadline: iso('2026-06-10'),
        done: false,
      },
    ],
    fragments: [
      {
        id: 801,
        title: 'pgvector vs Pinecone shootout',
        source: source('Editor', iso('2026-03-12')),
        date: iso('2026-03-12'),
        excerpt:
          "Built a small bench. pgvector at k=10 recalls 0.91 of Pinecone's results on our fragment corpus.",
      },
    ],
  },
]

// The conflated origin backlog — the dream Revisions proposes to split.
// Modeled on the engine's first real proposal against live data: its own
// backlog held Connex, Nexus, PipelineOS and Dreamcatcher before they were
// separate projects. Each fragment carries the artifact the trace attributes
// it to (`artifact`); ratifying the split moves them (see ./revisions.js).
export const ORIGIN_DREAM_ID = 9
const ORIGIN_DREAM = {
  id: ORIGIN_DREAM_ID,
  title: 'Origin backlog — Connex · Nexus · Dreamcatcher · PipelineOS',
  description:
    'The first backlog, from before these were four projects. Every early fragment landed here; Revisions holds the artifact-anchored proposal to split it.',
  status: 'planning',
  brand: 'product',
  tags: ['origin', 'conflated', 'retro-trace'],
  created: iso('2025-09-28T10:00'),
  updated: iso('2026-05-20T09:30'),
  summary:
    'A single dream that grew four projects. Nothing here changes until the proposed split is ratified — reject leaves it exactly as it is.',
  wiki: [
    {
      kind: 'p',
      text: 'This dream predates the workspace having a shape. Client integration, the internal knowledge graph, deployment orchestration and the capture loop itself were all one backlog.',
    },
    { kind: 'h', text: 'Why it is conflated' },
    {
      kind: 'p',
      text: 'Early fragments were filed before the projects existed. The retro-trace anchors each statement to the artifact it was really about — a repo, a folder, a graph — and proposes the split; a human ratifies it.',
    },
  ],
  todos: [
    {
      id: 9001,
      title: 'Decide the proposed split in Revisions',
      category: 'admin',
      deadline: iso('2026-05-27'),
      done: false,
    },
  ],
  fragments: [
    {
      id: 901,
      artifact: 'connex',
      title: 'Connex calls into Nexus',
      source: source('AI Assistant', iso('2025-10-02T10:20')),
      date: iso('2025-10-02T10:20'),
      excerpt:
        "Connex just calls into whatever Nexus already resolved — we shouldn't re-derive the same lookup twice.",
    },
    {
      id: 902,
      artifact: 'nexus',
      title: 'Nexus is the index behind suggestions',
      source: source('AI Assistant', iso('2025-10-06T15:45')),
      date: iso('2025-10-06T15:45'),
      excerpt:
        'Nexus is just the embeddings index Dreamcatcher queries before it shows you a suggestion.',
    },
    {
      id: 903,
      artifact: 'dreamcatcher',
      title: 'The capture loop is the product',
      source: source('AI Assistant', iso('2025-10-09T09:05')),
      date: iso('2025-10-09T09:05'),
      excerpt:
        "Let's stop calling it PipelineOS — that was the deploy-only phase. Dreamcatcher is the whole capture loop now.",
    },
    {
      id: 904,
      artifact: 'pipelineos',
      title: 'Hand-off to the deploy step',
      source: source('AI Assistant', iso('2025-10-03T17:30')),
      date: iso('2025-10-03T17:30'),
      excerpt:
        "The capture loop hands off to the deploy step once a fragment is marked ready — that's the PipelineOS boundary.",
    },
  ],
}
export const DREAMS = [...BASE_DREAMS, ORIGIN_DREAM]

export const DOCUMENTS = {
  1: [
    {
      id: 'd-1-1',
      name: 'Workspace-foundations.pdf',
      size: '412 KB',
      kind: 'pdf',
      uploaded: iso('2025-10-14'),
      pages: 12,
      extracted: 8,
    },
    {
      id: 'd-1-2',
      name: 'Weekly-review-template.docx',
      size: '28 KB',
      kind: 'docx',
      uploaded: iso('2025-10-16'),
      pages: 3,
      extracted: 6,
    },
    {
      id: 'd-1-3',
      name: 'Cadence-decision-memo.md',
      size: '6 KB',
      kind: 'md',
      uploaded: iso('2026-01-04'),
      pages: 1,
      extracted: 3,
    },
  ],
  2: [
    {
      id: 'd-2-1',
      name: 'MV3-service-worker-notes.pdf',
      size: '186 KB',
      kind: 'pdf',
      uploaded: iso('2026-02-02'),
      pages: 8,
      extracted: 14,
    },
  ],
  3: [
    {
      id: 'd-3-1',
      name: 'Portfolio-research.pdf',
      size: '892 KB',
      kind: 'pdf',
      uploaded: iso('2026-02-10'),
      pages: 24,
      extracted: 18,
    },
    {
      id: 'd-3-2',
      name: 'Theme-system-sketches.png',
      size: '1.2 MB',
      kind: 'img',
      uploaded: iso('2026-05-04'),
      pages: 1,
      extracted: 0,
    },
  ],
  7: [
    {
      id: 'd-7-1',
      name: 'Northwind-kickoff-notes.docx',
      size: '44 KB',
      kind: 'docx',
      uploaded: iso('2026-02-01'),
      pages: 5,
      extracted: 9,
    },
    {
      id: 'd-7-2',
      name: 'Northwind-final-report.pdf',
      size: '2.1 MB',
      kind: 'pdf',
      uploaded: iso('2026-04-14'),
      pages: 32,
      extracted: 22,
    },
  ],
}

export const VERSIONS = {
  1: [
    {
      id: 'v-1-6',
      label: 'v6 · Cadence locked',
      date: iso('2026-05-21T09:00'),
      author: 'demo-user',
      note: 'Weekly review cadence finalized; promoted from idea to wiki.',
      changes: { added: 4, removed: 1, frags: 2 },
      current: true,
    },
    {
      id: 'v-1-5',
      label: 'v5 · Storage decision',
      date: iso('2025-10-24'),
      author: 'demo-user',
      note: 'Added backend storage plan; updated launch timeline.',
      changes: { added: 8, removed: 2, frags: 1 },
    },
    {
      id: 'v-1-4',
      label: 'v4 · Three rules',
      date: iso('2025-10-18'),
      author: 'demo-user',
      note: 'Wiki: codified the three operating principles.',
      changes: { added: 6, removed: 0, frags: 0 },
    },
    {
      id: 'v-1-3',
      label: 'v3 · Sample data',
      date: iso('2025-10-15'),
      author: 'demo-user',
      note: 'Seeded with planning fragments from Oct 11 session.',
      changes: { added: 14, removed: 0, frags: 8 },
    },
    {
      id: 'v-1-2',
      label: 'v2 · Scope clarified',
      date: iso('2025-10-12'),
      author: 'demo-user',
      note: 'Split product workspace from demo repo.',
      changes: { added: 3, removed: 5, frags: 0 },
    },
    {
      id: 'v-1-1',
      label: 'v1 · Initial',
      date: iso('2025-10-11'),
      author: 'demo-user',
      note: 'Dream created from an AI Assistant session.',
      changes: { added: 22, removed: 0, frags: 1 },
    },
  ],
  2: [
    {
      id: 'v-2-3',
      label: 'v3 · Auto-detect heuristic',
      date: iso('2026-05-22T11:15'),
      author: 'demo-user',
      note: 'BoW match with score threshold.',
      changes: { added: 5, removed: 1, frags: 1 },
      current: true,
    },
    {
      id: 'v-2-2',
      label: 'v2 · Offline queue',
      date: iso('2026-01-19'),
      author: 'demo-user',
      note: 'IndexedDB queue design.',
      changes: { added: 7, removed: 0, frags: 1 },
    },
    {
      id: 'v-2-1',
      label: 'v1 · Initial',
      date: iso('2025-12-02'),
      author: 'demo-user',
      note: 'Dream created.',
      changes: { added: 10, removed: 0, frags: 1 },
    },
  ],
}

export const RETROS = {
  1: [
    {
      id: 'r-1-1',
      kind: 'start-stop-continue',
      date: iso('2026-05-10'),
      facilitator: 'demo-user',
      participants: ['demo-user', 'alex', 'sam'],
      columns: {
        start: [
          'Two-week stale-fragment sweep',
          'Brand-level templates for new dreams',
          'Pair-triage on Mondays',
        ],
        stop: [
          'Letting fragments live outside dreams',
          'Editing the wiki without a snapshot first',
        ],
        continue: [
          'Daily capture from active sessions',
          'Friday wiki promotion',
          'Monthly retro on every active dream',
        ],
      },
      aiInsight:
        'Capture cadence is healthy; promotion cadence is the bottleneck. Consider a Thursday checkpoint to reduce Friday backlog pressure.',
    },
  ],
  3: [
    {
      id: 'r-3-1',
      kind: '4Ls',
      date: iso('2026-05-04'),
      facilitator: 'demo-user',
      participants: ['demo-user', 'alex'],
      columns: {
        liked: ['Editorial themes feel coherent', 'Seven-section template is doing real work'],
        learned: [
          'AI drafts are 80% of the value at 5% of the effort',
          "Custom domains can wait - most users won't use them",
        ],
        lacked: [
          "A baseline 'before/after' to evaluate themes against",
          'Real user testing before theme #4',
        ],
        longed: ['Live preview without publishing', 'One-click duplicate with new theme'],
      },
      aiInsight:
        'Theme #4 is at risk of being unfalsifiable without a baseline. Recommend cutting it from v1 and shipping with three.',
    },
  ],
  7: [
    {
      id: 'r-7-1',
      kind: 'sailboat',
      date: iso('2026-04-16'),
      facilitator: 'alex',
      participants: ['demo-user', 'alex', 'client-jordan', 'client-priya'],
      columns: {
        wind: [
          'Aligned north-star metric in 40 min',
          'Designers + engineer co-located all six weeks',
        ],
        anchor: [
          "Legal team's four consent screens",
          'Pre-existing brand component library required overrides',
        ],
        rocks: ['Backend rate-limit on the appointments API surfaced late'],
        island: ['Drop-off under 30%', 'Retainer extension for analytics phase'],
      },
      aiInsight:
        'Two of three risk patterns repeat from prior client work: late-surfacing rate-limits and brand-component overrides. Add to client-kickoff checklist.',
    },
  ],
}

export const COLLABORATORS = {
  1: [
    {
      id: 'u-demo',
      name: 'Demo User',
      initials: 'DU',
      role: 'Owner',
      online: true,
      color: 'violet',
    },
    {
      id: 'u-alex',
      name: 'Alex Rivera',
      initials: 'AR',
      role: 'Editor',
      online: true,
      color: 'amber',
    },
    {
      id: 'u-sam',
      name: 'Sam Chen',
      initials: 'SC',
      role: 'Reader',
      online: false,
      color: 'forest',
    },
  ],
  2: [
    {
      id: 'u-demo',
      name: 'Demo User',
      initials: 'DU',
      role: 'Owner',
      online: true,
      color: 'violet',
    },
    {
      id: 'u-alex',
      name: 'Alex Rivera',
      initials: 'AR',
      role: 'Editor',
      online: true,
      color: 'amber',
    },
  ],
  3: [
    {
      id: 'u-demo',
      name: 'Demo User',
      initials: 'DU',
      role: 'Owner',
      online: true,
      color: 'violet',
    },
    {
      id: 'u-alex',
      name: 'Alex Rivera',
      initials: 'AR',
      role: 'Editor',
      online: false,
      color: 'amber',
    },
  ],
  7: [
    {
      id: 'u-demo',
      name: 'Demo User',
      initials: 'DU',
      role: 'Lead',
      online: true,
      color: 'violet',
    },
    {
      id: 'u-alex',
      name: 'Alex Rivera',
      initials: 'AR',
      role: 'Design',
      online: false,
      color: 'amber',
    },
    {
      id: 'u-jordan',
      name: 'Jordan Lee (Northwind)',
      initials: 'JL',
      role: 'Client',
      online: false,
      color: 'forest',
    },
    {
      id: 'u-priya',
      name: 'Priya N. (Northwind)',
      initials: 'PN',
      role: 'Client',
      online: false,
      color: 'rust',
    },
  ],
}

export const INBOX = [
  {
    id: 'ix-1',
    title: 'Coding agent tool-calling notes',
    captured: iso('2026-05-22T09:14'),
    source: 'Editor',
    preview: 'Tool-call format keeps changing across AI assistant versions. Need a wrapper.',
    suggested: 8,
  },
  {
    id: 'ix-2',
    title: 'Pricing page copy revision',
    captured: iso('2026-05-22T10:02'),
    source: 'AI Assistant',
    preview: 'Three-tier comparison is too dense; recruit a copywriter for the table.',
    suggested: 3,
  },
  {
    id: 'ix-3',
    title: 'Why pgvector at our scale',
    captured: iso('2026-05-22T11:33'),
    source: 'AI Assistant',
    preview: 'Long-form rationale memo for the embeddings decision.',
    suggested: 8,
  },
  {
    id: 'ix-4',
    title: 'Hotkey conflicts on Linux Chrome',
    captured: iso('2026-05-22T12:18'),
    source: 'Editor',
    preview: '⌘⇧D conflicts with Linux desktops; ⌥⇧D is safer cross-platform.',
    suggested: 2,
  },
  {
    id: 'ix-5',
    title: 'Northwind retainer addendum',
    captured: iso('2026-05-22T13:00'),
    source: 'Manual',
    preview: 'Northwind is requesting an analytics phase, two months, scoped tight.',
    suggested: 7,
  },
  {
    id: 'ix-6',
    title: 'Editorial typography references',
    captured: iso('2026-05-23T08:11'),
    source: 'AI Assistant',
    preview: 'Newsreader + Plex pairing notes; references from the Rare Book Room.',
    suggested: 3,
  },
]

export const AI_SUGGESTIONS = [
  {
    id: 's-1',
    kind: 'merge',
    title: 'Merge inbox capture into Memory & Embeddings Research',
    detail: 'Inbox item "Why pgvector at our scale" shares vocabulary with this dream’s captures.',
    basedOn: 'Repeated "pgvector" / "embeddings" language across Memory & Embeddings Research fragments.',
    dreamId: 8,
  },
  {
    id: 's-2',
    kind: 'todo',
    title: 'Promote 3 stale fragments to todos in Chrome Extension',
    detail: 'Three fragments reference unbuilt features.',
    basedOn: 'Chrome Extension — One-Click Capture fragments naming features with no matching todo.',
    dreamId: 2,
  },
  {
    id: 's-3',
    kind: 'risk',
    title: 'Scope creep on Portfolio Builder',
    detail: 'Custom domain CNAME flow added without removing earlier scope.',
    basedOn: 'Portfolio Builder for Side-Projects fragment adding CNAME setup with no corresponding scope cut.',
    dreamId: 3,
  },
  {
    id: 's-4',
    kind: 'retro',
    title: 'Time to retro Memory & Embeddings Research',
    detail: 'No retro logged yet; schedule one before the next research push.',
    basedOn: 'Memory & Embeddings Research has no retrospective entry since the dream was opened.',
    dreamId: 8,
  },
]

export const ARCHIVED = [
  {
    id: 91,
    title: 'AI Assistant Memory API exploration',
    status: 'abandoned',
    brand: 'research',
    archived: iso('2026-04-02'),
    reason: 'Superseded by the broader Memory & Embeddings Research dream.',
  },
  {
    id: 92,
    title: 'Marketing site rebuild — v2',
    status: 'completed',
    brand: 'product',
    archived: iso('2026-03-18'),
    reason:
      'Shipped teaser site refresh and folded ongoing conversion work into Portfolio Builder.',
  },
  {
    id: 93,
    title: 'Pricing experimentation Q4 2025',
    status: 'completed',
    brand: 'team',
    archived: iso('2026-01-09'),
    reason: 'Captured the tiering decision and migrated follow-up work into the launch plan.',
  },
  {
    id: 94,
    title: 'Loom of decisions (concept)',
    status: 'abandoned',
    brand: 'personal',
    archived: iso('2025-12-28'),
    reason: 'Concept was useful as language, but not strong enough to become a standalone feature.',
  },
]

export const TEMPLATES = [
  {
    id: 'tpl-mvp',
    title: 'MVP Launch Plan',
    description: 'Problem framing, non-goals, build phases, launch checklist, and retrospective.',
    tags: ['launch', 'product', 'planning'],
    sections: 7,
    includedTodos: 9,
  },
  {
    id: 'tpl-client',
    title: 'Client Engagement',
    description:
      'Kickoff notes, decision log, milestone plan, risk register, and handoff artifacts.',
    tags: ['client', 'delivery', 'ops'],
    sections: 6,
    includedTodos: 8,
  },
  {
    id: 'tpl-research',
    title: 'Technical Research',
    description:
      'Hypothesis, evaluation matrix, benchmark notes, recommendation memo, and next steps.',
    tags: ['research', 'architecture'],
    sections: 5,
    includedTodos: 6,
  },
]

export const INTEGRATIONS = [
  {
    id: 'github',
    name: 'GitHub',
    status: 'connected',
    detail: 'Commits, PRs, issues, and wiki sync.',
  },
  {
    id: 'editor',
    name: 'Code Editor',
    status: 'connected',
    detail: 'Capture agent runs and code-review sessions.',
  },
  {
    id: 'slack',
    name: 'Slack',
    status: 'available',
    detail: 'Weekly digest and capture notifications.',
  },
  {
    id: 'notion',
    name: 'Notion',
    status: 'available',
    detail: 'Publish wiki sections into team docs.',
  },
  {
    id: 'figma',
    name: 'Figma',
    status: 'planned',
    detail: 'Attach design context to project dreams.',
  },
]

export const PORTFOLIO = [
  {
    id: 'case-northwind',
    dreamId: 7,
    title: 'Northwind Health Onboarding Redesign',
    status: 'published',
    metric: 'Drop-off down 34 points',
  },
  {
    id: 'case-extension',
    dreamId: 2,
    title: 'Chrome Extension One-Click Capture',
    status: 'draft',
    metric: '3 capture paths converged',
  },
  {
    id: 'case-dreamcatcher',
    dreamId: 1,
    title: 'Dreamcatcher Workspace Foundation',
    status: 'draft',
    metric: '8 active dreams organized',
  },
]

export const USER = {
  email: 'you@example.com',
  name: 'Demo User',
  initials: 'DU',
  plan: 'Pro',
  // Derived from the real workspace contents so the usage bar can't drift:
  // active dreams + archived dreams.
  used: DREAMS.length + ARCHIVED.length,
  limit: 100,
  workspace: 'dreamcatcher',
}

// Retro-tracing showcase: a single PROPOSED revision awaiting human ratification.
// Nothing here has been applied — production never auto-applies a split. Every
// link and former-name candidate below is quoted verbatim from the source
// material it patterns on; there is no similarity score anywhere in this shape.
export const DEMO_REVISION = {
  createdAt: iso('2026-05-20T09:30'),
  originDreamId: ORIGIN_DREAM_ID,
  // Each split names the dream it creates on ratify (ids 91–94 are reserved
  // for them) and the artifact key that partitions the origin's fragments.
  splits: [
    { key: 'connex', dreamId: 91, brand: 'client', names: 'Connex — client integration layer', statements: 41 },
    { key: 'nexus', dreamId: 92, brand: 'research', names: 'Nexus — internal knowledge graph', statements: 28 },
    { key: 'dreamcatcher', dreamId: 93, brand: 'product', names: 'Dreamcatcher — capture-to-wiki workspace', statements: 63 },
    { key: 'pipelineos', dreamId: 94, brand: 'team', names: 'PipelineOS — deployment orchestration', statements: 19 },
  ],
  links: [
    {
      from: 'Connex',
      to: 'Nexus',
      quote:
        "Connex just calls into whatever Nexus already resolved — we shouldn't re-derive the same lookup twice.",
    },
    {
      from: 'Dreamcatcher',
      to: 'PipelineOS',
      quote:
        "The capture loop hands off to the deploy step once a fragment is marked ready — that's the PipelineOS boundary.",
    },
    {
      from: 'Nexus',
      to: 'Dreamcatcher',
      quote: 'Nexus is just the embeddings index Dreamcatcher queries before it shows you a suggestion.',
    },
  ],
  nameLinks: [
    {
      former: 'PipelineOS',
      current: 'Dreamcatcher',
      quote:
        "Let's stop calling it PipelineOS — that was the deploy-only phase. Dreamcatcher is the whole capture loop now.",
    },
  ],
  unattributed: 7,
}

// Citation-edged graph showcase: every edge below quotes the verbatim
// fragment text or commit message that justifies it. Nothing here is drawn
// from similarity or co-occurrence — an edge with no quote is not drawn.
export const DEMO_GRAPH = {
  nodes: [
    { id: 'g1', name: 'Dreamcatcher Workspace Foundation', kind: 'artifact' },
    { id: 'g2', name: 'Chrome Extension — One-Click Capture', kind: 'artifact' },
    { id: 'g3', name: 'Why pgvector at our scale', kind: 'chat' },
    { id: 'g4', name: 'Memory & Embeddings Research', kind: 'artifact' },
    { id: 'g5', name: 'Portfolio Builder scope check', kind: 'chat' },
    { id: 'g6', name: 'Portfolio Builder for Side-Projects', kind: 'artifact' },
    { id: 'g7', name: 'Northwind Health Onboarding Redesign', kind: 'artifact' },
  ],
  edges: [
    {
      from: 'g1',
      to: 'g2',
      quote:
        'The friction of switching apps to file an idea is the entire reason Dreamcatcher exists — one click, one keypress, never leave the conversation.',
    },
    {
      from: 'g3',
      to: 'g4',
      quote: 'commit a3f19c2 — "wire pgvector cosine search into embeddings.query, drop the brute-force fallback"',
    },
    {
      from: 'g1',
      to: 'g4',
      quote:
        'Everything Dreamcatcher does, it does because of decisions captured here — the shape of a project, what counts as a fragment, how todos roll up out of conversation.',
    },
    {
      from: 'g5',
      to: 'g6',
      quote: 'Custom domain CNAME flow added without removing earlier scope — flagging before it ships.',
    },
    {
      from: 'g6',
      to: 'g7',
      quote: 'commit 5e02d41 — "reuse the Portfolio Builder onboarding step copy for Northwind\'s redesign"',
    },
  ],
  unattributed: 5,
}

// Decided AI suggestions — the history behind the "AI accepts" rate on
// Analytics. Each entry is a past proposal from the deterministic matcher and
// the owner's decision on it (ratified in the UI, never auto-applied).
export const SUGGESTION_LOG = [
  { id: 'sl-1', kind: 'merge', decision: 'accepted', decidedAt: iso('2026-03-04T10:10') },
  { id: 'sl-2', kind: 'todo', decision: 'accepted', decidedAt: iso('2026-03-11T09:40') },
  { id: 'sl-3', kind: 'risk', decision: 'dismissed', decidedAt: iso('2026-03-18T14:05') },
  { id: 'sl-4', kind: 'retro', decision: 'accepted', decidedAt: iso('2026-03-25T16:20') },
  { id: 'sl-5', kind: 'merge', decision: 'accepted', decidedAt: iso('2026-04-02T11:00') },
  { id: 'sl-6', kind: 'todo', decision: 'dismissed', decidedAt: iso('2026-04-09T09:15') },
  { id: 'sl-7', kind: 'merge', decision: 'accepted', decidedAt: iso('2026-04-16T13:30') },
  { id: 'sl-8', kind: 'risk', decision: 'accepted', decidedAt: iso('2026-04-23T10:50') },
  { id: 'sl-9', kind: 'todo', decision: 'accepted', decidedAt: iso('2026-04-30T15:10') },
  { id: 'sl-10', kind: 'retro', decision: 'dismissed', decidedAt: iso('2026-05-06T09:00') },
  { id: 'sl-11', kind: 'merge', decision: 'accepted', decidedAt: iso('2026-05-12T11:45') },
  { id: 'sl-12', kind: 'todo', decision: 'accepted', decidedAt: iso('2026-05-15T14:25') },
  { id: 'sl-13', kind: 'risk', decision: 'dismissed', decidedAt: iso('2026-05-19T10:05') },
  { id: 'sl-14', kind: 'merge', decision: 'accepted', decidedAt: iso('2026-05-21T16:40') },
]
