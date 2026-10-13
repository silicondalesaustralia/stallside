import type { CalendarEventType } from '@/lib/calendar/types'
import type { UnifiedCategory } from './types'

export const UNIFIED_CATEGORY_ORDER: UnifiedCategory[] = [
  'social',
  'orders',
  'fulfilment',
  'markets',
  'custom',
  'production',
  'subscriptions',
  'external',
]

export const UNIFIED_CATEGORY_LABEL: Record<UnifiedCategory, string> = {
  social: 'Social posts',
  orders: 'Order cut-offs',
  fulfilment: 'Pickup & delivery',
  markets: 'Markets',
  custom: 'Custom orders',
  production: 'Production',
  subscriptions: 'Subscriptions',
  external: 'My calendar',
}

export const UNIFIED_CATEGORY_TONE: Record<UnifiedCategory, { dot: string; card: string }> = {
  social: { dot: 'bg-violet-500', card: 'border-violet-200 bg-violet-50/90' },
  orders: { dot: 'bg-amber-500', card: 'border-amber-200 bg-amber-50/90' },
  fulfilment: { dot: 'bg-emerald-500', card: 'border-emerald-200 bg-emerald-50/90' },
  markets: { dot: 'bg-orange-500', card: 'border-orange-200 bg-orange-50/90' },
  custom: { dot: 'bg-pink-500', card: 'border-pink-200 bg-pink-50/90' },
  production: { dot: 'bg-stone-500', card: 'border-stone-200 bg-stone-50/90' },
  subscriptions: { dot: 'bg-teal-500', card: 'border-teal-200 bg-teal-50/90' },
  external: { dot: 'bg-slate-400', card: 'border-slate-200 bg-slate-50/90' },
}

const CATEGORY_BY_EVENT_TYPE: Record<CalendarEventType, UnifiedCategory> = {
  menu_open: 'orders',
  menu_close: 'orders',
  pickup: 'fulfilment',
  delivery: 'fulfilment',
  market: 'markets',
  custom_order: 'custom',
  production: 'production',
  packing: 'production',
  subscription: 'subscriptions',
  external: 'external',
}

export function categoryForEventType(type: CalendarEventType): UnifiedCategory {
  return CATEGORY_BY_EVENT_TYPE[type]
}
