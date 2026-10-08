// ============================================================
// lib/socialPlatforms.ts
// Platform integrations: Meta (Facebook + Instagram) and GMB.
// In SOCIAL_DEMO_MODE, simulates successful posts without
// real API credentials.
// ============================================================

import { getGmbAccessToken } from '@/lib/social/gmbAuth'
import {
  GBP_DAILY_METRICS,
  gbpLocationResourceName,
  isGbpQuotaOrPermissionError,
  parseGoogleDate,
  parseInsightsImpressions,
  type GbpDailyMetric,
  type GbpDailyRow,
  type GbpGoogleResult,
  type GbpKeywordRow,
  mergeMetricSeries,
} from '@/lib/social/gbpPerformance'
import { postToFacebook, postToInstagram } from '@/lib/social/metaPublish'
import {
  publishTikTokForPost,
  type TikTokPostSource,
} from '@/lib/social/tiktok/publishTikTokForPost'
import type { TikTokPublishResult } from '@/lib/social/tiktok/tiktokPublish'

const DEMO = process.env.SOCIAL_DEMO_MODE === 'true'

// ── Meta (Facebook + Instagram) ───────────────────────────────────────────────

export type { MetaPage } from '@/lib/social/metaOAuth'
export {
  getMetaOAuthUrl,
  exchangeMetaCode,
  getMetaPages,
  metaOAuthRedirectUri,
} from '@/lib/social/metaOAuth'
export { postToFacebook, postToInstagram } from '@/lib/social/metaPublish'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GmbAccount {
  name: string
  accountName: string
}

export interface GmbLocation {
  name: string
  title: string
}

export interface PublishResult {
  success: boolean
  postId?: string
  error?: string
  demo?: boolean
}

export interface PostResults {
  facebook?: PublishResult
  instagram?: PublishResult
  gmb?: PublishResult
  linkedin?: PublishResult
  /** Async: success means TikTok accepted the publish; status resolves later. */
  tiktok?: TikTokPublishResult
}

// ── Google Business Profile ───────────────────────────────────────────────────

