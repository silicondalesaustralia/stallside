// ============================================================
// lib/aiAgent/llmProvider.ts
//
// ROLE: Multi-provider LLM abstraction for the AI agent system.
// Normalises Anthropic, OpenAI, and OpenRouter into a single
// callLLM() interface so the conversation engine and lead
// extractor never need to know which backend is active.
//
// Configuration (environment variables):
//
//   AI_LLM_PROVIDER   - 'anthropic' | 'openai' | 'openrouter'
//                        Default: 'anthropic'
//
//   AI_LLM_MODEL      - Model string for the configured provider.
//                        Defaults per provider:
//                          anthropic:   claude-haiku-4-5-20251001
//                          openai:      gpt-4o-mini
//                          openrouter:  meta-llama/llama-3.3-70b-instruct
//
//   AI_LLM_MODEL_EXTRACTION - Optional cheaper model for JSON
//                             extraction tasks (extractLeadInfo).
//                             Falls back to AI_LLM_MODEL if not set.
//
//   AI_RECEPTIONIST_LLM_MODEL - Missed Call / AI receptionist only.
//                             Resolved in lib/aiAgent/receptionistLlm.ts.
//                             Does not change AI_LLM_MODEL consumers.
//
//   ANTHROPIC_API_KEY  - Required when provider = 'anthropic'
//   OPENAI_API_KEY     - Required when provider = 'openai'
//   OPENROUTER_API_KEY - Required when provider = 'openrouter'
//
// Recommended settings per use-case:
//
//   Cheapest (OpenRouter free/cheap):
//     AI_LLM_PROVIDER=openrouter
//     AI_LLM_MODEL=meta-llama/llama-3.3-70b-instruct
//     AI_LLM_MODEL_EXTRACTION=meta-llama/llama-3.1-8b-instruct
//     OPENROUTER_API_KEY=sk-or-...
//
//   Best quality (Anthropic):
//     AI_LLM_PROVIDER=anthropic
//     AI_LLM_MODEL=claude-haiku-4-5-20251001
//     AI_LLM_MODEL_EXTRACTION=claude-haiku-4-5-20251001
//     ANTHROPIC_API_KEY=sk-ant-...
//
//   Already using OpenAI:
//     AI_LLM_PROVIDER=openai
//     AI_LLM_MODEL=gpt-4o-mini
//     AI_LLM_MODEL_EXTRACTION=gpt-4o-mini
//     OPENAI_API_KEY=sk-...
//
// Part of Phase 1 of the StitchedUp AI Agent system.
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { AiUsageContext } from '@/lib/aiUsage/features'
import { recordAiUsageEvent, usageContextToEventFields } from '@/lib/aiUsage/recordAiUsageEvent'
import { estimateLlmCostUsd } from '@/lib/aiUsage/providerPricing'

export type LLMProvider = 'anthropic' | 'openai' | 'openrouter'

export interface LLMMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LLMOptions {
  maxTokens?: number
  temperature?: number
  /** Explicit model override. Wins over env lookup. */
  model?: string
  /** Optional cost attribution. Missing businessId skips the ledger insert. */
  usageContext?: AiUsageContext
}

export interface LLMUsage {
  inputTokens?: number
  outputTokens?: number
  cachedInputTokens?: number
  requestId?: string
}

export interface LLMResult {
  content: string
  provider: LLMProvider
  model: string
  durationMs?: number
  usage?: LLMUsage
}

// ── Provider defaults ─────────────────────────────────────────────────────────

const DEFAULT_MODELS: Record<LLMProvider, string> = {
  anthropic:   'claude-haiku-4-5-20251001',
  openai:      'gpt-4o-mini',
  openrouter:  'meta-llama/llama-3.3-70b-instruct',
}

function resolveProvider(): LLMProvider {
  const raw = (process.env.AI_LLM_PROVIDER || 'anthropic').toLowerCase()
  if (raw === 'openai' || raw === 'openrouter' || raw === 'anthropic') return raw
  console.warn(`[LLMProvider] Unknown AI_LLM_PROVIDER "${raw}", defaulting to "anthropic"`)
  return 'anthropic'
}

function resolveModel(provider: LLMProvider, modelEnvVar = 'AI_LLM_MODEL', explicit?: string): string {
  if (explicit?.trim()) return explicit.trim()
  return process.env[modelEnvVar] || DEFAULT_MODELS[provider]
}

// ── Provider implementations ──────────────────────────────────────────────────

async function callAnthropic(
  systemPrompt: string,
  messages: LLMMessage[],
  model: string,
  options: LLMOptions
): Promise<{ text: string; usage?: LLMUsage }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured')

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model,
    max_tokens: options.maxTokens ?? 300,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const usageAny = response.usage as {
    input_tokens?: number
    output_tokens?: number
    cache_read_input_tokens?: number
  } | undefined
  return {
    text: text.trim(),
    usage: {
      inputTokens: usageAny?.input_tokens,
      outputTokens: usageAny?.output_tokens,
      cachedInputTokens: usageAny?.cache_read_input_tokens,
      requestId: response.id,
    },
  }
}

