import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { purgeStaleInspirationTempObjects } from '@/lib/social/inspirationTempStorage'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Hourly cron - delete abandoned inspiration-temp uploads older than 1 hour. */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await createServiceClient()
  try {
    const result = await purgeStaleInspirationTempObjects(db)
    console.log('[Cron inspiration-temp-cleanup]', result)
    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Cron inspiration-temp-cleanup] Failed', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