export async function getGmbAccounts(accessToken: string): Promise<GmbAccount[]> {
  const res = await fetch(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.accounts || []
}

export async function getGmbLocations(accountId: string, accessToken: string): Promise<GmbLocation[]> {
  const res = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=name,title`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.locations || []
}

export async function postToGmb(
  accountId: string,
  locationId: string,
  accessToken: string,
  imageUrl: string,
  caption: string,
  phone?: string
): Promise<PublishResult> {
  if (DEMO || !accessToken) {
    console.log('[Demo] Would post to GMB location:', locationId)
    return { success: true, postId: `demo-gmb-${Date.now()}`, demo: true }
  }
  try {
    const body: Record<string, unknown> = {
      languageCode: 'en',
      summary: caption,
      topicType: 'STANDARD',
      media: [{ mediaFormat: 'PHOTO', sourceUrl: imageUrl }],
    }
    if (phone) body.callToAction = { actionType: 'CALL', url: `tel:${phone}` }

    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    const json = await res.json()
    if (json.error) return { success: false, error: json.error.message }
    return { success: true, postId: json.name }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

const GBP_PERFORMANCE_BASE = 'https://businessprofileperformance.googleapis.com/v1'

function gbpPerformanceError(
  status: number,
  json: unknown,
  fallback: string,
): GbpGoogleResult<never> {
  const message =
    (json && typeof json === 'object' && 'error' in json
      ? (json as { error?: { message?: string } }).error?.message
      : null) || fallback
  const kind = isGbpQuotaOrPermissionError(status, json) ? 'quota' : 'error'
  if (kind === 'quota') {
    console.warn('[GBP Performance] Quota or permission denied (expected pre-approval)', {
      status,
      message,
    })
  } else {
    console.error('[GBP Performance] Google API error', { status, message })
  }
  return { ok: false, kind, status, message }
}

function dateQuery(prefix: string, date: { year: number; month: number; day: number }): string {
  return (
    `${prefix}.year=${date.year}` +
    `&${prefix}.month=${date.month}` +
    `&${prefix}.day=${date.day}`
  )
}

function parseYmd(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split('-').map(Number)
  return { year, month, day }
}

/**
 * GET locations/{id}:fetchMultiDailyMetricsTimeSeries
 * Scope: business.manage (existing GMB OAuth - no new scope).
 */
export async function fetchDailyMetrics(
  locationId: string,
  accessToken: string,
  metrics: GbpDailyMetric[],
  startDate: string,
  endDate: string,
): Promise<GbpGoogleResult<GbpDailyRow[]>> {
  const location = gbpLocationResourceName(locationId)
  const metricParams = (metrics.length ? metrics : [...GBP_DAILY_METRICS])
    .map((m) => `dailyMetrics=${encodeURIComponent(m)}`)
    .join('&')
  const url =
    `${GBP_PERFORMANCE_BASE}/${location}:fetchMultiDailyMetricsTimeSeries` +
    `?${metricParams}` +
    `&${dateQuery('dailyRange.start_date', parseYmd(startDate))}` +
    `&${dateQuery('dailyRange.end_date', parseYmd(endDate))}`

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    return gbpPerformanceError(res.status, json, 'Failed to fetch daily metrics')
  }

  const points: Array<{ metric: GbpDailyMetric; date: string; value: number }> = []
  const multi = (json.multiDailyMetricTimeSeries || []) as Array<{
    dailyMetricTimeSeries?: Array<{
      dailyMetric?: GbpDailyMetric
      timeSeries?: { datedValues?: Array<{ date?: { year?: number; month?: number; day?: number }; value?: string }> }
    }>
  }>
  for (const block of multi) {
    for (const series of block.dailyMetricTimeSeries || []) {
      const metric = series.dailyMetric
      if (!metric || !GBP_DAILY_METRICS.includes(metric)) continue
      for (const point of series.timeSeries?.datedValues || []) {
        const date = parseGoogleDate(point.date)
        if (!date) continue
        const value = parseInt(String(point.value ?? '0'), 10)
        points.push({ metric, date, value: Number.isFinite(value) ? value : 0 })
      }
    }
  }
  return { ok: true, data: mergeMetricSeries(points) }
}

/**
 * GET locations/{id}:getDailyMetricsTimeSeries - single metric.
 * Prefer fetchDailyMetrics (multi) for the dashboard sync.
 */
export async function fetchSingleDailyMetric(
  locationId: string,
  accessToken: string,
  metric: GbpDailyMetric,
  startDate: string,
  endDate: string,
): Promise<GbpGoogleResult<GbpDailyRow[]>> {
  const location = gbpLocationResourceName(locationId)
  const url =
    `${GBP_PERFORMANCE_BASE}/${location}:getDailyMetricsTimeSeries` +
    `?dailyMetric=${encodeURIComponent(metric)}` +
    `&${dateQuery('dailyRange.start_date', parseYmd(startDate))}` +
    `&${dateQuery('dailyRange.end_date', parseYmd(endDate))}`

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    return gbpPerformanceError(res.status, json, 'Failed to fetch daily metric')
  }

  const points: Array<{ metric: GbpDailyMetric; date: string; value: number }> = []
  const datedValues = (json.timeSeries?.datedValues || []) as Array<{
    date?: { year?: number; month?: number; day?: number }
    value?: string
  }>
  for (const point of datedValues) {
    const date = parseGoogleDate(point.date)
    if (!date) continue
    const value = parseInt(String(point.value ?? '0'), 10)
    points.push({ metric, date, value: Number.isFinite(value) ? value : 0 })
  }
  return { ok: true, data: mergeMetricSeries(points) }
}

/**
 * GET locations/{id}/searchkeywords/impressions/monthly
 * Scope: business.manage (existing GMB OAuth - no new scope).
 */
export async function fetchMonthlySearchKeywords(
  locationId: string,
  accessToken: string,
  month: string,
): Promise<GbpGoogleResult<GbpKeywordRow[]>> {
  const location = gbpLocationResourceName(locationId)
  const { year, month: monthNum } = parseYmd(month)
  const keywords: GbpKeywordRow[] = []
  let pageToken = ''

  for (let page = 0; page < 5; page++) {
    const params = new URLSearchParams({
      'monthlyRange.start_month.year': String(year),
      'monthlyRange.start_month.month': String(monthNum),
      'monthlyRange.end_month.year': String(year),
      'monthlyRange.end_month.month': String(monthNum),
      pageSize: '100',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const url = `${GBP_PERFORMANCE_BASE}/${location}/searchkeywords/impressions/monthly?${params}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      return gbpPerformanceError(res.status, json, 'Failed to fetch search keywords')
    }

    const rows = (json.searchKeywordsCounts || json.search_keywords_counts || []) as Array<{
      searchKeyword?: string
      search_keyword?: string
      insightsValue?: { value?: string | number; threshold?: string | number }
      insights_value?: { value?: string | number; threshold?: string | number }
    }>
    for (const row of rows) {
      const parsed = parseInsightsImpressions(row)
      if (parsed) keywords.push(parsed)
    }

    pageToken = json.nextPageToken || json.next_page_token || ''
    if (!pageToken) break
  }

  keywords.sort((a, b) => b.impressions - a.impressions)
  return { ok: true, data: keywords }
}

