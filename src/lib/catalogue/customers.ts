import { prisma } from "@/lib/prisma";
import { normalizeReceiptEmail } from "@/lib/first-order-discount";

export type EnsureCustomerInput = {
  ownerId: string;
  email: string | null | undefined;
  name?: string | null;
  phone?: string | null;
  source?: string;
  /** Only set true when shopper explicitly opted in (e.g. restock). */
  marketingConsent?: boolean;
};

/**
 * Find or create Customer by owner + normalised email.
 * Returns null when email is blank (cash anonymity).
 */
export async function ensureCustomer(input: EnsureCustomerInput) {
  const email = normalizeReceiptEmail(input.email ?? "");
  if (!email) return null;

  const existing = await prisma.customer.findUnique({
    where: { ownerId_email: { ownerId: input.ownerId, email } },
  });
  if (existing) {
    const data: {
      name?: string;
      phone?: string;
      marketingConsent?: boolean;
      marketingConsentAt?: Date;
    } = {};
    if (input.name && !existing.name) data.name = input.name;
    if (input.phone && !existing.phone) data.phone = input.phone;
    if (input.marketingConsent && !existing.marketingConsent) {
      data.marketingConsent = true;
      data.marketingConsentAt = new Date();
    }
    if (Object.keys(data).length === 0) return existing;
    return prisma.customer.update({ where: { id: existing.id }, data });
  }

  return prisma.customer.create({
    data: {
      ownerId: input.ownerId,
      email,
      name: input.name?.trim() || null,
      phone: input.phone?.trim() || null,
      source: input.source ?? null,
      marketingConsent: Boolean(input.marketingConsent),
      marketingConsentAt: input.marketingConsent ? new Date() : null,
    },
  });
}
