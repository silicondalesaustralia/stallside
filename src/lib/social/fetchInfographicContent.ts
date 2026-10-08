/**
 * Client helper for Phase C infographic copy.
 * CreateTab will call this from Phase E UI; usable now for smoke tests.
 */

import type { ComposePlatform, InfographicPreset } from '@/lib/social/composeModel'
import type { InfographicContent } from '@/lib/social/infographicContent'
import type { InspirationGenerationHints } from '@/lib/social/inspirationTypes'
import type { PostSubtypeId } from '@/lib/social/postTaxonomy'

export async function fetchInfographicContent(input: {
  preset: InfographicPreset
  platform: ComposePlatform
  postSubtype: PostSubtypeId
  jobId?: string
  generationHints?: InspirationGenerationHints | null
}): Promise<{
  content: InfographicContent
  tradeId: string | null
  tradeLabel: string
  model: string
  retried: boolean
}> {
  const res = await fetch('/api/social/infographic-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preset: input.preset,
      platform: input.platform,
      postSubtype: input.postSubtype,
      jobId: input.jobId,
      ...(input.generationHints ? { generationHints: input.generationHints } : {}),
    }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || json.detail || 'Content generation failed')
  }
  return {
    content: json.content as InfographicContent,
    tradeId: json.tradeId ?? null,
    tradeLabel: json.tradeLabel ?? 'Trade',
    model: json.model,
    retried: Boolean(json.retried),
  }
}
