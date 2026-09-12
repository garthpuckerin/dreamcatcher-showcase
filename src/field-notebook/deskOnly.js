// Surface-scoped mobile authority (companion pattern, ported from the
// ops-command-center-showcase reference implementation and adapted to
// Dreamcatcher's route shape).
//
// The phone is Dreamcatcher's triage/monitoring companion: Today, All Dreams,
// and Inbox travel there. Screens that are genuinely authoring/composition
// workflows, or that need a wide precise canvas to be usable at all, render a
// designed "stays at the desk" state on phone viewports instead of a
// squeezed-down authoring UI. This is scoped by `route.kind`, the same key
// the Rail/Topbar/router already use — so a deep link into a desk-only route
// (e.g. a saved `?route=builder` or a restored session) gets the same honest
// state a nav click would, not the authoring surface.
//
// Judgment calls (see docs/DECISIONS.md for the full rationale):
//   - Builder Notes: long-form authoring with a proof matrix meant to be
//     compared side-by-side — a desktop surface.
//   - Case Study Composer: arranging sections/media/narrative is composition,
//     not triage.
//   - Graph: the core interaction is clicking a specific citation edge among
//     several close together on a wide horizontal timeline — needs a precise
//     pointer and screen width, not a thumb.
// Revisions and Settings are deliberately NOT desk-only: Revisions' core
// interaction is a single ratify/reject decision after reading a card of
// text, and Settings is rows of toggles/selects — both genuinely usable at
// phone width, so they stay on the phone as companion surfaces.
export const DESK_ONLY_VIEWS = {
  builder: {
    label: 'Builder Notes',
    why: "Builder Notes pairs long-form direction copy with a proof matrix meant to be scanned side-by-side — it needs a wide screen to compare, not a phone column. Open on desktop.",
  },
  case: {
    label: 'Case Study Composer',
    why: 'Composing a case study means arranging sections, media, and narrative against each other as you draft — that’s a desktop authoring surface. Open on desktop.',
  },
  graph: {
    label: 'Graph',
    why: 'Reading the citation graph means clicking one specific edge among several packed close together on a wide timeline to see its quote — that needs a precise pointer and screen width, not a thumb. Open on desktop.',
  },
}

export function isDeskOnlyRoute(route) {
  return Boolean(route && DESK_ONLY_VIEWS[route.kind])
}
