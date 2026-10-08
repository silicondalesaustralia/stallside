// KIT SHIM - StitchedUp's AI agent suggestions are not part of the kit.
// requireSessionBusinessId is the generic session guard many social routes use.
import { getSocialIdentity } from '@/lib/socialHost/provisionSocialIdentity'

export type AgentSuggestionRow = {
  id: string
  business_id: string
  type: string
  source_id: string
  status: string
  draft_content: Record<string, unknown>
  error_message: string | null
  survey_run_id: string | null
  created_at: string
  reviewed_at: string | null
  executed_at: string | null
}

export async function requireSessionBusinessId(): Promise<
  | { ok: true; userId: string; businessId: string }
  | { ok: false; status: number; error: string }
> {
  const identity = await getSocialIdentity()
  if (!identity) return { ok: false, status: 401, error: 'Unauthorized' }
  return { ok: true, userId: identity.userId, businessId: identity.businessId }
}

/** Suggestions never exist in the kit, so suggestion-linked requests 404. */
export async function loadSuggestionForBusiness(
  _businessId: string,
  _suggestionId: string,
): Promise<AgentSuggestionRow | null> {
  return null
}
