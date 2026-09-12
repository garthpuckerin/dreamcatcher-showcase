// Sanitized sample AI conversations for the chat-replay capture demo.
// Pure ES module. Fixtures only — no backend, no streaming API, no real
// identities, emails, repos, or internal product names. Generic demo content
// (Demo User, Northwind, neutral product/architecture topics) consistent with
// the rest of the Field Notebook fixtures.

export const REPLAY_CONVERSATIONS = [
  {
    id: 'replay-mvp-planning',
    title: 'Habit Tracker — MVP Feature Planning',
    source: 'AI Assistant',
    glyph: 'AI',
    messages: [
      {
        role: 'user',
        content:
          "I'm scoping a habit tracker for the Northwind side-project. What are the most impactful features to prioritize for the MVP?",
      },
      {
        role: 'assistant',
        content:
          "For a habit tracker MVP, focus on a few high-impact features and resist the urge to add more:\n\n1. Daily Check-in — a single tap to complete each habit. Friction is the enemy of a daily-use app.\n2. Streak Counter — a calendar heat map of streaks. This is the strongest retention driver.\n3. Reminder Notifications — time-based reminders. Users who set them tend to retain noticeably better.\n4. Progress Dashboard — weekly and monthly completion rates with simple charts.\n\nDefer to v2: social features, AI coaching, and gamification badges. They add scope without proving the core loop.",
      },
      {
        role: 'user',
        content:
          "Makes sense. What about the data model? I was thinking local-first with cloud sync added later.",
      },
      {
        role: 'assistant',
        content:
          "Local-first with deferred sync is a clean starting point. A minimal model:\n\nhabits — id, name, icon, color, frequency (default daily), reminder_time, created_at.\ncompletions — id, habit_id, completed_at, notes, with a unique constraint on (habit_id, completed_at).\n\nThe unique constraint quietly prevents double-completions. When you add sync later, introduce a sync_status column and a merge strategy that tolerates offline edits, rather than retrofitting one under pressure.",
      },
      {
        role: 'user',
        content: 'Should I reach for one cross-platform framework or build native first?',
      },
      {
        role: 'assistant',
        content:
          "For a habit tracker the UI is modest, so a single cross-platform codebase is the pragmatic call. Lean cross-platform if you already know the ecosystem, want to share logic with a future web app, and value a deep package ecosystem. Go native-first only if you need pixel-perfect custom animation or are squeezing older low-end devices. For this scope, one cross-platform codebase will ship faster and keep maintenance lower.",
      },
    ],
    excerpts: [
      {
        title: 'MVP feature priorities',
        content:
          'Habit tracker MVP priorities: (1) Daily Check-in — one tap, minimize friction; (2) Streak Counter with calendar heat map — strongest retention driver; (3) Reminder Notifications — meaningful retention lift; (4) Progress Dashboard — weekly/monthly charts. Defer to v2: social features, AI coaching, gamification badges.',
        features: ['mvp', 'retention', 'product-strategy'],
      },
      {
        title: 'Local-first data model',
        content:
          'Local-first with deferred cloud sync. Two tables: habits (id, name, icon, color, frequency, reminder_time, created_at) and completions (id, habit_id, completed_at, notes) with a unique constraint on (habit_id, completed_at) to prevent double-completions. Add a sync_status column and an offline-tolerant merge strategy when sync arrives.',
        features: ['database', 'architecture', 'offline-first'],
      },
      {
        title: 'Cross-platform vs native decision',
        content:
          'For a modest-UI habit tracker, a single cross-platform codebase ships faster and keeps maintenance low. Prefer it when you know the ecosystem, want to share logic with a future web app, and value the package ecosystem. Choose native-first only for pixel-perfect animation or constrained low-end devices.',
        features: ['tech-stack', 'mobile', 'decision'],
      },
    ],
  },
  {
    id: 'replay-auth-architecture',
    title: 'Multi-Tenant API — Authentication Design',
    source: 'AI Assistant',
    glyph: 'AI',
    messages: [
      {
        role: 'user',
        content:
          "I'm designing auth for a multi-tenant SaaS API. Organizations have members with different roles. What's a sound approach?",
      },
      {
        role: 'assistant',
        content:
          "A token-plus-RBAC approach with organization-scoped access tokens works well for multi-tenant APIs. Keep each token small and explicit: subject (the user), the active organization, the role, a permissions list, and an expiry.\n\nKey decisions:\n- Short-lived access tokens (around 15 minutes) paired with longer-lived refresh tokens.\n- Put the organization id in every token, and validate tenant isolation in middleware.\n- Use an explicit permissions array for fine-grained access rather than relying on role strings alone.\n- Rotate refresh tokens — each use invalidates the previous one.\n\nThis closes the two most common multi-tenant gaps: cross-tenant data leakage and privilege escalation.",
      },
      {
        role: 'user',
        content: 'How should I handle a user who belongs to several organizations?',
      },
      {
        role: 'assistant',
        content:
          "Prefer an organization-switcher pattern. The user authenticates once and gets a base session, then selecting an organization issues a new organization-scoped access token. This keeps tokens small, gives you a clean audit trail tied to a single organization context, and makes per-organization revocation straightforward. The alternative — packing every membership into one token — is simpler at first but bloats the token and muddies the audit trail as memberships grow.",
      },
    ],
    excerpts: [
      {
        title: 'Multi-tenant token + RBAC design',
        content:
          'Organization-scoped access tokens with RBAC. Each token carries subject, active organization, role, a permissions array, and an expiry. Short-lived access tokens (~15 min) plus rotating refresh tokens. Organization id in every token with middleware-enforced tenant isolation. Prevents cross-tenant data leakage and privilege escalation.',
        features: ['auth', 'multi-tenant', 'security'],
      },
      {
        title: 'Organization-switcher pattern',
        content:
          'For users in multiple organizations, prefer an organization-switcher: authenticate once for a base session, then issue a new organization-scoped token on switch. Keeps tokens small, gives a clean per-organization audit trail, and enables per-organization revocation. Beats a single multi-membership token, which bloats and muddies auditing as memberships grow.',
        features: ['auth', 'ux-pattern', 'scalability'],
      },
    ],
  },
]
