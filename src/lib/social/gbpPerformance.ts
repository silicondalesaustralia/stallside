export const GBP_DAILY_METRICS = [
  'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
  'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
  'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
  'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
  'WEBSITE_CLICKS',
  'CALL_CLICKS',
  'BUSINESS_DIRECTION_REQUESTS',
  'BUSINESS_CONVERSATIONS',
  'BUSINESS_BOOKINGS',
  'BUSINESS_FOOD_ORDERS',
  'BUSINESS_FOOD_MENU_CLICKS',
] as const

export type GbpDailyMetric = (typeof GBP_DAILY_METRICS)[number]
export type GbpRange = 7 | 30 | 90

export interface GbpDailyRow {
  metric_date: string
  business_impressions_desktop_maps: number
  business_impressions_mobile_maps: number
  business_impressions_desktop_search: number
  business_impressions_mobile_search: number
  website_clicks: number
  call_clicks: number
  business_direction_requests: number
  business_conversations: number
  business_bookings: number
  business_food_orders: number
  business_food_menu_clicks: number
}

export interface GbpKeywordRow {
  keyword: string
  impressions: number
}

export interface GbpMetricCard {
  key: 'profileViews' | 'websiteClicks' | 'phoneCalls' | 'directions' | 'searchImpressions'
  label: string
  value: number
  previousValue: number
  changePercent: number | null
}

export interface GbpSummaryResponse {
  range: GbpRange
  demo: boolean
  cards: GbpMetricCard[]
  searchVsMaps: { search: number; maps: number }
}

export interface GbpTimeseriesPoint {
  date: string
  profileViews: number
  websiteClicks: number
  phoneCalls: number
  directions: number
}

export interface GbpTimeseriesResponse {
  range: GbpRange
  demo: boolean
  series: GbpTimeseriesPoint[]
}

export interface GbpKeywordsResponse {
  month: string
  demo: boolean
  keywords: GbpKeywordRow[]
}

export type GbpGoogleResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: 'quota' | 'error'; status: number; message: string }

const METRIC_TO_COLUMN: Record<GbpDailyMetric, keyof Omit<GbpDailyRow, 'metric_date'>> = {
  BUSINESS_IMPRESSIONS_DESKTOP_MAPS: 'business_impressions_desktop_maps',
  BUSINESS_IMPRESSIONS_MOBILE_MAPS: 'business_impressions_mobile_maps',
  BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: 'business_impressions_desktop_search',
  BUSINESS_IMPRESSIONS_MOBILE_SEARCH: 'business_impressions_mobile_search',
  WEBSITE_CLICKS: 'website_clicks',
  CALL_CLICKS: 'call_clicks',
  BUSINESS_DIRECTION_REQUESTS: 'business_direction_requests',
  BUSINESS_CONVERSATIONS: 'business_conversations',
  BUSINESS_BOOKINGS: 'business_bookings',
  BUSINESS_FOOD_ORDERS: 'business_food_orders',
  BUSINESS_FOOD_MENU_CLICKS: 'business_food_menu_clicks',
}

export function parseGbpRange(raw: string | null): GbpRange {
  if (raw === '30') return 30
  if (raw === '90') return 90
  return 7
}

export function formatDateKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export function addUtcDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return formatDateKey(dt)
}

/** Inclusive window ending yesterday (UTC). Google's "today" is usually incomplete. */
export function rangeWindow(range: GbpRange, today = new Date()): { start: string; end: string } {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  end.setUTCDate(end.getUTCDate() - 1)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - (range - 1))
  return { start: formatDateKey(start), end: formatDateKey(end) }
}

export function previousWindow(range: GbpRange, today = new Date()): { start: string; end: string } {
  const current = rangeWindow(range, today)
  return {
    start: addUtcDays(current.start, -range),
    end: addUtcDays(current.end, -range),
  }
}

export function firstOfMonth(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`
}

export function previousMonthFirst(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
  d.setUTCMonth(d.getUTCMonth() - 1)
  return firstOfMonth(d)
}

export function parseMonthParam(raw: string | null): string {
  if (raw && /^\d{4}-\d{2}-01$/.test(raw)) return raw
  if (raw && /^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`
  return previousMonthFirst()
}

