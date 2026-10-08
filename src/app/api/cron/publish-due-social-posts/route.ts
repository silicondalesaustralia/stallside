import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { publishDueAutomaticSocialPosts } from '@/lib/social/publishDueSocialPosts'

// Publishes scheduled posts whose time has passed (StitchedUp runs this inside
// its hourly payment-expiry cron; the kit gives it its own route).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await createServiceClient()
    const result = await publishDueAutomaticSocialPosts(db, new Date())
    console.log('[Cron publish-due-social-posts]', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[Cron publish-due-social-posts] Failed', err)
    return NextResponse.json({ error: 'Publish failed' }, { status: 500 })
  }
}