// ── Publish to all platforms ───────────────────────────────────────────────────

export async function publishPost(options: {
  platforms: string[]
  caption: string
  /** Per-platform overrides from social_posts.platform_captions; falls back to caption. */
  platformCaptions?: Record<string, unknown> | null
  processedPhotoUrls: Record<string, string[]>
  businessId: string
  business: {
    facebook_page_id?: string | null
    facebook_access_token?: string | null
    instagram_account_id?: string | null
    gmb_account_id?: string | null
    gmb_location_id?: string | null
    gmb_access_token?: string | null
    phone?: string | null
  }
  /** Required when platforms include 'tiktok'. */
  tiktokPost?: Omit<TikTokPostSource, 'businessId' | 'caption' | 'processedPhotoUrls'>
}): Promise<PostResults> {
  const { platforms, caption, platformCaptions, processedPhotoUrls, businessId, business } = options
  const results: PostResults = {}

  if (platforms.includes('tiktok')) {
    const tiktokOverride = platformCaptions?.tiktok
    results.tiktok = options.tiktokPost
      ? await publishTikTokForPost({
          ...options.tiktokPost,
          businessId,
          caption: typeof tiktokOverride === 'string' && tiktokOverride.trim() ? tiktokOverride : caption,
          processedPhotoUrls,
        })
      : { success: false, error: 'TikTok post details missing' }
  }

  if (platforms.includes('facebook')) {
    const fbUrls = processedPhotoUrls['facebook'] || processedPhotoUrls['instagram_square'] || []
    const fbOverride = platformCaptions?.facebook
    const fbCaption = typeof fbOverride === 'string' && fbOverride.trim() ? fbOverride : caption
    results.facebook = await postToFacebook(
      business.facebook_page_id || 'demo-page',
      business.facebook_access_token || '',
      fbUrls[0] || '',
      fbCaption
    )
  }

  if (platforms.includes('instagram')) {
    const igUrls = processedPhotoUrls['instagram_square'] || []
    results.instagram = await postToInstagram(
      business.instagram_account_id || 'demo-ig',
      business.facebook_access_token || '',
      igUrls[0] || '',
      caption,
      businessId,
    )
  }

  if (platforms.includes('gmb')) {
    const gmbUrls = processedPhotoUrls['gmb'] || processedPhotoUrls['instagram_square'] || []
    let gmbAccessToken = business.gmb_access_token || ''
    if (business.gmb_account_id) {
      try {
        const refreshed = await getGmbAccessToken(businessId)
        if (refreshed) gmbAccessToken = refreshed
      } catch (err) {
        console.error('[GMB] Access token refresh before publish failed:', err)
        results.gmb = {
          success: false,
          error:   err instanceof Error ? err.message : 'Failed to refresh Google Business token',
        }
      }
    }
    if (!results.gmb) {
      results.gmb = await postToGmb(
        business.gmb_account_id || 'demo-account',
        business.gmb_location_id || 'demo-location',
        gmbAccessToken,
        gmbUrls[0] || '',
        caption,
        business.phone || undefined
      )
    }
  }

  return results
}
