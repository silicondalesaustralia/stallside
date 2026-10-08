// ============================================================
// lib/social/metaGraphClient.ts
// Shared Graph API version + response parsing for Meta calls.
// ============================================================

/** v18.0 was removed January 2026; v25.0 is supported until July 2028. */
export const META_GRAPH_API_VERSION = 'v25.0'
export const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`

export type GraphResult<T> = { ok: true; data: T } | { ok: false; error: string }

interface GraphErrorBody {
  error?: { message?: string; code?: number; type?: string }
}

/** Never calls .json() blind: handles non-OK status and non-JSON bodies. */
export async function parseGraphResponse<T>(res: Response): Promise<GraphResult<T>> {
  const text = await res.text()
  let body: (T & GraphErrorBody) | null = null
  try {
    body = text ? (JSON.parse(text) as T & GraphErrorBody) : null
  } catch {
    body = null
  }

  if (!res.ok || !body || body.error) {
    const message =
      body?.error?.message ||
      (text && !body ? `Meta returned a non-JSON response (HTTP ${res.status})` : '') ||
      `Meta request failed (HTTP ${res.status})`
    return { ok: false, error: message }
  }
  return { ok: true, data: body }
}

export async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${META_GRAPH_BASE}/${path}?${new URLSearchParams(params).toString()}`
  const result = await parseGraphResponse<T>(await fetch(url))
  if (!result.ok) throw new Error(result.error)
  return result.data
}

export async function graphPost<T>(
  path: string,
  body: Record<string, string>,
): Promise<GraphResult<T>> {
  try {
    const res = await fetch(`${META_GRAPH_BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await parseGraphResponse<T>(res)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
