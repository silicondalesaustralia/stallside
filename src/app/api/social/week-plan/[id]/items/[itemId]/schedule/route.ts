import { NextRequest, NextResponse } from 'next/server'
import { requireSessionBusinessId } from '@/lib/agent/agentSuggestionAuth'
import { createServiceClient } from '@/lib/supabase/server'
import {
  SOCIAL_PUBLISH_PLATFORMS,
  socialConnectionsFromBusiness,
  type SocialPublishPlatform,
} from '@/lib/social/libraryPublish'
import { parseSchedulePlatforms } from '@/lib/social/socialPostScheduleValidation'
import { parsePublishingMode } from '@/lib/social/socialPostTypes'
import { scheduleWeekPlanItem } from '@/lib/social/weekPlan/weekPlanProduction'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireSessionBusinessId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: {
    scheduledDate?: string
    scheduledTime?: string
    platforms?: string[]
    publishingMode?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const scheduledDate = body.scheduledDate?.trim()
  if (!scheduledDate) {
    return NextResponse.json({ error: 'scheduledDate is required' }, { status: 400 })
  }

  const platforms = parseSchedulePlatforms(body.platforms)
  if (platforms.length === 0) {
    return NextResponse.json({ error: 'Select at least one platform' }, { status: 400 })
  }

  const publishingMode = parsePublishingMode(body.publishingMode)
  if (!publishingMode) {
    return NextResponse.json({ error: 'publishingMode must be automatic or manual' }, { status: 400 })
  }

  const { id: planId, itemId } = await params
  const db = await createServiceClient()

  const { data: business } = await db
    .from('businesses')
    .select('facebook_page_id, instagram_account_id, gmb_account_id')
    .eq('id', auth.businessId)
    .maybeSingle()

  const connected = socialConnectionsFromBusiness(business)

  try {
    const result = await scheduleWeekPlanItem(db, auth.businessId, planId, itemId, {
      scheduledDate,
      scheduledTime: body.scheduledTime?.trim() || '09:00',
      platforms: platforms as SocialPublishPlatform[],
      publishingMode,
      connected,
    })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Schedule failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
