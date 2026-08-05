import { prisma } from "@/lib/prisma";

/** True when this owner has soft-closed their Stallside account. */
export function ownerIsDeleted(owner: { deletedAt: Date | null }): boolean {
  return owner.deletedAt != null;
}

/** Lookup by login email - soft-closed owners (login still allowed; marketing mail stopped). */
export async function findClosedOwnerByEmail(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) return null;
  return prisma.owner.findFirst({
    where: {
      deletedAt: { not: null },
      OR: [
        { contactEmail: { equals: email, mode: "insensitive" } },
        { user: { email } },
      ],
    },
    select: { id: true, deletedAt: true },
  });
}

/**
 * Drop recipients that belong to soft-closed owners (user email, contact, or alert CC).
 * Used so lifecycle, sale alerts, and manual sends do not reach closed accounts.
 */
export async function filterEmailsForActiveOwners(
  emails: string[],
): Promise<string[]> {
  const recipients = [
    ...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)),
  ];
  if (!recipients.length) return [];

  const closed = await prisma.owner.findMany({
    where: {
      deletedAt: { not: null },
      OR: [
        { contactEmail: { in: recipients, mode: "insensitive" } },
        { user: { email: { in: recipients } } },
        { alertEmails: { hasSome: recipients } },
      ],
    },
    select: {
      contactEmail: true,
      alertEmails: true,
      user: { select: { email: true } },
    },
  });

  const blocked = new Set<string>();
  for (const owner of closed) {
    blocked.add(owner.contactEmail.trim().toLowerCase());
    if (owner.user?.email) blocked.add(owner.user.email.trim().toLowerCase());
    for (const alert of owner.alertEmails) {
      blocked.add(alert.trim().toLowerCase());
    }
  }

  return recipients.filter((email) => !blocked.has(email));
}
