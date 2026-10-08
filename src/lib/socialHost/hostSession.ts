/**
 * HOST INTEGRATION POINT #1 - Vendl implements this.
 *
 * Return the signed-in Vendl user and the account (workspace/store/business)
 * the social features should act for, or null when nobody is signed in.
 * Called server-side only (route handlers / server components), once per
 * request (results are cached by provisionSocialIdentity).
 */
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/session'
import { resolveSelectedBusiness } from '@/lib/selected-business'

export type HostRole = 'owner' | 'admin' | 'member'

export type HostSession = {
  /** Vendl's stable user id (any string). */
  userId: string
  email: string
  name: string | null
  /** Vendl's stable account id - one social "business" per account. */
  accountId: string
  accountName: string
  role: HostRole
}

/** Vendl: one social business per stand (the dashboard's selected business). */
export async function getHostSession(): Promise<HostSession | null> {
  const session = await getAuthSession()
  const user = session?.user
  if (!user?.id) return null

  const owner = await prisma.owner.findUnique({
    where: { userId: user.id },
    select: { id: true, deletedAt: true, contactEmail: true },
  })
  if (!owner || owner.deletedAt) return null

  const { selected } = await resolveSelectedBusiness(owner.id)
  if (!selected) return null

  return {
    userId: user.id,
    email: user.email ?? owner.contactEmail ?? '',
    name: user.name ?? null,
    accountId: selected.id,
    accountName: selected.name,
    role: 'owner',
  }
}
