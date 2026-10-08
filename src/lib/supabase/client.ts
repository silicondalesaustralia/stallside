// KIT SHIM - the browser never talks to the social Supabase project directly.
// The only browser writes in the social UI are small `businesses` setting
// updates; this forwards them to POST /api/social/business-settings, which
// applies an allowlist server-side for the signed-in account.
type WriteResult = { error: { message: string } | null }

async function postSettings(patch: Record<string, unknown>): Promise<WriteResult> {
  try {
    const res = await fetch('/api/social/business-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) {
      const body: { error?: string } = await res.json().catch(() => ({}))
      return { error: { message: body.error || `Save failed (${res.status})` } }
    }
    return { error: null }
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : 'Save failed' } }
  }
}

function businessesTable() {
  return {
    update(patch: Record<string, unknown>) {
      return {
        /** The id filter is ignored: the server always targets the session's business. */
        eq(_column: string, _value: unknown): Promise<WriteResult> {
          return postSettings(patch)
        },
      }
    },
  }
}

export function createClient() {
  return {
    from(table: 'businesses') {
      if (table !== 'businesses') throw new Error(`[social kit] browser access to "${table}" is not supported`)
      return businessesTable()
    },
  }
}
