import { estimateImageCostUsd } from './providerPricing'
import { recordAiUsageEvent, usageContextToEventFields } from './recordAiUsageEvent'
import type { AiUsageContext } from './features'

export async function recordImageGenerationUsage(input: {
  ctx?: AiUsageContext
  model: string
  usage?: {
    input_tokens?: number
    output_tokens?: number
    input_tokens_details?: { image_tokens?: number; text_tokens?: number }
  } | null
  status: 'success' | 'failed'
  size?: string
  quality?: string
  versions?: number
  errorCode?: string
}): Promise<void> {
  const fields = usageContextToEventFields(input.ctx)
  if (!fields.businessId) return
  const estimate = estimateImageCostUsd(input.model, input.usage ?? null)
  await recordAiUsageEvent({
    ...fields,
    provider: 'openai',
    model: input.model,
    usageType: 'image_generation',
    inputTokens: input.usage?.input_tokens ?? null,
    outputTokens: input.usage?.output_tokens ?? null,
    units: input.versions ?? 1,
    unitName: 'images',
    providerCostUsd: estimate.usd,
    costQuality: estimate.quality,
    pricingVersion: estimate.pricingVersion,
    status: input.status,
    errorCode: input.errorCode,
    metadata: {
      cost_quality: estimate.quality,
      cost_is_estimate: estimate.quality === 'estimated',
      cost_estimate_status: estimate.quality,
      size: input.size ?? null,
      quality: input.quality ?? null,
    },
  })
}
