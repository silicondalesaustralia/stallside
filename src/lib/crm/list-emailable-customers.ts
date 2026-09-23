import { prisma } from "@/lib/prisma";
import { ensureCustomer } from "@/lib/catalogue/customers";
import { normalizeReceiptEmail } from "@/lib/first-order-discount";

export type EmailableCustomer = {
  id: string;
  name: string | null;
  email: string | null;
};

/**
 * Customers with email for Communication, including shoppers who only
 * left a receipt email on an order (ensures CRM rows as needed).
 */
export async function listEmailableCustomers(
  ownerId: string,
  limit = 500,
): Promise<EmailableCustomer[]> {
  const existing = await prisma.customer.findMany({
    where: { ownerId, email: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: { id: true, name: true, email: true },
  });

  const byEmail = new Map<string, EmailableCustomer>();
  for (const c of existing) {
    const email = normalizeReceiptEmail(c.email ?? "");
    if (!email) continue;
    byEmail.set(email, { id: c.id, name: c.name, email });
  }

  if (byEmail.size < limit) {
    const orders = await prisma.order.findMany({
      where: {
        ownerId,
        receiptEmail: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(2000, limit * 4),
      select: { receiptEmail: true, customerName: true },
    });

    for (const o of orders) {
      const email = normalizeReceiptEmail(o.receiptEmail ?? "");
      if (!email || byEmail.has(email)) continue;
      const customer = await ensureCustomer({
        ownerId,
        email,
        name: o.customerName,
        source: "order",
      });
      if (!customer?.email) continue;
      await prisma.order.updateMany({
        where: {
          ownerId,
          customerId: null,
          receiptEmail: { equals: email, mode: "insensitive" },
        },
        data: { customerId: customer.id },
      });
      byEmail.set(email, {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      });
      if (byEmail.size >= limit) break;
    }
  }

  return [...byEmail.values()].sort((a, b) => {
    const an = (a.name || a.email || "").toLowerCase();
    const bn = (b.name || b.email || "").toLowerCase();
    return an.localeCompare(bn);
  });
}
