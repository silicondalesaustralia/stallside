/**
 * Compose axes for /social Create tab.
 * Format × Photo source are independent; occasion sub-type sets soft defaults via postTaxonomy.
 */

import type { InfographicPlatformId } from '@/lib/social/infographic/checklistLayout'
import {
  DEFAULT_POST_SUBTYPE_ID,
  getPostSubtypeDefinition,
  isPostSubtypeId,
  type PostSubtypeId,
} from '@/lib/social/postTaxonomy'

// ── Content format ────────────────────────────────────────────────────────────

export const CONTENT_FORMATS = ['scene', 'infographic', 'quote_card'] as const
export type ContentFormat = (typeof CONTENT_FORMATS)[number]

export const CONTENT_FORMAT_LABELS: Record<ContentFormat, string> = {
  scene:       'Scene-style',
  infographic: 'Infographic-style',
  quote_card:  'Quote card',
}

export function isContentFormat(value: string): value is ContentFormat {
  return (CONTENT_FORMATS as readonly string[]).includes(value)
}

// ── Photo source ──────────────────────────────────────────────────────────────

export const PHOTO_SOURCES = [
  'upload',
  'job',
  'unsplash',
  'pexels',
  'ai_generate',
  'custom_prompt',
  'library',
  'none',
] as const
export type PhotoSource = (typeof PHOTO_SOURCES)[number]

export const PHOTO_SOURCE_LABELS: Record<PhotoSource, string> = {
  upload:        'Upload',
  job:           'Job Photos',
  unsplash:      'Unsplash',
  pexels:        'Pexels',
  ai_generate:   'AI Generate',
  custom_prompt: 'Custom Prompt',
  library:       'Your Library',
  none:          'No photo',
}

export function isPhotoSource(value: string): value is PhotoSource {
  return (PHOTO_SOURCES as readonly string[]).includes(value)
}

// ── Infographic presets ───────────────────────────────────────────────────────

export const INFOGRAPHIC_PRESETS = [
  'checklist',
  'did_you_know',
  'before_after_comparison',
  'process_steps',
] as const
export type InfographicPreset = (typeof INFOGRAPHIC_PRESETS)[number]

export const INFOGRAPHIC_PRESET_LABELS: Record<InfographicPreset, string> = {
  checklist:               'Checklist',
  did_you_know:            'Did You Know',
  before_after_comparison: 'Text comparison',
  process_steps:           'Process Steps',
}

export const INFOGRAPHIC_PRESET_DESCRIPTIONS: Record<InfographicPreset, string> = {
  checklist:               'Numbered tips - variable item count',
  did_you_know:            'Single fact or stat callout',
  before_after_comparison: 'Split-panel copy (not photo Before & After Render)',
  process_steps:           'Numbered 1-2-3 sequence',
}

export function isInfographicPreset(value: string): value is InfographicPreset {
  return (INFOGRAPHIC_PRESETS as readonly string[]).includes(value)
}

// ── Platform (compose) ────────────────────────────────────────────────────────

export type ComposePlatform = InfographicPlatformId

export const COMPOSE_PLATFORMS: ComposePlatform[] = ['instagram', 'facebook', 'gmb']

// ── Checklist AI / layout caps (locked from Phase B Vercel spike) ──────────────

/** Max checklist items on Facebook 1200×630 - denser than IG/GMB. */
export const FACEBOOK_CHECKLIST_MAX_ITEMS = 6

/** Soft max items for Instagram / GMB (layout spike tested up to 7). */
export const DEFAULT_CHECKLIST_MAX_ITEMS = 7

/** Target max characters per checklist bullet (especially Facebook). */
export const CHECKLIST_BULLET_MAX_CHARS = 70

export function checklistMaxItemsForPlatform(platform: ComposePlatform): number {
  return platform === 'facebook'
    ? FACEBOOK_CHECKLIST_MAX_ITEMS
    : DEFAULT_CHECKLIST_MAX_ITEMS
}

// ── Soft occasion defaults (non-binding) ──────────────────────────────────────

export interface ComposeDefaults {
  format: ContentFormat
  photoSource: PhotoSource
  /** Suggested when format is infographic; ignored for scene / quote_card. */
  infographicPreset: InfographicPreset
}

/**
 * Soft defaults when the user picks a post sub-type in Step 1.
 * Every combination stays fully selectable - nothing gated.
 */
export function composeDefaultsForSubtype(subtypeId: PostSubtypeId): ComposeDefaults {
  return getPostSubtypeDefinition(subtypeId).composeDefaults
}

export function composeDefaultsForSubtypeOrDefault(
  subtypeId: PostSubtypeId | null | undefined,
): ComposeDefaults {
  const id =
    subtypeId && isPostSubtypeId(subtypeId) ? subtypeId : DEFAULT_POST_SUBTYPE_ID
  return composeDefaultsForSubtype(id)
}
