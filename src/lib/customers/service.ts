import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";
import { syncCustomerOrderLinks, syncOwnerCustomerLinks } from "@/lib/crm/sync-customer-links";
import { loadCustomerInsight } from "@/lib/customers/insight";

const PAID: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
  PaymentStatus.DEPOSIT_PAID,
];

/** Most recently active 200 customers, optionally filtered by name/email/phone. */
export async function listOwnerCustomers(ownerId: string, q?: string) {
  const query = q?.trim();
  await syncOwnerCustomerLinks(ownerId);
  return prisma.customer.findMany({
    where: {
      ownerId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
              { phone: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      marketingConsent: true,
      source: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: {
        where: { paymentStatus: { in: PAID } },
        select: { totalCents: true, currency: true },
      },
    },
  });
}

export type OwnerCustomerRow = Awaited<ReturnType<typeof listOwnerCustomers>>[number];

/** Customer profile with recent orders, subscriptions and spend insight; null if not the owner's. */
export async function getOwnerCustomer(ownerId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, ownerId },
    select: { id: true, email: true },
  });
  if (!customer) return null;
  await syncCustomerOrderLinks(ownerId, customer.id, customer.email);

  const full = await prisma.customer.findFirst({
    where: { id: customer.id, ownerId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      notes: true,
      marketingConsent: true,
      source: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          orderNumber: true,
          totalCents: true,
          currency: true,
          paymentStatus: true,
          paymentMethod: true,
          localTransferMethodId: true,
          createdAt: true,
          stand: { select: { name: true } },
        },
      },
      shopperSubscriptions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, status: true, billingPlan: true, offer: { select: { title: true } } },
      },
    },
  });
  if (!full) return null;
  const insight = await loadCustomerInsight(ownerId, full.id);
  return { customer: full, insight };
}

export type OwnerCustomerDetail = NonNullable<Awaited<ReturnType<typeof getOwnerCustomer>>>;

export async function updateOwnerCustomerNotes(
  ownerId: string,
  customerId: string,
  rawNotes: string,
): Promise<boolean> {
  const notes = rawNotes.trim().slice(0, 4000) || null;
  const result = await prisma.customer.updateMany({
    where: { id: customerId, ownerId },
    data: { notes },
  });
  if (result.count === 0) return false;
  revalidatePath(`/dashboard/customers/${customerId}`);
  revalidatePath("/dashboard/customers");
  return true;
}
