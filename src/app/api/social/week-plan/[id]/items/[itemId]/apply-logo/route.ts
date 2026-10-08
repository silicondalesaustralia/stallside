import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import { applyLogoToWeekPlanVariant } from '@/lib/social/weekPlan/weekPlanVariantLogo'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: {
    variantId?: string
    logoAssetId?: unknown
    showLogo?: unknown
    logoPosition?: unknown
    logoSize?: unknown
    imageUrl?: unknown
    storagePath?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Never accept client-supplied image URLs or storage paths as authoritative.
  if (body.imageUrl != null || body.storagePath != null) {
    return NextResponse.json(
      { error: 'imageUrl and storagePath cannot be set from the client' },
      { status: 400 },
    )
  }

  const variantId = body.variantId?.trim()
  if (!variantId) {
    return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
  }

  const { id: planId, itemId } = await params
  const db = await createServiceClient()

  try {
    const item = await applyLogoToWeekPlanVariant(db, auth.businessId, planId, itemId, {
      variantId,
      logoAssetId: body.logoAssetId,
      showLogo: body.showLogo,
      logoPosition: body.logoPosition,
      logoSize: body.logoSize,
    })
    return NextResponse.json({ item, creditsCharged: 0 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Logo update failed'
    const status = message.includes('not found') ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
