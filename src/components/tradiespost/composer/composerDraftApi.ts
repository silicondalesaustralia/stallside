import type { ComposerDraftData, SavedDraftSummary } from '@/lib/tradiespost/composer/composerDraft'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const json = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`)
  return json
}

const jsonInit = (method: 'POST' | 'PUT', draft: ComposerDraftData): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ draft }),
})

export function listSavedDrafts(): Promise<{ drafts: SavedDraftSummary[] }> {
  return request('/api/social/drafts')
}

export function loadSavedDraft(id: string): Promise<{ id: string; updatedAt: string; draft: ComposerDraftData }> {
  return request(`/api/social/drafts/${encodeURIComponent(id)}`)
}

/** Creates the draft when `id` is null, otherwise overwrites it. */
export function saveDraft(id: string | null, draft: ComposerDraftData): Promise<{ id: string; updatedAt: string }> {
  return id
    ? request(`/api/social/drafts/${encodeURIComponent(id)}`, jsonInit('PUT', draft))
    : request('/api/social/drafts', jsonInit('POST', draft))
}

export function deleteSavedDraft(id: string): Promise<{ ok: true }> {
  return request(`/api/social/drafts/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