export function gbpLocationResourceName(locationId: string): string {
  const trimmed = locationId.replace(/^\/+/, '')
  if (trimmed.startsWith('locations/')) return trimmed
  const last = trimmed.split('/').pop() || trimmed
  return `locations/${last}`
}

export function isGbpQuotaOrPermissionError(status: number, body: unknown): boolean {
  if (status === 429) return true
  const err = (body && typeof body === 'object' && 'error' in body)
    ? (body as { error?: { status?: string; message?: string; code?: number } }).error
    : null
  const googleStatus = (err?.status || '').toUpperCase()
  if (googleStatus === 'PERMISSION_DENIED' || googleStatus === 'RESOURCE_EXHAUSTED') return true
  const message = `${err?.message || ''}`.toLowerCase()
  if (status === 403) return true
  return (
    message.includes('quota') ||
    message.includes('permission') ||
    message.includes('has not been used') ||
    message.includes('is disabled') ||
    message.includes('access not granted')
  )
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export function emptyDailyRow(metricDate: string): GbpDailyRow {
  return {
    metric_date: metricDate,
    business_impressions_desktop_maps: 0,
    business_impressions_mobile_maps: 0,
    business_impressions_desktop_search: 0,
    business_impressions_mobile_search: 0,
    website_clicks: 0,
    call_clicks: 0,
    business_direction_requests: 0,
    business_conversations: 0,
    business_bookings: 0,
    business_food_orders: 0,
    business_food_menu_clicks: 0,
  }
}

export function profileViews(row: GbpDailyRow): number {
  return (
    row.business_impressions_desktop_maps +
    row.business_impressions_mobile_maps +
    row.business_impressions_desktop_search +
    row.business_impressions_mobile_search
  )
}

export function searchImpressions(row: GbpDailyRow): number {
  return row.business_impressions_desktop_search + row.business_impressions_mobile_search
}

export function mapsImpressions(row: GbpDailyRow): number {
  return row.business_impressions_desktop_maps + row.business_impressions_mobile_maps
}

export function sumRows(rows: GbpDailyRow[]) {
  return rows.reduce(
    (acc, row) => ({
      profileViews: acc.profileViews + profileViews(row),
      websiteClicks: acc.websiteClicks + row.website_clicks,
      phoneCalls: acc.phoneCalls + row.call_clicks,
      directions: acc.directions + row.business_direction_requests,
      searchImpressions: acc.searchImpressions + searchImpressions(row),
      search: acc.search + searchImpressions(row),
      maps: acc.maps + mapsImpressions(row),
    }),
    {
      profileViews: 0,
      websiteClicks: 0,
      phoneCalls: 0,
      directions: 0,
      searchImpressions: 0,
      search: 0,
      maps: 0,
    },
  )
}

export function buildSummary(current: GbpDailyRow[], previous: GbpDailyRow[], range: GbpRange, demo: boolean): GbpSummaryResponse {
  const now = sumRows(current)
  const prev = sumRows(previous)
  const card = (
    key: GbpMetricCard['key'],
    label: string,
    value: number,
    previousValue: number,
  ): GbpMetricCard => ({
    key,
    label,
    value,
    previousValue,
    changePercent: percentChange(value, previousValue),
  })

  return {
    range,
    demo,
    cards: [
      card('profileViews', 'Profile Views', now.profileViews, prev.profileViews),
      card('websiteClicks', 'Website Clicks', now.websiteClicks, prev.websiteClicks),
      card('phoneCalls', 'Phone Calls', now.phoneCalls, prev.phoneCalls),
      card('directions', 'Directions', now.directions, prev.directions),
      card('searchImpressions', 'Search Impressions', now.searchImpressions, prev.searchImpressions),
    ],
    searchVsMaps: { search: now.search, maps: now.maps },
  }
}

export function buildTimeseries(rows: GbpDailyRow[], range: GbpRange, demo: boolean): GbpTimeseriesResponse {
  return {
    range,
    demo,
    series: rows.map((row) => ({
      date: row.metric_date,
      profileViews: profileViews(row),
      websiteClicks: row.website_clicks,
      phoneCalls: row.call_clicks,
      directions: row.business_direction_requests,
    })),
  }
}

export function mergeMetricSeries(
  datedValues: Array<{ metric: GbpDailyMetric; date: string; value: number }>,
): GbpDailyRow[] {
  const byDate = new Map<string, GbpDailyRow>()
  for (const point of datedValues) {
    const row = byDate.get(point.date) ?? emptyDailyRow(point.date)
    const col = METRIC_TO_COLUMN[point.metric]
    if (col) row[col] = point.value
    byDate.set(point.date, row)
  }
  return [...byDate.values()].sort((a, b) => a.metric_date.localeCompare(b.metric_date))
}

const DEMO_KEYWORDS: GbpKeywordRow[] = [
  { keyword: 'electrician parramatta', impressions: 186 },
  { keyword: 'emergency electrician near me', impressions: 142 },
  { keyword: 'switchboard upgrade', impressions: 97 },
  { keyword: 'ceiling fan installation', impressions: 81 },
  { keyword: 'smoke alarm electrician', impressions: 64 },
  { keyword: 'power point installation', impressions: 51 },
  { keyword: 'led downlights sydney', impressions: 38 },
  { keyword: 'safety switch replacement', impressions: 29 },
]

function demoValue(dateKey: string, salt: number, base: number, amplitude: number): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  const seed = y * 10000 + m * 100 + d + salt
  const wave = Math.sin(seed / 4) * 0.5 + 0.5
  return Math.max(0, Math.round(base + amplitude * wave + (seed % 5)))
}

