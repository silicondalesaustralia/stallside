// KIT SHIM - replaces StitchedUp's cookie-based Supabase Auth client.
// The social DB has no Supabase Auth: "session" calls resolve the host (Vendl)
// session via provisionSocialIdentity, and all queries use the service role.
// Every social route scopes queries by the server-derived business id.
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { getSocialIdentity, type SocialIdentity } from '@/lib/socialHost/provisionSocialIdentity'
import { socialDb } from '@/lib/socialHost/socialDb'

function toSupabaseUser(identity: SocialIdentity): User {
  return {
    id: identity.userId,
    email: identity.email,
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: { full_name: identity.name, external_account_id: identity.accountId },
    created_at: new Date(0).toISOString(),
  }
}

type GetUserResult = { data: { user: User | null }; error: null }

/** Same call shape as before: `(await createClient()).auth.getUser()` + `.from()`. */
export async function createClient(): Promise<SupabaseClient> {
  const db = socialDb()
  const auth = {
    async getUser(): Promise<GetUserResult> {
      const identity = await getSocialIdentity()
      return { data: { user: identity ? toSupabaseUser(identity) : null }, error: null }
    },
  }
  const client: SupabaseClient = Object.create(db)
  Object.defineProperty(client, 'auth', { value: auth })
  return client
}

export async function createServiceClient(): Promise<SupabaseClient> {
  return socialDb()
}