async function callOpenAI(
  systemPrompt: string,
  messages: LLMMessage[],
  model: string,
  options: LLMOptions
): Promise<{ text: string; usage?: LLMUsage }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model,
    max_tokens: options.maxTokens ?? 300,
    temperature: options.temperature ?? 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
  })

  return {
    text: (response.choices[0]?.message?.content ?? '').trim(),
    usage: {
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      requestId: response.id,
    },
  }
}

async function callOpenRouter(
  systemPrompt: string,
  messages: LLMMessage[],
  model: string,
  options: LLMOptions
): Promise<{ text: string; usage?: LLMUsage }> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured')

  // OpenRouter is OpenAI-API-compatible - just swap the base URL and key
  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://stitchedup.app',
      'X-Title': 'StitchedUp AI Agent',
    },
  })

  const response = await client.chat.completions.create({
    model,
    max_tokens: options.maxTokens ?? 300,
    temperature: options.temperature ?? 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
  })

  return {
    text: (response.choices[0]?.message?.content ?? '').trim(),
    usage: {
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      requestId: response.id,
    },
  }
}

export async function recordLlmUsage(input: {
  ctx?: AiUsageContext
  provider: LLMProvider
  model: string
  usage?: LLMUsage
  status: 'success' | 'failed'
  errorCode?: string
}): Promise<void> {
  const fields = usageContextToEventFields(input.ctx)
  if (!fields.businessId) {
    if (input.ctx) {
      console.warn('[AiUsage] missing usage response attribution', {
        feature: fields.feature,
        provider: input.provider,
      })
    }
    return
  }
  const estimate = estimateLlmCostUsd({
    provider: input.provider,
    model: input.model,
    inputTokens: input.usage?.inputTokens,
    outputTokens: input.usage?.outputTokens,
    cachedInputTokens: input.usage?.cachedInputTokens,
  })
  if (estimate.quality === 'unknown') {
    console.warn('[AiUsage] unknown provider model pricing', {
      provider: input.provider,
      model: input.model,
    })
  }
  await recordAiUsageEvent({
    ...fields,
    provider: input.provider,
    model: input.model,
    usageType: 'llm_tokens',
    inputTokens: input.usage?.inputTokens,
    outputTokens: input.usage?.outputTokens,
    cachedInputTokens: input.usage?.cachedInputTokens,
    providerRequestId: input.usage?.requestId,
    providerCostUsd: estimate.usd,
    costQuality: estimate.quality,
    pricingVersion: estimate.pricingVersion,
    status: input.status,
    errorCode: input.errorCode,
    metadata: {
      cost_estimate_status: estimate.quality,
      cost_is_estimate: estimate.quality === 'estimated',
    },
  })
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * callLLM - unified interface for all supported LLM providers.
 *
 * @param systemPrompt  - The system/instruction prompt
 * @param messages      - Conversation history (user/assistant turns only)
 * @param options       - maxTokens, temperature
 * @param modelEnvVar   - Which env var to read the model from.
 *                        Use 'AI_LLM_MODEL_EXTRACTION' for extraction tasks.
 */
export async function callLLM(
  systemPrompt: string,
  messages: LLMMessage[],
  options: LLMOptions = {},
  modelEnvVar = 'AI_LLM_MODEL'
): Promise<LLMResult> {
  const provider = resolveProvider()
  const model = resolveModel(provider, modelEnvVar, options.model)
  const started = Date.now()

  const logCtx = {
    provider,
    model,
    modelEnvVar,
    messageCount: messages.length,
    apiKeyPresent: Boolean(
      provider === 'anthropic'  ? process.env.ANTHROPIC_API_KEY  :
      provider === 'openai'     ? process.env.OPENAI_API_KEY     :
                                  process.env.OPENROUTER_API_KEY
    ),
  }
  console.log('[LLMProvider] Calling', logCtx)

  try {
    let content: string
    let usage: LLMUsage | undefined

    if (provider === 'anthropic') {
      const anthropic = await callAnthropic(systemPrompt, messages, model, options)
      content = anthropic.text
      usage = anthropic.usage
    } else if (provider === 'openai') {
      const openai = await callOpenAI(systemPrompt, messages, model, options)
      content = openai.text
      usage = openai.usage
    } else {
      const routed = await callOpenRouter(systemPrompt, messages, model, options)
      content = routed.text
      usage = routed.usage
    }

    const durationMs = Date.now() - started
    console.log('[LLMProvider] Success', {
      provider,
      model,
      outputLength: content.length,
      durationMs,
      inputTokens: usage?.inputTokens,
      outputTokens: usage?.outputTokens,
    })
    await recordLlmUsage({
      ctx: options.usageContext,
      provider,
      model,
      usage,
      status: 'success',
    })
    return { content, provider, model, durationMs, usage }
  } catch (err: unknown) {
    const isStatusErr = err instanceof Error && 'status' in err
    console.error('[LLMProvider] FAILED', {
      ...logCtx,
      message:   err instanceof Error ? err.message : String(err),
      status:    isStatusErr ? (err as { status?: number }).status : undefined,
      errorType: err instanceof Error ? err.constructor.name : typeof err,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      detail:    (err as any)?.error ?? (err as any)?.response?.data ?? undefined,
    })
    await recordLlmUsage({
      ctx: options.usageContext,
      provider,
      model,
      status: 'failed',
      errorCode: isStatusErr ? String((err as { status?: number }).status) : 'llm_failed',
    })
    throw err  // Re-throw - callers handle the fallback message
  }
}
