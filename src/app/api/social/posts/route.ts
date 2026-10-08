import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveEffectiveBusinessId } from '@/lib/utils/impersonation'
import { parsePublishingMode } from '@/lib/social/socialPostTypes'
import {
  parseSchedulePlatforms,
  resolveSchedulePublishingMode,
} from '@/lib/social/socialPostScheduleValidation'
import { socialConnectionsFromBusiness, sanitizePlatformCaptions } from '@/lib/social/libraryPublish'
import { composerPostColumns } from '@/lib/social/composerPostFields'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await createServiceClient()
  const { data: userData } = await db.from('users').select('business_id').eq('id', user.id).single()
  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) return NextResponse.json({ error: 'No business' }, { status: 400 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')

  let query = db
    .from('social_posts')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ posts: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await createServiceClient()
  const { data: userData } = await db.from('users').select('business_id').eq('id', user.id).single()
  const businessId = await resolveEffectiveBusinessId(userData?.business_id)
  if (!businessId) return NextResponse.json({ error: 'No business' }, { status: 400 })

  const body = await req.json()
  const {
    jobId, caption, platforms, photoUrls,
    processedPhotoUrls, scheduledFor, status,
    jobSuburb, jobState, tradeType, aiGenerated,
    overlayStyleOverride, postedManually, postedAt,
    composeCategory, composeSubtype, publishingMode, weekPlanItemId,
    platformCaptions,
  } = body

  const insertPayload: Record<string, unknown> = {
    business_id: businessId,
    job_id: jobId || null,
    caption,
    platforms: platforms || ['instagram'],
    photo_urls: photoUrls || [],
    processed_photo_urls: processedPhotoUrls || null,
    scheduled_for: scheduledFor || null,
    status: status || 'draft',
    publishing_mode: 'automatic',
    job_suburb: jobSuburb || null,
    job_state: jobState || null,
    trade_type: tradeType || null,
    ai_generated: aiGenerated !== false,
  }

  const composerFields = composerPostColumns(body)
  if (!composerFields.ok) {
    return NextResponse.json({ error: composerFields.message }, { status: 400 })
  }
  Object.assign(insertPayload, composerFields.columns)

  const sanitizedPlatformCaptions = sanitizePlatformCaptions(platformCaptions)
  if (sanitizedPlatformCaptions) {
    insertPayload.platform_captions = sanitizedPlatformCaptions
  }

  if (typeof weekPlanItemId === 'string' && weekPlanItemId.trim()) {
    insertPayload.week_plan_item_id = weekPlanItemId.trim()
  }

  if (status === 'scheduled') {
    const schedulePlatforms = parseSchedulePlatforms(platforms)
    const mode = parsePublishingMode(publishingMode) ?? 'automatic'
    const { data: businessRow } = await db
      .from('businesses')
      .select('facebook_page_id, instagram_account_id, gmb_account_id, tiktok_open_id')
      .eq('id', businessId)
      .maybeSingle()
    const connected = socialConnectionsFromBusiness(businessRow)
    const modeResult = resolveSchedulePublishingMode(mode, schedulePlatforms, connected)
    if (!modeResult.ok) {
      return NextResponse.json({ error: modeResult.message }, { status: 400 })
    }
    insertPayload.publishing_mode = modeResult.mode
    insertPayload.platforms = schedulePlatforms
  }

  if (overlayStyleOverride) {
    insertPayload.overlay_style_override = overlayStyleOverride
  }

  if (postedManually === true) {
    insertPayload.posted_manually = true
  }

  if (postedAt) {
    insertPayload.posted_at = postedAt
  }

  if (typeof composeCategory === 'string' && composeCategory.trim()) {
    insertPayload.compose_category = composeCategory.trim()
  }
  if (typeof composeSubtype === 'string' && composeSubtype.trim()) {
    insertPayload.compose_subtype = composeSubtype.trim()
  }

  const { data: post, error } = await db
    .from('social_posts')
    .insert(insertPayload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ post }, { status: 201 })
}
