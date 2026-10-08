/**
 * POST /api/social/inspiration-variants
 *
 * Flag off: JSON 3 legacy previews, no credit.
 * Flag on: charge 1 credit, stream NDJSON of 3 parallel gpt-image-2 versions.
 */

import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { COMPOSE_PLATFORMS, type ComposePlatform } from '@/lib/social/composeModel'
import {
  parseInspirationComposePrefill,
  type InspirationComposePrefill,
} from '@/lib/social/inspirationTypes'
import { runInspirationVariants } from '@/lib/social/runInspirationVariants'
import {
  isOwnedInspirationTempPath,
  removeInspirationTempImageSafe,
} from '@/lib/social/inspirationTempStorage'
import { isRecreateReferenceImageEnabled } from '@/lib/social/recreateImageConfig'
import { parseRecreateMode } from '@/lib/social/recreateModes'
import { parseCampaignFocus } from '@/lib/social/normalizeCampaignFocus'
import { logRecreateAnalytics } from '@/lib/social/recreateAnalytics'
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

const GENERATION_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function parseGenerationId(raw: unknown): string {
  if (typeof raw === 'string' && GENERATION_ID_RE.test(raw.trim())) return raw.trim()
  return randomUUID()
}

export async function POST(req: NextRequest) {
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
    prefill?: unknown
    platform?: string
    storagePath?: string
    recreateMode?: unknown
    campaignFocus?: unknown
    generationId?: unknown
    showLogo?: unknown
    logoAssetId?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const prefill = parseInspirationComposePrefill(body.prefill)
  if (!prefill) {
    return NextResponse.json({ error: 'Invalid prefill payload' }, { status: 400 })
  }

  const platformRaw = (body.platform?.trim() || 'instagram') as ComposePlatform
  if (!COMPOSE_PLATFORMS.includes(platformRaw)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
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

  const storagePathRaw = body.storagePath?.trim() || null
  const referenceStoragePath =
    storagePathRaw && isOwnedInspirationTempPath(businessId, storagePathRaw)
      ? storagePathRaw
      : null
  if (storagePathRaw && !referenceStoragePath) {
    return NextResponse.json({ error: 'Invalid upload path' }, { status: 400 })
  }

  const referencePathEnabled = isRecreateReferenceImageEnabled()

  if (!referencePathEnabled) {
    return runLegacyJson({
      db,
      businessId,
      prefill,
      platform: platformRaw,
      referenceStoragePath,
    })
  }

  const recreateMode = parseRecreateMode(body.recreateMode)
  if (!recreateMode) {
    return NextResponse.json({ error: 'Choose Closest or Fresh take' }, { status: 400 })
  }

  const parsedFocus = parseCampaignFocus(body.campaignFocus)
  if (!parsedFocus.ok) {
    return NextResponse.json(
      { error: parsedFocus.error, code: 'invalid_campaign_focus' },
      { status: 400 },
    )
  }
  const campaignFocus = parsedFocus.value
  const generationId = parseGenerationId(body.generationId)

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
      sourceType: 'recreate',
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

  logRecreateAnalytics('recreate_variants_requested', {
    recreateMode,
    visualPath: 'reference_recreation',
    hadCampaignFocus: Boolean(campaignFocus),
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
        creditsCharged: 1,
        recreateMode,
      })
      try {
        const result = await runInspirationVariants(db, {
          businessId,
          prefill,
          platform: platformRaw,
          referenceStoragePath,
          recreateMode,
          campaignFocus,
          showLogo: body.showLogo !== false,
          imageQuality,
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
          if (
            result.code === 'reference_missing' ||
            result.code === 'invalid_logo' ||
            result.code === 'logo_not_found' ||
            result.code === 'invalid_campaign_focus'
          ) {
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
          } else {
            const refund = await refundRenderUsage(db, {
              businessId,
              generationId,
              consumedMode: consumeMode,
            })
            send({
              type: 'error',
              error: result.error || 'Variant generation failed',
              creditRefunded: refund.refunded,
            })
          }
          return
        }

        if (result.variants.length === 0) {
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
          creditsCharged: 1,
        })
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err)
        console.error('[InspirationVariants] stream uncaught', { businessId, detail })
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
        if (referenceStoragePath) {
          await removeInspirationTempImageSafe(db, referenceStoragePath, '[InspirationVariants]')
        }
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

async function runLegacyJson(params: {
  db: Awaited<ReturnType<typeof createServiceClient>>
  businessId: string
  prefill: InspirationComposePrefill
  platform: ComposePlatform
  referenceStoragePath: string | null
}) {
  const { db, businessId, prefill, platform, referenceStoragePath } = params
  try {
    const result = await runInspirationVariants(db, {
      businessId,
      prefill,
      platform,
      referenceStoragePath,
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Variant generation failed' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      variants: result.variants,
      creditsNote:
        'Preview variants are free. Choosing a variant and posting charges 1 render credit via the normal generate flow.',
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[InspirationVariants] legacy uncaught', { businessId, detail })
    return NextResponse.json(
      { error: 'Variant generation failed. Please try again.' },
      { status: 500 },
    )
  } finally {
    if (referenceStoragePath) {
      await removeInspirationTempImageSafe(db, referenceStoragePath, '[InspirationVariants]')
    }
  }
}
