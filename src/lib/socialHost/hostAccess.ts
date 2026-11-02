import type { HostRole } from '@/lib/socialHost/hostSession'
import { creditOwnerForAccount } from '@/lib/socialCredits/creditOwner'
import { loadSocialAccess } from '@/lib/socialCredits/socialAccess'

/**
 * HOST INTEGRATION POINT #3 - plan gating and team permissions.
 * Pro always; Free only while the owner holds bought credits (connections stay
 * connected either way). Routes respond 403 { code: 'capability_required' } otherwise.
 */
export async function hostCanUseSocial(accountId: string): Promise<boolean> {
  const owner = await creditOwnerForAccount(accountId)
  if (!owner) return false
  return (await loadSocialAccess(owner)).canUseSocial
}

/** Who may connect/disconnect social accounts and edit the brand kit. */
export function hostCanManageSocial(role: HostRole | string | null | undefined): boolean {
  return role === 'owner' || role === 'admin'
}
