# Dreamcatcher — "The net"

**A workspace that catches scattered AI-conversation fragments and nets them into structured, traceable project notebooks.**
Capture a fragment from any AI chat, organize it into a "dream," and let a citation-backed graph and a human-ratified
retro-trace keep the workspace honest as ideas evolve — no fabricated confidence scores, no similarity-guessed edges.

`React` · `Vite` · `JavaScript` · token-driven design system · fixtures-only cockpit

**▶ [Live demo](https://garthpuckerin-dreamcatcher.vercel.app)** · [Case study](https://garthpuckerin.com/project-dreamcatcher) · [garthpuckerin.com](https://garthpuckerin.com)

> **This is the cockpit, not the engine.** A sanitized, mock-data demo of the product experience.
> The production backend — a managed Postgres database, real-time collaboration, source-repository sync,
> authentication, and the AI-assistant pipeline — is a separate private codebase. See
> [What's real vs. illustrative](#whats-real-vs-illustrative).

---

## The problem

AI conversations are where most real project thinking happens now, and almost all of it evaporates: a chat window
closes, a thread gets buried under a hundred others, and the idea that could have anchored a project is gone or
scattered across three different tools. Dreamcatcher exists to catch those fragments and keep them organized as a
project ("dream") — and, when projects get conflated because early fragments never got sorted, to trace them back
apart honestly instead of guessing.

## What it shows

- **Today** — daily triage of newly captured fragments and a workspace pulse.
- **All Dreams** — the full workspace, every project and its fragments, todos, and history.
- **Suggestions** — where the matcher proposes which dream a captured fragment belongs to, and flags the ones that
  belong to no dream at all. Every suggestion **cites** the fragment it patterns on — never a confidence percentage;
  production computes no such number, so neither does this demo.
- **Revisions** *(signature workflow)* — retro-tracing. When early fragments got conflated into one dream that's
  really several projects, a trace proposes an artifact-anchored split: which statements belong to which artifact,
  quoted inter-dream links, former-name candidates, and an honest unattributed count. **Nothing applies until a
  human ratifies it** — reject leaves the dream exactly as it was. **Ratify applies it, here too:** the four dreams
  are created from the conflated origin backlog (each taking the fragments the trace attributed to it), the origin is
  archived with the reason recorded, the Graph gains the quoted links as edges — and **Revert** restores the
  workspace exactly. Recorded and reversible, on mock data, the same contract as production.
- **Graph** *(signature workflow)* — a citation-edged map of how dreams relate. **Every edge is clickable and opens
  the verbatim quote or commit that justifies it** — never a similarity or co-occurrence guess, which is how most
  linked-notes graphs draw their edges. An honest margin count for statements the graph can't yet anchor.
- **Dream Wiki** — structured long-form notes per project, versioned.
- **AI Assistant** — ask, summarize, and surface insights over the current workspace; where it uses a real model
  call, it reads as one; where the demo shows deterministic matching (Suggestions, Graph), it's labeled as such —
  the two are never blurred.
- **Builder Notes, Analytics, Portfolio, Templates, Integrations, Settings** — supporting surfaces (theming/density,
  workspace analytics, a public case-study composer) that round out the workspace without overclaiming depth they
  don't have.

## Architecture — cited, not scored

Two disciplines carry the whole demo. **Honesty:** nothing in this UI asserts a capability production lacks, and
nothing understates one either — every AI-adjacent surface either shows a real model call or is explicit that it's
deterministic pattern-matching, with no invented confidence/similarity/accuracy numbers anywhere (a grep-gate
enforces this at every release, see [Run it locally](#run-it-locally)). **Coherence:** the whole fixture dataset is
anchored relative to *today*, not frozen to a build date — every relative timestamp, "N days ago" label, and history
view stays internally consistent no matter when the demo is viewed.

## What's real vs. illustrative

Honesty matters more than polish, so here's the exact boundary:

| Aspect | In this public demo | In the private production build |
|---|---|---|
| **Data** | Mock fixtures, anchored relative to today (`shiftIso()`) so the workspace always looks current | Postgres-backed workspaces, real fragments captured from live AI-chat sessions |
| **Fragment capture** | Illustrative fixtures only — no live capture | A Chrome extension + VS Code integration captures real ChatGPT/Claude conversations |
| **Suggestions** | **Real interaction model** — deterministic pattern-matching against fixture data, always cited, never a confidence score | Production also computes no confidence score; suggestions are labeled trajectory projections citing the dream(s) they pattern on — this demo mirrors that honestly rather than inventing an ML score for effect |
| **Revisions (retro-tracing)** | **Real interaction model** — the proposal renders; **ratify applies the split to the local workspace** (four dreams created, fragments partitioned by artifact, origin archived, Graph edges added) and **revert restores it byte-for-byte** (a unit gate proves the round trip); persisted in localStorage | The engine's retro-tracing module proposes the same class of artifact-anchored split against a live workspace and applies it on owner ratification; recorded and reversible there too. The demo's origin backlog is modeled on the engine's first real proposal (its own Connex/Nexus/PipelineOS/Dreamcatcher backlog) |
| **Graph** | **Real interaction model** — every edge click opens its citation; deterministic, time-ordered layout, no physics simulation | Every edge is backed by a verbatim quote or commit in the production graph as well — this demo's edge/citation contract is not simplified, only the dataset is |
| **AI Assistant** | Illustrative — canned responses over fixture data | A real OpenAI-backed assistant layer (multiple endpoints: summarization, tagging, project-name detection) |
| **Authentication** | None — a demo entry screen only | Real auth and session management |
| **Persistence** | In-memory / localStorage | Postgres-backed, with versioning |
| **Real-time collaboration** | Not shown | Roadmap item in the production engine — not yet built, and not claimed here or there |
| **Backend** | None — frontend only | Private codebase (React · Supabase · OpenAI) |

The production engine is private by design — the demo proves the *product experience and the retro-tracing/
citation-graph model*; the engine and its live AI wiring are the IP.

## Run it locally

```bash
npm install
npm run dev          # Vite dev server
npm run build        # production build
npm run lint         # eslint (flat config: js recommended + react + react-hooks)
npm run test:e2e     # Playwright smoke + axe-core WCAG 2.x A/AA gate (every screen, desktop + phone)
npm run test:unit    # anchor-coherence + fixture gates (node --test)
npm run test:sweeps  # whiteglove / mobile / viewport defect sweeps
npm run test:release # the full release gate (lint + build + unit + e2e + sweeps)
```

## Stack

React 18 · Vite · JavaScript · a token-driven design system (theme / density) · `node --test` for the fixture-coherence
and honesty gates · Playwright for e2e and the defect sweeps. No backend — every screen renders from static,
anchor-relative fixture data.

---

*Built by [Garth Puckerin](https://garthpuckerin.com). One system revealed every Thursday.*
