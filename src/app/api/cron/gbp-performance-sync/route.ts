import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getGmbAccessToken } from '@/lib/social/gmbAuth'
import { fetchDailyMetrics, fetchMonthlySearchKeywords } from '@/lib/socialPlatforms'
import {
  GBP_DAILY_METRICS,
  previousMonthFirst,
  rangeWindow,
} from '@/lib/social/gbpPerformance'
import { isGbpPerformanceEnabled, isGmbConnectEnabled } from '@/lib/social/gmbConnectConfig'

export const runtime = 'nodejs'
export const maxDuration = 120

type SyncSkip = { businessId: string; reason: string }

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isGbpPerformanceEnabled()) {
    console.log('[Cron gbp-performance-sync] Skipped - GBP_PERFORMANCE_ENABLED is not true')
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'flag_off',
      timestamp: new Date().toISOString(),
    })
  }

  if (!isGmbConnectEnabled()) {
    console.log('[Cron gbp-performance-sync] Skipped - GMB_CONNECT_ENABLED is not true')
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'gmb_connect_off',
      timestamp: new Date().toISOString(),
    })
  }

  const db = await createServiceClient()
  const { data: businesses, error } = await db
    .from('businesses')
    .select('id, gmb_location_id, gmb_refresh_token')
    .not('gmb_location_id', 'is', null)
    .not('gmb_refresh_token', 'is', null)

  if (error) {
    console.error('[Cron gbp-performance-sync] Business query failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const window = rangeWindow(7)
  const today = new Date()
  const isFirstOfMonth = today.getUTCDate() === 1
  const keywordMonth = previousMonthFirst(today)
  const nowIso = new Date().toISOString()

  let synced = 0
  let keywordsSynced = 0
  const skipped: SyncSkip[] = []

  for (const business of businesses || []) {
    const businessId = business.id as string
    const locationId = String(business.gmb_location_id || '')
    if (!locationId) {
      skipped.push({ businessId, reason: 'missing_location' })
      continue
    }

    let accessToken: string | null = null
    try {
      accessToken = await getGmbAccessToken(businessId)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[Cron gbp-performance-sync] Token refresh failed', { businessId, message })
      skipped.push({ businessId, reason: 'token_refresh_failed' })
      continue
    }

    if (!accessToken) {
      skipped.push({ businessId, reason: 'no_access_token' })
      continue
    }

    const daily = await fetchDailyMetrics(
      locationId,
      accessToken,
      [...GBP_DAILY_METRICS],
      window.start,
      window.end,
    )

    if (!daily.ok) {
      if (daily.kind === 'quota') {
        console.warn('[Cron gbp-performance-sync] Quota/permission skip', {
          businessId,
          status: daily.status,
          message: daily.message,
        })
        skipped.push({ businessId, reason: 'quota_or_permission' })
        continue
      }
      console.error('[Cron gbp-performance-sync] Daily metrics failed', {
        businessId,
        status: daily.status,
        message: daily.message,
      })
      skipped.push({ businessId, reason: 'daily_error' })
      continue
    }

    if (daily.data.length > 0) {
      const upserts = daily.data.map((row) => ({
        business_id: businessId,
        gmb_location_id: locationId,
        ...row,
        updated_at: nowIso,
      }))
      const { error: upsertError } = await db
        .from('google_business_performance_daily')
        .upsert(upserts, { onConflict: 'business_id,gmb_location_id,metric_date' })
      if (upsertError) {
        console.error('[Cron gbp-performance-sync] Daily upsert failed', {
          businessId,
          error: upsertError.message,
        })
        skipped.push({ businessId, reason: 'daily_upsert_failed' })
        continue
      }
    }
    synced += 1

    const { count: existingKeywordCount } = await db
      .from('google_business_search_keywords')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('gmb_location_id', locationId)
      .eq('month', keywordMonth)

    if (!isFirstOfMonth && (existingKeywordCount ?? 0) > 0) {
      continue
    }

    const keywords = await fetchMonthlySearchKeywords(locationId, accessToken, keywordMonth)
    if (!keywords.ok) {
      if (keywords.kind === 'quota') {
        console.warn('[Cron gbp-performance-sync] Keyword quota/permission skip', {
          businessId,
          status: keywords.status,
          message: keywords.message,
        })
      } else {
        console.error('[Cron gbp-performance-sync] Keywords failed', {
          businessId,
          status: keywords.status,
          message: keywords.message,
        })
      }
      continue
    }

    if (keywords.data.length > 0) {
      const { error: keywordError } = await db
        .from('google_business_search_keywords')
        .upsert(
          keywords.data.map((row) => ({
            business_id: businessId,
            gmb_location_id: locationId,
            month: keywordMonth,
            keyword: row.keyword,
            impressions: row.impressions,
            updated_at: nowIso,
          })),
          { onConflict: 'business_id,gmb_location_id,month,keyword' },
        )
      if (keywordError) {
        console.error('[Cron gbp-performance-sync] Keyword upsert failed', {
          businessId,
          error: keywordError.message,
        })
        continue
      }
      keywordsSynced += 1
    }
  }

  console.log('[Cron gbp-performance-sync]', {
    businesses: businesses?.length ?? 0,
    synced,
    keywordsSynced,
    skipped: skipped.length,
    window,
    keywordMonth,
  })

  return NextResponse.json({
    ok: true,
    businesses: businesses?.length ?? 0,
    synced,
    keywordsSynced,
    skipped,
    window,
    keywordMonth,
    timestamp: new Date().toISOString(),
  })
}
