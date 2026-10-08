import {
  INFOGRAPHIC_PRESET_LABELS,
  isInfographicPreset,
  type ContentFormat,
} from '@/lib/social/composeModel'
import { INFOGRAPHIC_PLATFORM_SIZES } from '@/lib/social/infographic/platformSizes'

export interface HybridRenderListItem {
  id: string
  preset: string
  platform: 'instagram' | 'facebook' | 'gmb'
  photo_source: string | null
  photo_url: string | null
  content: Record<string, unknown>
  result_url: string
  status: string
  created_at: string
  job_id: string | null
}

export function formatPresetKey(preset: string): ContentFormat | null {
  if (preset === 'scene') return 'scene'
  if (preset === 'quote_card') return 'quote_card'
  if (isInfographicPreset(preset)) return 'infographic'
  return null
}

export function formatPresetLabel(preset: string): string {
  if (preset === 'scene') return 'Scene'
  if (preset === 'quote_card') return 'Quote card'
  if (isInfographicPreset(preset)) return INFOGRAPHIC_PRESET_LABELS[preset]
  return preset
}

export function platformSizeLabel(platform: HybridRenderListItem['platform']): string {
  const { width, height } = INFOGRAPHIC_PLATFORM_SIZES[platform]
  return `${width}×${height}`
}

/** Picker only - raw background URL, never the baked composite result_url. */
export function reusablePhotoUrl(render: HybridRenderListItem): string | null {
  const url = render.photo_url?.trim()
  return url && url.startsWith('https://') ? url : null
}

/** Social caption stored on the render `content` jsonb (not overlay headline). */
export function libraryCaptionFromContent(content: Record<string, unknown> | null | undefined): string {
  if (!content || typeof content !== 'object') return ''
  const raw = content.caption
  return typeof raw === 'string' ? raw.trim() : ''
}

export function withLibraryCaption(
  content: Record<string, unknown>,
  caption: string,
): Record<string, unknown> {
  return { ...content, caption: caption.trim() }
}
