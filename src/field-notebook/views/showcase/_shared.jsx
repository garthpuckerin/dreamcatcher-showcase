import { shiftIso } from '../../dates'

// An ISO timestamp `hoursAgo` hours before now — for "last synced" labels that
// should always read as a recent, today-relative sync.
const recentSync = hoursAgo => new Date(Date.now() - hoursAgo * 3600000).toISOString()

export const TEMPLATE_META = {
  'tpl-mvp': { author: 'Demo User', rating: '4.9', downloads: 1284, price: 'Free', free: true },
  'tpl-client': {
    author: 'Client Ops Lab',
    rating: '4.7',
    downloads: 638,
    price: '$19',
    free: false,
  },
  'tpl-research': {
    author: 'Research Guild',
    rating: '4.8',
    downloads: 914,
    price: 'Free',
    free: true,
  },
}

export const DEFAULT_PORTFOLIO_META = {
  theme: 'Case study',
  slug: 'case-study',
  published: shiftIso('2026-05-12'),
  visits: 0,
}

export const PORTFOLIO_META = {
  'case-northwind': {
    theme: 'Editorial',
    slug: 'northwind-health-onboarding',
    published: shiftIso('2026-05-12'),
    visits: 1824,
  },
  'case-extension': {
    theme: 'Product',
    slug: 'chrome-one-click-capture',
    published: shiftIso('2026-05-18'),
    visits: 761,
  },
  'case-dreamcatcher': {
    theme: 'Notebook',
    slug: 'dreamcatcher-workspace',
    published: shiftIso('2026-05-24'),
    visits: 1196,
  },
}

export const INTEGRATION_META = {
  // Live connectors — last sync is anchored to "earlier today" so the relative
  // label ("Xh ago") always reads as a fresh, recent sync.
  github: { tier: 'Pro', events: 482, lastSync: recentSync(2) },
  editor: { tier: 'Pro', events: 221, lastSync: recentSync(5) },
  slack: { tier: 'Team', events: 0, lastSync: null },
  notion: { tier: 'Team', events: 0, lastSync: null },
  figma: { tier: 'Planned', events: 0, lastSync: null },
}
