/**
 * Scene-style hybrid compose copy (headline / tagline / CTA).
 */

import { z } from 'zod'
import { formatPhoneAU } from '@/lib/utils/format'
import { resolveDefaultTagline, type FieldSourceBusiness } from '@/lib/social/templateFields'

export const SCENE_HEADLINE_MAX = 60
export const SCENE_TAGLINE_MAX = 50
export const SCENE_CTA_MAX = 50

export const sceneContentSchema = z.object({
  headline: z.string().min(1).max(SCENE_HEADLINE_MAX),
  tagline:  z.string().max(SCENE_TAGLINE_MAX),
  cta:      z.string().min(1).max(SCENE_CTA_MAX),
})

export type SceneContent = z.infer<typeof sceneContentSchema>

export function parseSceneContent(raw: unknown): SceneContent {
  return sceneContentSchema.parse(raw)
}

function truncate(s: string, max: number): string {
  const t = s.trim()
  return t.length <= max ? t : t.slice(0, max)
}

/** CTA default: social_default_cta, else formatted AU phone. */
export function defaultSceneCta(business: {
  social_default_cta?: string | null
  phone?:               string | null
}): string {
  const cta = business.social_default_cta?.trim()
  if (cta) return truncate(cta, SCENE_CTA_MAX)
  const phone = business.phone?.trim()
  if (phone) return truncate(formatPhoneAU(phone), SCENE_CTA_MAX)
  return 'Call us today'
}

export function buildDefaultSceneContent(business: FieldSourceBusiness & {
  name?: string | null
  phone?: string | null
}): SceneContent {
  const headline = truncate(business.name?.trim() || 'Your Business', SCENE_HEADLINE_MAX)
  const tagline = truncate(resolveDefaultTagline(business), SCENE_TAGLINE_MAX)
  const cta = defaultSceneCta(business)
  return { headline, tagline, cta }
}
