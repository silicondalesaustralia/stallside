/**
 * Runs `fn` over `items` with at most `limit` in flight. After a failure no new items
 * start, and it waits for in-flight ones to settle (callers delete shared temp files
 * afterwards) before rethrowing the first error.
 */
export async function runWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0
  let failed = false
  const lane = async () => {
    while (!failed && next < items.length) {
      const item = items[next++]
      try {
        await fn(item)
      } catch (err) {
        failed = true
        throw err
      }
    }
  }
  const results = await Promise.allSettled(Array.from({ length: Math.min(limit, items.length) }, lane))
  const rejected = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')
  if (rejected) throw rejected.reason
}
