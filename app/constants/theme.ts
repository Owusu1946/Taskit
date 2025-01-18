export const CATEGORIES = {
  personal: { label: 'Personal', shortLabel: '👤 Personal', color: '#818CF8' },
  work: { label: 'Work', shortLabel: '💼 Work', color: '#F87171' },
  shopping: { label: 'Shopping', shortLabel: '🛒 Shop', color: '#34D399' },
  health: { label: 'Health', shortLabel: '❤️ Health', color: '#60A5FA' },
  other: { label: 'Other', shortLabel: '📌 Other', color: '#A78BFA' },
} as const;

export const PRIORITIES = {
  low: { label: 'Low', shortLabel: '↓', color: '#10B981' },
  medium: { label: 'Medium', shortLabel: '→', color: '#F59E0B' },
  high: { label: 'High', shortLabel: '↑', color: '#EF4444' },
} as const; 