/**
 * Trade inference for social features.
 *
 * Fine-grained IDs live in canonicalTrades.ts (30 locked trades).
 * Orshot style tabs still use coarse buckets (electrical, plumbing, …) -
 * inferTradeCategory() returns those buckets for backwards compatibility.
 * Use inferCanonicalTrade() when you need the specific trade (AI imagery).
 */

import type { TemplateField } from '@/lib/social/templateFields'
import {
  CANONICAL_TRADE_LABELS,
  canonicalToStyleBucket,
  formatCanonicalTradeLabel,
  inferCanonicalTrade,
  isCanonicalTradeId,
  type CanonicalTradeId,
  type StyleTradeBucket,
} from '@/lib/social/canonicalTrades'

export {
  inferCanonicalTrade,
  formatCanonicalTradeLabel,
  isCanonicalTradeId,
  type CanonicalTradeId,
}

/** Known coarse trade categories for social style template tabs. */
export const SOCIAL_TRADE_CATEGORIES = [
  'electrical',
  'plumbing',
  'construction',
  'general',
] as const

export type SocialTradeCategory = (typeof SOCIAL_TRADE_CATEGORIES)[number]

export const SOCIAL_TRADE_CATEGORY_LABELS: Record<string, string> = {
  electrical:   'Electrical',
  plumbing:     'Plumbing',
  construction: 'Construction',
  home_service: 'Home Service',
  hvac:         'HVAC',
  cleaning:     'Cleaning',
  contractor:   'Contractor',
  general:      'General',
  // Canonical fine-grained labels (so UI can show them if a caller passes a canonical id)
  ...CANONICAL_TRADE_LABELS,
}

/**
 * Infer coarse style-template bucket from business data.
 * businesses has NO trade_type column - use ai_agent_services + name keywords.
 * Internally matches all 30 canonical trades, then maps to a style bucket.
 */
export function inferTradeCategory(input: {
  ai_agent_services?: string | null
  name?:              string | null
}): StyleTradeBucket | null {
  const canonical = inferCanonicalTrade(input)
  if (!canonical) return null
  return canonicalToStyleBucket(canonical)
}

export function formatTradeCategoryLabel(category: string): string {
  if (isCanonicalTradeId(category)) return CANONICAL_TRADE_LABELS[category]
  return SOCIAL_TRADE_CATEGORY_LABELS[category] ??
    category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')
}

export const DEFAULT_BUSINESS_KIND = 'local food and produce'

/** Prompt label for "a ___ business"; the generic bucket reads as a Vendl seller. */
export function businessKindLabel(category: string | null | undefined): string {
  const c = category?.trim()
  if (!c || c === 'general') return DEFAULT_BUSINESS_KIND
  return formatTradeCategoryLabel(c)
}

export interface SocialStyleTemplate {
  id:                 string
  name:               string
  trade_category:     string
  orshot_template_id: string
  orshot_page:        number | null
  thumbnail_url:      string | null
  sort_order:         number
  fields:             TemplateField[]
}

/** Tab order: business trade first, other trades, General last (only if templates exist). */
export function buildStyleTabs(
  templateCategories: string[],
  businessTrade: string | null,
): string[] {
  const fromTemplates = new Set(templateCategories)
  const tabs: string[] = []

  if (businessTrade && fromTemplates.has(businessTrade)) tabs.push(businessTrade)
  for (const cat of [...fromTemplates].sort()) {
    if (cat !== 'general' && cat !== businessTrade) tabs.push(cat)
  }
  if (fromTemplates.has('general') && !tabs.includes('general')) tabs.push('general')

  return tabs
}

export function defaultStyleTab(
  tabs: string[],
  businessTrade: string | null,
  templates: SocialStyleTemplate[],
): string {
  if (
    businessTrade &&
    tabs.includes(businessTrade) &&
    templates.some((t) => t.trade_category === businessTrade)
  ) {
    return businessTrade
  }
  if (tabs.includes('general')) return 'general'
  return tabs[0] ?? 'general'
}

export function firstTemplateInTab(
  templates: SocialStyleTemplate[],
  tab: string,
): SocialStyleTemplate | null {
  return templates
    .filter((t) => t.trade_category === tab)
    .sort((a, b) => a.sort_order - b.sort_order)[0] ?? null
}