export function buildDemoDailyRows(start: string, end: string): GbpDailyRow[] {
  const rows: GbpDailyRow[] = []
  let cursor = start
  while (cursor <= end) {
    rows.push({
      metric_date: cursor,
      business_impressions_desktop_maps: demoValue(cursor, 1, 8, 6),
      business_impressions_mobile_maps: demoValue(cursor, 2, 22, 12),
      business_impressions_desktop_search: demoValue(cursor, 3, 14, 8),
      business_impressions_mobile_search: demoValue(cursor, 4, 36, 16),
      website_clicks: demoValue(cursor, 5, 6, 5),
      call_clicks: demoValue(cursor, 6, 4, 4),
      business_direction_requests: demoValue(cursor, 7, 3, 3),
      business_conversations: demoValue(cursor, 8, 1, 2),
      business_bookings: demoValue(cursor, 9, 0, 1),
      business_food_orders: 0,
      business_food_menu_clicks: 0,
    })
    cursor = addUtcDays(cursor, 1)
  }
  return rows
}

export function buildDemoSummary(range: GbpRange): GbpSummaryResponse {
  const current = rangeWindow(range)
  const previous = previousWindow(range)
  return buildSummary(
    buildDemoDailyRows(current.start, current.end),
    buildDemoDailyRows(previous.start, previous.end),
    range,
    true,
  )
}

export function buildDemoTimeseries(range: GbpRange): GbpTimeseriesResponse {
  const current = rangeWindow(range)
  return buildTimeseries(buildDemoDailyRows(current.start, current.end), range, true)
}

export function buildDemoKeywords(month: string): GbpKeywordsResponse {
  return { month, demo: true, keywords: DEMO_KEYWORDS }
}

export function parseGoogleDate(date: { year?: number; month?: number; day?: number } | undefined): string | null {
  if (!date?.year || !date?.month || !date?.day) return null
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

export function parseInsightsImpressions(row: {
  searchKeyword?: string
  search_keyword?: string
  insightsValue?: { value?: string | number; threshold?: string | number }
  insights_value?: { value?: string | number; threshold?: string | number }
}): GbpKeywordRow | null {
  const keyword = (row.searchKeyword || row.search_keyword || '').trim()
  if (!keyword) return null
  const insights = row.insightsValue || row.insights_value
  const raw = insights?.value ?? insights?.threshold ?? 0
  const impressions = typeof raw === 'number' ? raw : parseInt(String(raw), 10)
  if (!Number.isFinite(impressions)) return null
  return { keyword, impressions }
}
