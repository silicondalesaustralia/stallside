import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { applyRecreateBusinessLogo } from '@/lib/social/compositeRecreateLogo'
import { storeRecreateVisual } from '@/lib/social/storeRecreateVisual'
import {
  isOwnedSocialCreativeBasePath,
  parseRecreateLogoChoice,
  resolveRecreateLogoAsset,
  socialCreativePreviewStoragePath,
} from '@/lib/brand/businessBrandLogos'
import {
  parseRecreateLogoPosition,
  parseRecreateLogoSize,
  type RecreateLogoPosition,
  type RecreateLogoSize,
} from '@/lib/social/recreateLogoPlacement'

export const runtime = 'nodejs'

type ApplyItem = { id?: unknown; baseStoragePath?: unknown }

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from('users')
    .select('business_id')
    .eq('id', user.id)
    .maybeSingle()
  const businessId = await resolveEffectiveBusinessId(
    (userData as { business_id?: string | null } | null)?.business_id,
  )
  if (!businessId) {
    return NextResponse.json({ error: 'Business not found' }, { status: 403 })
  }

  let body: {
    items?: unknown
    logoAssetId?: unknown
    showLogo?: unknown
    logoPosition?: unknown
    logoSize?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const choice = parseRecreateLogoChoice({
    logoAssetId: body.logoAssetId,
    showLogo: body.showLogo,
  })
  if ('ok' in choice) {
    return NextResponse.json({ error: choice.error }, { status: 400 })
  }

  const parsedPosition = parseRecreateLogoPosition(body.logoPosition)
  if (typeof parsedPosition === 'object' && 'ok' in parsedPosition) {
    return NextResponse.json({ error: parsedPosition.error, code: 'invalid_logo_position' }, { status: 400 })
  }
  const logoPosition: RecreateLogoPosition = parsedPosition

  const parsedSize = parseRecreateLogoSize(body.logoSize)
  if (typeof parsedSize === 'object' && 'ok' in parsedSize) {
    return NextResponse.json({ error: parsedSize.error, code: 'invalid_logo_size' }, { status: 400 })
  }
  const logoSize: RecreateLogoSize = parsedSize

  const items = Array.isArray(body.items) ? (body.items as ApplyItem[]) : []
  if (items.length === 0 || items.length > 3) {
    return NextResponse.json({ error: 'Provide 1-3 variant items' }, { status: 400 })
  }

  const db = await createServiceClient()
  const { data: biz } = await db
    .from('businesses')
    .select('logo_url')
    .eq('id', businessId)
    .maybeSingle()

  let resolved
  try {
    resolved = await resolveRecreateLogoAsset(
      db,
      businessId,
      choice,
      (biz as { logo_url?: string | null } | null)?.logo_url,
    )
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String((err as { code?: string }).code) : ''
    if (code === 'logo_not_found') {
      return NextResponse.json({ error: 'Logo not found', code: 'logo_not_found' }, { status: 400 })
    }
    throw err
  }

  const results: Array<{
    id: string
    imageUrl: string
    logoAssetId: string | null
    logoVariantType: string | null
    logoDisabled: boolean
    logoPosition: RecreateLogoPosition
    logoSize: RecreateLogoSize
  }> = []

  for (const item of items) {
    const id = typeof item.id === 'string' ? item.id.trim() : ''
    const basePath = typeof item.baseStoragePath === 'string' ? item.baseStoragePath.trim() : ''
    // Never re-composite from a branded preview - only owned *-base.webp under known prefixes.
    if (!id || !isOwnedSocialCreativeBasePath(businessId, basePath)) {
      return NextResponse.json({ error: 'Invalid base image path' }, { status: 400 })
    }
    const downloaded = await db.storage.from('social-posts').download(basePath)
    if (downloaded.error || !downloaded.data) {
      return NextResponse.json({ error: 'Base image is no longer available' }, { status: 404 })
    }
    const baseBuffer = Buffer.from(await downloaded.data.arrayBuffer())
    const logoApplied = await applyRecreateBusinessLogo({
      imageBuffer: baseBuffer,
      logoUrl: resolved.fetchUrl,
      showLogo: resolved.applyRealLogo,
      logoPosition,
      logoSize,
      resolveLogoUrl: async (url) => url,
    })
    const stored = await storeRecreateVisual(db, {
      businessId,
      renderId: id,
      buffer: logoApplied.buffer,
      storagePath: socialCreativePreviewStoragePath(businessId, id, basePath),
    })
    results.push({
      id,
      imageUrl: `${stored.imageUrl}?t=${Date.now()}`,
      logoAssetId: resolved.asset?.id ?? null,
      logoVariantType: resolved.asset?.variant_type ?? null,
      logoDisabled: !resolved.applyRealLogo,
      logoPosition,
      logoSize,
    })
  }

  return NextResponse.json({
    ok: true,
    results,
    creditsCharged: 0,
  })
}
