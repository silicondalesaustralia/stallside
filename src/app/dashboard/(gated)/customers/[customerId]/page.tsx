import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { getOwnerCustomer } from "@/lib/customers/service";
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

  const detail = await getOwnerCustomer(owner.id, customerId);
  if (!detail) notFound();
  const { customer, insight } = detail;
  const currency = customer.orders[0]?.currency ?? owner.billingCurrency ?? "AUD";

  return (
    <main className="flex flex-col gap-8">
      <CustomerDetailBody
        customer={customer}
        orders={customer.orders}
        subscriptions={customer.shopperSubscriptions}
        insight={insight}
        currency={currency}
        saved={Boolean(saved)}
      />
    </main>
  );
}
