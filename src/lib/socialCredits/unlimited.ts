import { PLATFORM_ADMIN_EMAILS } from '@/lib/constants'
import { Role } from '@/generated/prisma/client'

/** Platform admins (Role.ADMIN / PLATFORM_ADMIN_EMAILS) are not metered. */
export function hasUnlimitedSocialCredits(email?: string | null, role?: string | null): boolean {
  if (role === Role.ADMIN) return true
  const normalized = (email ?? '').trim().toLowerCase()
  return (PLATFORM_ADMIN_EMAILS as readonly string[]).includes(normalized)
}
