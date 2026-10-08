/** Tagged logs only - never log the brief text itself. */
export function logDesignedAnalytics(
  event: string,
  dimensions: Record<string, string | number | boolean | null | undefined>,
): void {
  const safe: Record<string, string | number | boolean | null> = {}
  for (const [key, value] of Object.entries(dimensions)) {
    if (value === undefined) continue
    if (key === 'userBrief' || key === 'brief' || key === 'campaignFocus') continue
    safe[key] = value
  }
  console.log('[AiDesigned][analytics]', event, safe)
}
