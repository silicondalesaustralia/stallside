/** Tagged logs only - no brief text or customer PII. */
export function logWeekBuilderAnalytics(
  event: string,
  dimensions: Record<string, string | number | boolean | null | undefined>,
): void {
  const safe: Record<string, string | number | boolean | null> = {}
  for (const [key, value] of Object.entries(dimensions)) {
    if (value === undefined) continue
    if (
      key === 'priorityText' ||
      key === 'topic' ||
      key === 'userBrief' ||
      key === 'brief'
    ) {
      continue
    }
    safe[key] = value
  }
  console.log('[WeekBuilder][analytics]', event, safe)
}
