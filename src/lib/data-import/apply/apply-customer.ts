import { prisma } from "@/lib/prisma";
import type { ImportCustomer } from "../import-product";

/**
 * Creates the customer or fills blanks on an existing one. Marketing consent is
 * only ever added (from an explicit "subscribed" in the source), never removed.
 */
export async function applyImportCustomer(
  ownerId: string,
  source: string,
  item: ImportCustomer,
): Promise<"created" | "updated" | "skipped"> {
  const existing = await prisma.customer.findUnique({
    where: { ownerId_email: { ownerId, email: item.email } },
  });
  const now = new Date();
  if (!existing) {
    await prisma.customer.create({
      data: {
        ownerId,
        email: item.email,
        name: item.name,
        phone: item.phone,
        notes: item.notes,
        source: `import:${source.toLowerCase()}`,
        marketingConsent: item.marketingConsent,
        marketingConsentAt: item.marketingConsent ? now : null,
      },
    });
    return "created";
  }
  const data: {
    name?: string;
    phone?: string;
    notes?: string;
    marketingConsent?: boolean;
    marketingConsentAt?: Date;
  } = {};
  if (item.name && !existing.name) data.name = item.name;
  if (item.phone && !existing.phone) data.phone = item.phone;
  if (item.notes && !existing.notes) data.notes = item.notes;
  if (item.marketingConsent && !existing.marketingConsent) {
    data.marketingConsent = true;
    data.marketingConsentAt = now;
  }
  if (Object.keys(data).length === 0) return "skipped";
  await prisma.customer.update({ where: { id: existing.id }, data });
  return "updated";
}
