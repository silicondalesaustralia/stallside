import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { convertToWebP, isSharpAvailable } from '@/lib/imageProcessor'
import { buildPhotoCleanupPrompt } from '@/lib/social/photoCleanupPrompt'
import {
  DEFAULT_OPENAI_EDIT_IMAGE_MODEL,
} from '@/lib/renders/beforeAfterPrompt'
import {
  consumeRenderUsage,
  evaluateUsageAccess,
  insufficientUsageBody,
  InsufficientUsageError,
  paymentRequiredPayload,
  refundRenderUsage,
} from '@/lib/billing/usageAccounting'
import { isUsageWalletEnabled } from '@/lib/billing/usageWalletEnabled'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { resolveSocialImageQualityForBusiness } from '@/lib/tradiespost/imageQuality'
import { isHttpsPhotoUrl } from '@/lib/social/resolveComposePhoto'

export const runtime = 'nodejs'
export const maxDuration = 60

const SHARP_UNAVAILABLE_MSG = 'Image processing unavailable, please try again'
const NO_CREDITS_MSG =
  'No render credits remaining. Buy a credit pack to continue, or your free trial has already been used.'

function extensionForContentType(contentType: string): string {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('gif')) return 'gif'
  return 'jpg'
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 503 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase.from('users') as any)
    .select('business_id')
    .eq('id', user.id)
    .single()

  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const paid = await assertSocialAccess(businessId, user.id)
  if (!paid.ok) return paid.response

  let body: { photoUrl?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const photoUrl = body.photoUrl?.trim()
  if (!photoUrl || !isHttpsPhotoUrl(photoUrl)) {
    return NextResponse.json({ error: 'photoUrl must be a valid HTTPS URL' }, { status: 400 })
  }

  const db = await createServiceClient()

  const access = await evaluateUsageAccess(db, businessId)
  if (!access.allowed) {
    const denied = paymentRequiredPayload(access)
    return NextResponse.json(denied.body, { status: denied.status })
  }

  const generationId =
    typeof (body as { generationId?: unknown }).generationId === 'string' &&
    (body as { generationId: string }).generationId.trim()
      ? (body as { generationId: string }).generationId.trim()
      : randomUUID()
  let consumeMode: 'paid' | 'free_trial' = access.accounting === 'legacy' && access.useFreeTrial
    ? 'free_trial'
    : 'paid'

  const prompt = buildPhotoCleanupPrompt()
  const model =
    process.env.OPENAI_EDIT_IMAGE_MODEL?.trim() || DEFAULT_OPENAI_EDIT_IMAGE_MODEL

  console.log('[PhotoCleanup]', {
    businessId,
    model,
    useFreeTrial: consumeMode === 'free_trial',
    promptLength: prompt.length,
  })

  const walletMode = isUsageWalletEnabled()
  try {
    if (walletMode) {
      const consumed = await consumeRenderUsage(db, {
        businessId,
        generationId,
        sourceType: 'photo_cleanup',
        sourceId: generationId,
        useFreeTrial: consumeMode === 'free_trial',
      })
      consumeMode = consumed.chargeSource === 'free_trial' ? 'free_trial' : 'paid'
    }

    if (!(await isSharpAvailable())) {
      throw new Error(SHARP_UNAVAILABLE_MSG)
    }

    const imageRes = await fetch(photoUrl)
    if (!imageRes.ok) {
      throw new Error(`Could not download photo (${imageRes.status})`)
    }

    const originalBuffer = Buffer.from(await imageRes.arrayBuffer())
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg'
    const ext = extensionForContentType(contentType)

    const { default: OpenAI, toFile } = await import('openai')
    const client = new OpenAI({ apiKey })
    const imageFile = await toFile(originalBuffer, `photo.${ext}`, { type: contentType })

    const imageQuality = await resolveSocialImageQualityForBusiness(db, businessId)

    const response = await client.images.edit({
      model,
      image:         imageFile,
      prompt,
      size:          '1024x1024',
      quality:       imageQuality,
      output_format: 'webp',
    })

    const b64 = response.data?.[0]?.b64_json
    if (!b64) {
      throw new Error('OpenAI returned no image data')
    }

    const rawBuffer = Buffer.from(b64, 'base64')
    const webpBuffer = await convertToWebP(rawBuffer, 2048, 85, true)

    const path = `${businessId}/photo-cleanup/${Date.now()}.webp`
    const { error: uploadErr } = await db.storage
      .from('social-posts')
      .upload(path, webpBuffer, { contentType: 'image/webp', upsert: false })

    if (uploadErr) {
      throw new Error(uploadErr.message || 'Upload failed')
    }

    const { data: { publicUrl } } = db.storage.from('social-posts').getPublicUrl(path)

    if (!walletMode) {
      await consumeRenderUsage(db, {
        businessId,
        generationId,
        sourceType: 'photo_cleanup',
        sourceId: generationId,
        useFreeTrial: consumeMode === 'free_trial',
        legacyNullRenderId: true,
      })
    }

    console.log('[PhotoCleanup] Completed', {
      businessId,
      cleanedUrl: publicUrl,
      usedFreeTrial: consumeMode === 'free_trial',
    })

    return NextResponse.json({
      cleanedUrl: publicUrl,
      usedFreeTrial: consumeMode === 'free_trial',
    })
  } catch (err) {
    if (err instanceof InsufficientUsageError) {
      return NextResponse.json(insufficientUsageBody(err), { status: 402 })
    }
    if (walletMode) {
      await refundRenderUsage(db, {
        businessId,
        generationId,
        consumedMode: consumeMode,
      })
    }
    const message = err instanceof Error ? err.message : String(err)
    console.error('[PhotoCleanup] Failed', { businessId, message })
    const status = message === SHARP_UNAVAILABLE_MSG ? 503 : 502
    return NextResponse.json({ error: message || 'Photo enhancement failed' }, { status })
  }
}
