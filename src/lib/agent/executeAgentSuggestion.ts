// KIT SHIM - agent suggestions are not part of the kit; nothing to mark.
import type { SupabaseClient } from '@supabase/supabase-js'

export async function markSuggestionExecuted(
  _db: SupabaseClient,
  _suggestionId: string,
  _draftContent: Record<string, unknown>,
  _executionMeta: Record<string, unknown>,
): Promise<void> {}
