import { prisma } from "@/lib/prisma";
import { ensureCustomer } from "@/lib/catalogue/customers";
import { normalizeReceiptEmail } from "@/lib/first-order-discount";

/**
 * Link this owner's orders / subscriptions / restock opt-ins to Customer rows
 * by email. Idempotent; safe to run on Customers page load.
 */
export async function syncOwnerCustomerLinks(ownerId: string) {
  const orders = await prisma.order.findMany({
    where: { ownerId, customerId: null, receiptEmail: { not: null } },
    select: {
      id: true,
      receiptEmail: true,
      customerName: true,
      customerPhone: true,
    },
    take: 3000,
  });

  const orderByEmail = new Map<
    string,
    { ids: string[]; name: string | null; phone: string | null }
  >();
  for (const o of orders) {
    const email = normalizeReceiptEmail(o.receiptEmail ?? "");
    if (!email) continue;
    const row = orderByEmail.get(email) ?? {
      ids: [],
      name: null,
      phone: null,
    };
    row.ids.push(o.id);
    if (!row.name && o.customerName) row.name = o.customerName;
    if (!row.phone && o.customerPhone) row.phone = o.customerPhone;
    orderByEmail.set(email, row);
  }

  for (const [email, bundle] of orderByEmail) {
    const customer = await ensureCustomer({
      ownerId,
      email,
      name: bundle.name,
      phone: bundle.phone,
      source: "order",
    });
    if (!customer) continue;
    await prisma.order.updateMany({
      where: { id: { in: bundle.ids }, customerId: null },
      data: { customerId: customer.id },
    });
  }

  const subs = await prisma.shopperSubscription.findMany({
    where: { ownerId, customerId: null },
    select: {
      id: true,
      customerEmail: true,
      customerName: true,
      customerPhone: true,
    },
    take: 1000,
  });
  for (const s of subs) {
    const customer = await ensureCustomer({
      ownerId,
      email: s.customerEmail,
      name: s.customerName,
      phone: s.customerPhone,
      source: "subscription",
    });
    if (!customer) continue;
    await prisma.shopperSubscription.update({
      where: { id: s.id },
      data: { customerId: customer.id },
    });
  }

  const stands = await prisma.stand.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const standIds = stands.map((s) => s.id);
  if (standIds.length === 0) return;

  const restocks = await prisma.restockSubscriber.findMany({
    where: { standId: { in: standIds }, customerId: null },
    select: { id: true, email: true },
    take: 2000,
  });
  for (const r of restocks) {
    const customer = await ensureCustomer({
      ownerId,
      email: r.email,
      source: "restock",
      marketingConsent: true,
    });
    if (!customer) continue;
    await prisma.restockSubscriber.update({
      where: { id: r.id },
      data: { customerId: customer.id },
    });
  }
}

/** Link unmatched orders for one email onto an existing customer. */
export async function syncCustomerOrderLinks(
  ownerId: string,
  customerId: string,
  email: string | null | undefined,
) {
  const normalized = normalizeReceiptEmail(email ?? "");
  if (!normalized) return;
  await prisma.order.updateMany({
    where: {
      ownerId,
      customerId: null,
      receiptEmail: { equals: normalized, mode: "insensitive" },
    },
    data: { customerId },
  });
  await prisma.shopperSubscription.updateMany({
    where: {
      ownerId,
      customerId: null,
      customerEmail: { equals: normalized, mode: "insensitive" },
    },
    data: { customerId },
  });

  const stands = await prisma.stand.findMany({
    where: { ownerId },
    select: { id: true },
  });
  if (stands.length > 0) {
    await prisma.restockSubscriber.updateMany({
      where: {
        standId: { in: stands.map((s) => s.id) },
        customerId: null,
        email: { equals: normalized, mode: "insensitive" },
      },
      data: { customerId },
    });
  }
}
