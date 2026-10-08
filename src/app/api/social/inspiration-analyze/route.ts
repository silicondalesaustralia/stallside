/**
 * POST /api/social/inspiration-analyze
 * Structural classification of an inspiration image.
 * When RECREATE_REFERENCE_IMAGE_ENABLED=true, the temp screenshot is kept
 * until POST /api/social/inspiration-variants finishes (then deleted).
 *
 * Body JSON:
 * - storagePath: screenshot already PUT to inspiration-temp via signed URL
 * - url: try og:image fetch; on failure returns { needsScreenshot: true }
 * - imageBase64 + mimeType: legacy (scripts only - do not send large files this way)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { assertSocialAccess } from '@/lib/billing/requirePaidBusinessAccess'
import { analyzeInspirationImage } from '@/lib/social/analyzeInspirationImage'
import {
  fetchImageBufferForAnalysis,
  fetchOgImageFromUrl,
  isSafePublicHttpUrl,
  parseDataUrlImage,
} from '@/lib/social/fetchOgImage'
import { INSPIRATION_NO_MATCH_MESSAGE } from '@/lib/social/inspirationTypes'
import {
  META_SOCIAL_PREVIEW_MESSAGE,
  isMetaSocialPostUrl,
} from '@/lib/social/metaSocialUrls'
import {
  INSPIRATION_MAX_BYTES,
  downloadInspirationTempImage,
  isOwnedInspirationTempPath,
  removeInspirationTempImageSafe,
  uploadInspirationTempImage,
} from '@/lib/social/inspirationTempStorage'
import {
  isRecreateReferenceImageEnabled,
  shouldRetainInspirationTemp,
} from '@/lib/social/recreateImageConfig'
import { buildCreativeDirection } from '@/lib/social/creativeDirection'
import { logRecreateAnalytics } from '@/lib/social/recreateAnalytics'

export const runtime = 'nodejs'
export const maxDuration = 45
// Isolate kill at maxDuration skips `finally`; abandoned/timeout leftovers
// are removed by /api/cron/inspiration-temp-cleanup (1 hour TTL).

const MAX_BASE64_CHARS = 6 * 1024 * 1024

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    url?: string
    imageBase64?: string
    mimeType?: string
    storagePath?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const url = body.url?.trim()
  const imageBase64Raw = body.imageBase64?.trim()
  const mimeTypeRaw = body.mimeType?.trim() || 'image/jpeg'
  const storagePathRaw = body.storagePath?.trim()

  let imageBase64: string | null = null
  let mimeType = mimeTypeRaw
  let tempStoragePath: string | null = null
  let retainTempAfterAnalyze = false
  const db = await createServiceClient()
  const referencePathEnabled = isRecreateReferenceImageEnabled()

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

  try {
    if (storagePathRaw) {
      if (!isOwnedInspirationTempPath(businessId, storagePathRaw)) {
        return NextResponse.json({ error: 'Invalid upload path' }, { status: 400 })
      }
      tempStoragePath = storagePathRaw
    }

    if (!process.env.OPENAI_API_KEY?.trim()) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 503 },
      )
    }

    if (storagePathRaw || imageBase64Raw) {
      logRecreateAnalytics('inspiration_uploaded', {
        visualPath: referencePathEnabled ? 'reference_recreation' : 'legacy_template',
      })
    }

    if (storagePathRaw) {
      const downloaded = await downloadInspirationTempImage(db, storagePathRaw)
      if ('error' in downloaded) {
        return NextResponse.json({ error: downloaded.error }, { status: 400 })
      }
      imageBase64 = downloaded.buffer.toString('base64')
      mimeType = downloaded.mimeType
    } else if (imageBase64Raw) {
      if (imageBase64Raw.length > MAX_BASE64_CHARS) {
        return NextResponse.json({ error: 'Image too large (max 4 MB)' }, { status: 400 })
      }
      const parsed = parseDataUrlImage(
        imageBase64Raw.startsWith('data:')
          ? imageBase64Raw
          : `data:${mimeTypeRaw};base64,${imageBase64Raw}`,
      )
      if (!parsed) {
        return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
      }
      if (parsed.buffer.length > INSPIRATION_MAX_BYTES) {
        return NextResponse.json({ error: 'Image too large (max 4 MB)' }, { status: 400 })
      }
      imageBase64 = parsed.buffer.toString('base64')
      mimeType = parsed.mimeType
      if (referencePathEnabled && !tempStoragePath) {
        const uploaded = await uploadInspirationTempImage(
          db,
          businessId,
          parsed.buffer,
          mimeType,
        )
        if ('path' in uploaded) tempStoragePath = uploaded.path
      }
    } else if (url) {
      if (!isSafePublicHttpUrl(url)) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }

      if (isMetaSocialPostUrl(url)) {
        return NextResponse.json({
          ok: false,
          needsScreenshot: true,
          message: META_SOCIAL_PREVIEW_MESSAGE,
        })
      }

      const og = await fetchOgImageFromUrl(url)
      if (!og.ok) {
        return NextResponse.json({
          ok: false,
          needsScreenshot: true,
          message:
            'Could not load a preview from that link - upload a screenshot of the post instead.',
        })
      }

      const downloaded = await fetchImageBufferForAnalysis(og.imageUrl)
      if (!downloaded) {
        return NextResponse.json({
          ok: false,
          needsScreenshot: true,
          message:
            'Could not load a preview from that link - upload a screenshot of the post instead.',
        })
      }

      imageBase64 = downloaded.buffer.toString('base64')
      mimeType = downloaded.mimeType
      if (referencePathEnabled && !tempStoragePath) {
        const uploaded = await uploadInspirationTempImage(
          db,
          businessId,
          downloaded.buffer,
          mimeType,
        )
        if ('path' in uploaded) tempStoragePath = uploaded.path
      }
    } else {
      return NextResponse.json(
        { error: 'Provide a url or uploaded screenshot' },
        { status: 400 },
      )
    }

    const result = await analyzeInspirationImage({ imageBase64, mimeType })

    if (!result.ok) {
      return NextResponse.json({
        ok: false,
        message: result.message || INSPIRATION_NO_MATCH_MESSAGE,
      })
    }

    console.log('[Inspiration] classified', {
      userId: user.id,
      format: result.prefill.format,
      preset: result.prefill.infographicPreset,
      visualStyle: result.prefill.hints.visualStyle,
      theme: result.prefill.hints.theme.themeSummary,
      blocks: result.prefill.hints.contentBlockCount,
    })

    retainTempAfterAnalyze = shouldRetainInspirationTemp({
      analysisOk: true,
      referencePathEnabled,
      hasTempPath: Boolean(tempStoragePath),
    })

    logRecreateAnalytics('inspiration_analyzed', {
      visualPath: retainTempAfterAnalyze ? 'reference_recreation' : 'legacy_template',
    })

    return NextResponse.json({
      ok: true,
      prefill: result.prefill,
      storagePath: retainTempAfterAnalyze ? tempStoragePath : undefined,
      referenceRecreateEnabled: referencePathEnabled,
      creativeDirection: buildCreativeDirection(result.prefill.hints),
    })
  } catch (err) {
    console.error('[Inspiration] analysis failed', err)
    return NextResponse.json(
      {
        error: 'Analysis failed',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    )
  } finally {
    if (tempStoragePath && !retainTempAfterAnalyze) {
      await removeInspirationTempImageSafe(db, tempStoragePath)
    }
  }
}
