/**
 * Shared body parsing for Recreate overlay retune / photo refine / finalize.
 */

import {
  COMPOSE_PLATFORMS,
  isContentFormat,
  isInfographicPreset,
  isPhotoSource,
  type ComposePlatform,
  type ContentFormat,
  type InfographicPreset,
  type PhotoSource,
} from '@/lib/social/composeModel'
import { parseInfographicContent } from '@/lib/social/infographicContent'
import { parseQuoteCardContent } from '@/lib/social/quoteCardContent'
import { parseSceneContent } from '@/lib/social/sceneContent'
import { isSocialLogoCorner, type SocialLogoCorner } from '@/lib/social/socialLogoCorner'
import type { PartialSocialTextStyles } from '@/lib/social/socialTextStyle'

export type InspirationRenderFields = {
  format: ContentFormat
  platform: ComposePlatform
  photoSource: PhotoSource
  photoUrl: string | null
  preset?: InfographicPreset
  content: unknown
  logoCorner: SocialLogoCorner | null
  textStyles: PartialSocialTextStyles | null
  showLogo: boolean
}

export function parseInspirationRenderFields(
  raw: unknown,
): { ok: true; fields: InspirationRenderFields } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Invalid body' }
  const body = raw as {
    format?: string
    preset?: string
    platform?: string
    photoSource?: string
    photoUrl?: string | null
    content?: unknown
    logoCorner?: string | null
    textStyles?: PartialSocialTextStyles | null
    showLogo?: boolean
  }
  const formatRaw = (body.format?.trim() || 'scene') as ContentFormat
  if (!isContentFormat(formatRaw)) return { ok: false, error: 'Invalid format' }

  const platformRaw = (body.platform?.trim() || 'instagram') as ComposePlatform
  if (!COMPOSE_PLATFORMS.includes(platformRaw)) return { ok: false, error: 'Invalid platform' }

  const photoSourceRaw = (body.photoSource?.trim() || 'none') as PhotoSource
  if (!isPhotoSource(photoSourceRaw)) return { ok: false, error: 'Invalid photoSource' }

  const photoUrl =
    photoSourceRaw === 'none' ? null : (body.photoUrl?.trim() || null)

  let preset: InfographicPreset | undefined
  let content: unknown
  try {
    if (formatRaw === 'infographic') {
      const presetRaw = body.preset?.trim() ?? ''
      if (!isInfographicPreset(presetRaw)) return { ok: false, error: 'Invalid preset' }
      preset = presetRaw
      content = parseInfographicContent(presetRaw, platformRaw, body.content)
    } else if (formatRaw === 'quote_card') {
      content = parseQuoteCardContent(body.content)
    } else {
      content = parseSceneContent(body.content)
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Invalid content',
    }
  }

  const logoCornerRaw = body.logoCorner?.trim()
  const logoCorner =
    logoCornerRaw && isSocialLogoCorner(logoCornerRaw) ? logoCornerRaw : null

  return {
    ok: true,
    fields: {
      format: formatRaw,
      platform: platformRaw,
      photoSource: photoSourceRaw,
      photoUrl,
      preset,
      content,
      logoCorner,
      textStyles: body.textStyles ?? null,
      showLogo: body.showLogo !== false,
    },
  }
}
