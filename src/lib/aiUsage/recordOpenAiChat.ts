import { estimateLlmCostUsd } from './providerPricing'
import { recordAiUsageEvent, usageContextToEventFields } from './recordAiUsageEvent'
import type { AiUsageContext, AiUsageType } from './features'

export async function recordOpenAiChatUsage(input: {
  ctx?: AiUsageContext
  model: string
  promptTokens?: number | null
  completionTokens?: number | null
  requestId?: string | null
  status: 'success' | 'failed'
  errorCode?: string
  usageType?: Extract<AiUsageType, 'llm_tokens' | 'vision_tokens'>
}): Promise<void> {
  const fields = usageContextToEventFields(input.ctx)
  if (!fields.businessId) return
  const estimate = estimateLlmCostUsd({
    provider: 'openai',
    model: input.model,
    inputTokens: input.promptTokens,
    outputTokens: input.completionTokens,
  })
  await recordAiUsageEvent({
    ...fields,
    provider: 'openai',
    model: input.model,
    usageType: input.usageType ?? 'llm_tokens',
    inputTokens: input.promptTokens,
    outputTokens: input.completionTokens,
    providerRequestId: input.requestId,
    providerCostUsd: estimate.usd,
    costQuality: estimate.quality,
    pricingVersion: estimate.pricingVersion,
    status: input.status,
    errorCode: input.errorCode,
    metadata: {
      cost_estimate_status: estimate.quality,
      cost_is_estimate: estimate.quality === 'estimated',
      customer_credits_charged: fields.customerCreditsCharged ?? 0,
    },
  })
}
