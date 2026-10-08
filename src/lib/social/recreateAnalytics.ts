/** Tagged logs only - no screenshot, prompt, or unnecessary business PII. */
export function logRecreateAnalytics(
  event: string,
  dimensions: Record<string, string | number | boolean | null | undefined>,
): void {
  const safe: Record<string, string | number | boolean | null> = {}
  for (const [key, value] of Object.entries(dimensions)) {
    if (value === undefined) continue
    safe[key] = value
  }
  console.log('[Recreate][analytics]', event, safe)
}
