import type { HostRole } from '@/lib/socialHost/hostSession'

/**
 * HOST INTEGRATION POINT #3 - plan gating and team permissions.
 * Return false to block the social features for an account (e.g. not on a plan
 * that includes social). Routes then respond 403 { code: 'capability_required' }.
 */
export async function hostCanUseSocial(accountId: string): Promise<boolean> {
  void accountId
  // TODO(vendl): check the account's plan/entitlement in Vendl's DB.
  return true
}

/** Who may connect/disconnect social accounts and edit the brand kit. */
export function hostCanManageSocial(role: HostRole | string | null | undefined): boolean {
  return role === 'owner' || role === 'admin'
}
