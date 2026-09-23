import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { loadCustomerInsight } from "@/lib/customers/insight";
import { syncCustomerOrderLinks } from "@/lib/crm/sync-customer-links";
import CustomerDetailBody from "./CustomerDetailBody";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { customerId } = await params;
  const { saved } = await searchParams;
  const { owner } = await requireOwner();

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, ownerId: owner.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      notes: true,
      marketingConsent: true,
      source: true,
    },
  });
  if (!customer) notFound();

  await syncCustomerOrderLinks(owner.id, customer.id, customer.email);

  const full = await prisma.customer.findFirst({
    where: { id: customer.id, ownerId: owner.id },
    include: {
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
        select: {
          id: true,
          status: true,
          billingPlan: true,
          offer: { select: { title: true } },
        },
      },
    },
  });
  if (!full) notFound();

  const insight = await loadCustomerInsight(owner.id, full.id);
  const currency = full.orders[0]?.currency ?? owner.billingCurrency ?? "AUD";

  return (
    <main className="flex flex-col gap-8">
      <CustomerDetailBody
        customer={customer}
        orders={full.orders}
        subscriptions={full.shopperSubscriptions}
        insight={insight}
        currency={currency}
        saved={Boolean(saved)}
      />
    </main>
  );
}
