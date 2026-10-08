/**
 * POST /api/social/designed-variants
 *
 * Charge 1 credit, stream NDJSON of 3 parallel gpt-image-2 images.generate versions.
 * Isolated from inspiration-variants / Recreate.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { isAiDesignedEnabled } from '@/lib/social/aiDesignedConfig'
import { logDesignedAnalytics } from '@/lib/social/designedAnalytics'
import {
  AI_DESIGNED_SET_CREDIT_COST,
  parseDesignedGenerationId,
  shouldRefundDesignedGeneration,
} from '@/lib/social/designedCredits'
import { parseDesignedGenerateInput } from '@/lib/social/designedIntents'
import {
  parseDesignedVisualInputs,
  type DesignedResolvedVisual,
} from '@/lib/social/designedVisualInputs'
import { resolveDesignedVisualInputs } from '@/lib/social/resolveDesignedVisualInputs'
import { runDesignedVariants } from '@/lib/social/runDesignedVariants'
import {
  parseRecreateLogoPosition,
  parseRecreateLogoSize,
} from '@/lib/social/recreateLogoPlacement'
import {
  consumeRenderUsage,
  evaluateUsageAccess,
  insufficientUsageBody,
  InsufficientUsageError,
  paymentRequiredPayload,
  recordUsageGenerationMetrics,
  refundRenderUsage,
} from '@/lib/billing/usageAccounting'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { resolveSocialImageQualityForBusiness } from '@/lib/tradiespost/imageQuality'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  if (!isAiDesignedEnabled()) {
    return NextResponse.json({ error: 'AI Designed is not enabled' }, { status: 404 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured' },
      { status: 503 },
    )
  }

  let body: {
    userBrief?: unknown
    intentChip?: unknown
    jobId?: unknown
    generationId?: unknown
    showLogo?: unknown
    logoAssetId?: unknown
    logoPosition?: unknown
    logoSize?: unknown
    visualInputs?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsedInput = parseDesignedGenerateInput({
    userBrief: body.userBrief,
    intentChip: body.intentChip,
  })
  if (!parsedInput.ok) {
    return NextResponse.json(
      { error: parsedInput.error, code: parsedInput.code },
      { status: 400 },
    )
  }

  const jobId =
    typeof body.jobId === 'string' && body.jobId.trim() ? body.jobId.trim() : null

  const parsedLogoPosition = parseRecreateLogoPosition(body.logoPosition)
  if (typeof parsedLogoPosition === 'object' && 'ok' in parsedLogoPosition) {
    return NextResponse.json({ error: parsedLogoPosition.error, code: 'invalid_logo_position' }, { status: 400 })
  }
  const parsedLogoSize = parseRecreateLogoSize(body.logoSize)
  if (typeof parsedLogoSize === 'object' && 'ok' in parsedLogoSize) {
    return NextResponse.json({ error: parsedLogoSize.error, code: 'invalid_logo_size' }, { status: 400 })
  }

  const parsedVisuals = parseDesignedVisualInputs(body.visualInputs)
  if (!parsedVisuals.ok) {
    return NextResponse.json(
      { error: parsedVisuals.error, code: parsedVisuals.code },
      { status: 400 },
    )
  }

  const db = await createServiceClient()
  const { data: userData } = await db
    .from('users')
    .select('business_id')
    .eq('id', user.id)
    .single()

  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'No business linked to user' }, { status: 400 })
  }

  const paid = await assertSocialAccess(businessId, user.id)
  if (!paid.ok) return paid.response

  const generationId = parseDesignedGenerationId(body.generationId)

  let resolvedVisuals: DesignedResolvedVisual[] = []
  if (parsedVisuals.inputs.length) {
    const resolved = await resolveDesignedVisualInputs(db, businessId, parsedVisuals.inputs)
    if (!resolved.ok) {
      return NextResponse.json(
        { error: resolved.error, code: resolved.code },
        { status: resolved.code === 'visual_forbidden' ? 403 : 400 },
      )
    }
    resolvedVisuals = resolved.visuals
  }

  const access = await evaluateUsageAccess(db, businessId)
  if (!access.allowed) {
    const denied = paymentRequiredPayload(access)
    return NextResponse.json(denied.body, { status: denied.status })
  }

  let consumeMode: 'paid' | 'free_trial' = access.accounting === 'legacy' && access.useFreeTrial
    ? 'free_trial'
    : 'paid'
  let ledgerEventId: string | null = null
  try {
    const consumed = await consumeRenderUsage(db, {
      businessId,
      generationId,
      sourceType: 'ai_designed',
      sourceId: generationId,
      useFreeTrial: access.accounting === 'legacy' ? access.useFreeTrial : false,
    })
    consumeMode = consumed.chargeSource === 'free_trial' ? 'free_trial' : 'paid'
    ledgerEventId = consumed.ledgerEventId
  } catch (err) {
    if (err instanceof InsufficientUsageError) {
      return NextResponse.json(insufficientUsageBody(err), { status: 402 })
    }
    const message = err instanceof Error ? err.message : 'Failed to use render credit'
    return NextResponse.json(
      { error: message, code: message.includes('credits') ? 'no_render_credits' : 'charge_failed' },
      { status: message.includes('credits') ? 402 : 500 },
    )
  }

  logDesignedAnalytics('ai_designed_requested', {
    hadUserBrief: Boolean(parsedInput.userBrief),
    intentChip: parsedInput.intentChip ?? null,
  })

  const imageQuality = await resolveSocialImageQualityForBusiness(db, businessId)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`))
      }
      send({
        type: 'started',
        generationId,
        creditsCharged: AI_DESIGNED_SET_CREDIT_COST,
      })
      try {
        const result = await runDesignedVariants(db, {
          businessId,
          userBrief: parsedInput.userBrief,
          intentChip: parsedInput.intentChip,
          jobId,
          showLogo: body.showLogo !== false,
          imageQuality,
          logoPosition: parsedLogoPosition,
          logoSize: parsedLogoSize,
          resolvedVisuals,
          logoAssetId:
            body.logoAssetId === null
              ? null
              : typeof body.logoAssetId === 'string'
                ? body.logoAssetId
                : undefined,
          onSlot: async (event) => {
            if (event.type === 'variant') {
              send({ type: 'variant', index: event.index, variant: event.variant })
            } else {
              send({
                type: 'variant_failed',
                index: event.index,
                error: event.error,
                messageAngle: event.messageAngle,
              })
            }
          },
        })

        if (!result.ok) {
          const refund = await refundRenderUsage(db, {
            businessId,
            generationId,
            consumedMode: consumeMode,
          })
          send({
            type: 'error',
            code: result.code,
            error: result.error,
            creditRefunded: refund.refunded,
          })
          return
        }

        if (shouldRefundDesignedGeneration(result.variants.length)) {
          const refund = await refundRenderUsage(db, {
            businessId,
            generationId,
            consumedMode: consumeMode,
          })
          send({
            type: 'error',
            error: 'All three versions failed.',
            creditRefunded: refund.refunded,
          })
          return
        }

        const cogs = result.variants.reduce(
          (sum, v) => sum + (typeof v.estimatedUsd === 'number' ? v.estimatedUsd : 0),
          0,
        )
        const latency = result.variants.reduce(
          (max, v) => Math.max(max, typeof v.latencyMs === 'number' ? v.latencyMs : 0),
          0,
        )
        await recordUsageGenerationMetrics(db, {
          ledgerEventId,
          model: result.variants[0]?.imageModel ?? null,
          cogsUsdEstimated: cogs > 0 ? cogs : null,
          latencyMs: latency > 0 ? latency : null,
        })
        send({
          type: 'done',
          succeeded: result.variants.length,
          failed: result.failedIndexes.length,
          creditsCharged: AI_DESIGNED_SET_CREDIT_COST,
        })
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err)
        console.error('[AiDesigned] stream uncaught', { businessId, detail })
        const refund = await refundRenderUsage(db, {
          businessId,
          generationId,
          consumedMode: consumeMode,
        })
        send({
          type: 'error',
          error: 'Variant generation failed. Please try again.',
          creditRefunded: refund.refunded,
        })
      } finally {
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
