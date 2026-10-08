import type { ContentFormat, PhotoSource } from '@/lib/social/composeModel'

/**
 * Wallet-mode charge kind for Build a layout / hybrid.
 * AI generation actions = 1 render. Deterministic composite / save / logo = 0.
 */
export type HybridAiChargeKind = 'none' | 'inline_ai_photo' | 'infographic_ai'

export function resolveHybridAiCharge(input: {
  chargeCredits?: boolean
  passThroughVisual?: boolean
  photoSource: PhotoSource
  photoUrl?: string | null
  format: ContentFormat
  aiDesignedBackground?: boolean
  infographicAiEnabled: boolean
}): HybridAiChargeKind {
  if (input.chargeCredits === false || input.passThroughVisual) return 'none'

  const hasPhoto = Boolean(input.photoUrl?.trim())
  const isAiPhotoSource = input.photoSource === 'ai_generate' || input.photoSource === 'custom_prompt'

  if (isAiPhotoSource && !hasPhoto) return 'inline_ai_photo'

  if (
    input.format === 'infographic' &&
    input.photoSource === 'none' &&
    !hasPhoto &&
    input.aiDesignedBackground &&
    input.infographicAiEnabled
  ) {
    return 'infographic_ai'
  }

  return 'none'
}
