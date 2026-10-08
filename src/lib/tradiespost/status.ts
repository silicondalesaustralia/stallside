/** Shared post / workflow status definitions - presentation only. */

export const TP_STATUS_VALUES = [
  'draft',
  'ready',
  'needs_review',
  'approved',
  'scheduled',
  'manual',
  'automatic',
  'published',
  'failed',
  'coming_soon',
] as const

export type TradiesPostStatus = (typeof TP_STATUS_VALUES)[number]

export type TradiesPostStatusStyle = {
  label: string
  className: string
}

/** Subtle badge colours - muted backgrounds, readable text. */
export const TP_STATUS_STYLES: Record<TradiesPostStatus, TradiesPostStatusStyle> = {
  draft: {
    label: 'Draft',
    className: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  },
  ready: {
    label: 'Ready',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  needs_review: {
    label: 'Needs review',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  manual: {
    label: 'Manual',
    className: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  },
  automatic: {
    label: 'Automatic',
    className: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  coming_soon: {
    label: 'Coming soon',
    className: 'bg-violet-50 text-violet-700 border-violet-200',
  },
}

export function getTradiesPostStatusStyle(status: TradiesPostStatus): TradiesPostStatusStyle {
  return TP_STATUS_STYLES[status]
}
