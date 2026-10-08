/**
 * Render credit estimates for social compose - UI copy only (actual charges on each API success).
 */

import type { PhotoSource } from '@/lib/social/composeModel'

export type ComposeAccountingMode = 'legacy' | 'wallet'

export type ComposeCreditEstimateInput = {
  photoSource: PhotoSource
  /** True after a successful AI photo generate (Step 2) - already charged. */
  aiPhotoCreditSpent: boolean
  /** True after a successful Enhance photo (Step 2) - already charged. */
  photoCleanupApplied: boolean
  /** Infographic + no photo: opt-in AI-designed frame. */
  aiDesignedBackground?: boolean
  /** From GET /api/renders/credits. Default legacy so existing copy stays. */
  accounting?: ComposeAccountingMode
}

function isWallet(input: ComposeCreditEstimateInput): boolean {
  return input.accounting === 'wallet'
}

function isAiPhotoSource(source: PhotoSource): boolean {
  return source === 'ai_generate' || source === 'custom_prompt'
}

function isReusedPhotoSource(source: PhotoSource): boolean {
  return (
    source === 'upload' ||
    source === 'job' ||
    source === 'unsplash' ||
    source === 'pexels' ||
    source === 'library'
  )
}

/** Total credits for a full successful compose from current selections. */
export function estimateComposeCreditsTotal(input: ComposeCreditEstimateInput): {
  credits: number
  parts: string[]
} {
  const parts: string[] = []
  let credits = 0

  if (input.photoCleanupApplied) {
    credits += 1
    parts.push('enhance')
  }

  if (isAiPhotoSource(input.photoSource)) {
    credits += 1
    parts.push('AI photo')
  }

  if (input.photoSource === 'none' && input.aiDesignedBackground) {
    credits += 1
    parts.push('AI background')
    if (!isWallet(input)) {
      credits += 1
      parts.push('composite')
    }
  } else if (!isWallet(input)) {
    credits += 1
    parts.push('composite')
  }

  return { credits, parts }
}

/** Credits still to charge when clicking Step 5 Generate (hybrid-render). */
export function estimateComposeCreditsForGenerateStep(input: ComposeCreditEstimateInput): number {
  if (input.photoSource === 'none' && input.aiDesignedBackground) {
    return isWallet(input) ? 1 : 2
  }
  return isWallet(input) ? 0 : 1
}

export function formatComposeTotalCreditLine(input: ComposeCreditEstimateInput): string {
  const { credits, parts } = estimateComposeCreditsTotal(input)
  const noun = credits === 1 ? 'credit' : 'credits'
  const detail = parts.length > 1 ? ` (${parts.join(' + ')})` : ''
  return `Uses ${credits} render ${noun} total on success${detail}. No charge if a step fails.`
}

export function formatComposeGenerateStepCreditLine(input: ComposeCreditEstimateInput): string {
  const stepCredits = estimateComposeCreditsForGenerateStep(input)
  const { credits: total } = estimateComposeCreditsTotal(input)
  const noun = stepCredits === 1 ? 'credit' : 'credits'

  if (input.photoSource === 'none' && input.aiDesignedBackground) {
    return isWallet(input)
      ? 'Uses 1 render on success (AI background). Layout composite is free.'
      : 'Uses 2 render credits on success (AI background + composite). Same pool as Before & After.'
  }

  if (isWallet(input)) {
    return 'Layout composite does not use a render. Captions, logo, save and publish are free.'
  }

  if (total === 1) {
    return `Uses 1 render ${noun} on success (composite). Same pool as Before & After.`
  }

  const already = total - stepCredits
  if (already > 0 && isAiPhotoSource(input.photoSource) && input.aiPhotoCreditSpent) {
    return `Uses 1 render ${noun} on success (composite - AI photo already generated).`
  }
  if (already > 0 && input.photoCleanupApplied) {
    return `Uses 1 render ${noun} on success (composite - enhance already applied).`
  }

  return `Uses 1 render ${noun} on success (composite). ${formatComposeTotalCreditLine(input)}`
}

export function formatAiPhotoGenerateCreditLine(accounting?: ComposeAccountingMode): string {
  return accounting === 'wallet'
    ? 'Uses 1 render. No charge if generation fails.'
    : 'Uses 1 render credit on success. No charge if generation fails.'
}

export function formatPhotoCleanupCreditLine(accounting?: ComposeAccountingMode): string {
  return accounting === 'wallet'
    ? 'Uses 1 render. No charge if enhancement fails.'
    : 'Uses 1 render credit on success. No charge if enhancement fails.'
}

/** Short label for Step 2 photo-source axis (updates when source changes). */
export function formatPhotoSourceCreditHint(input: ComposeCreditEstimateInput): string {
  if (input.photoSource === 'none') {
    if (input.aiDesignedBackground) {
      return isWallet(input)
        ? '1 render (AI background). Composite is free.'
        : '2 render credits (AI background + composite)'
    }
    return isWallet(input) ? '0 renders (layout only)' : '1 render credit (composite only)'
  }
  if (isAiPhotoSource(input.photoSource)) {
    return isWallet(input)
      ? '1 render (AI photo). Composite is free.'
      : '2 render credits (AI photo + composite)'
  }
  if (isReusedPhotoSource(input.photoSource)) {
    if (input.photoCleanupApplied) {
      return isWallet(input)
        ? '1 render (enhance). Composite is free.'
        : '2 render credits (enhance + composite)'
    }
    return isWallet(input)
      ? '0 renders unless you enhance the photo (+1)'
      : '1 render credit (composite) - optional +1 if you enhance the photo'
  }
  return formatComposeTotalCreditLine(input)
}
