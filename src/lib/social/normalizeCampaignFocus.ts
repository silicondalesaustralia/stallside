export const CAMPAIGN_FOCUS_MAX_CHARS = 800

export type CampaignFocusParse =
  | { ok: true; value: string | null }
  | { ok: false; error: string }

export function parseCampaignFocus(value: unknown): CampaignFocusParse {
  if (value == null) return { ok: true, value: null }
  if (typeof value !== 'string') return { ok: true, value: null }
  const trimmed = value.trim()
  if (!trimmed) return { ok: true, value: null }
  if (trimmed.length > CAMPAIGN_FOCUS_MAX_CHARS) {
    return {
      ok: false,
      error: `Instructions must be ${CAMPAIGN_FOCUS_MAX_CHARS} characters or fewer`,
    }
  }
  return { ok: true, value: trimmed }
}

/** Valid instruction text, or null if empty. Over-limit is rejected - never sliced. */
export function normalizeCampaignFocus(value: unknown): string | null {
  const parsed = parseCampaignFocus(value)
  if (!parsed.ok) return null
  return parsed.value
}
