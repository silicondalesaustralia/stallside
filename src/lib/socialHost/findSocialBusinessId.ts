import { socialDb } from '@/lib/socialHost/socialDb'

/**
 * The social DB business for a Vendl business (stand), or null when the owner has never
 * opened Social. Read-only: unlike provisionSocialIdentity it never creates the row.
 */
export async function findSocialBusinessId(standId: string): Promise<string | null> {
  const { data, error } = await socialDb()
    .from('businesses')
    .select('id')
    .eq('external_account_id', standId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? (data.id as string) : null
}
