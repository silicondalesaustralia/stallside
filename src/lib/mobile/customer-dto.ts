import type { CustomerDetail, CustomerSummary } from "@/contracts/mobile/customers";
import type { OwnerCustomerDetail, OwnerCustomerRow } from "@/lib/customers/service";
import { orderPaymentLabel, paymentStatusNote } from "@/lib/order-payment-label";

export function toCustomerSummary(row: OwnerCustomerRow): CustomerSummary {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    orderCount: row._count.orders,
    spendCents: row.orders.reduce((sum, order) => sum + order.totalCents, 0),
    currency: row.orders[0]?.currency ?? "AUD",
    marketingConsent: row.marketingConsent,
  };
}

export function toCustomerDetail(detail: OwnerCustomerDetail, fallbackCurrency: string): CustomerDetail {
  const { customer, insight } = detail;
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    notes: customer.notes,
    marketingConsent: customer.marketingConsent,
    source: customer.source,
    currency: customer.orders[0]?.currency ?? fallbackCurrency,
    insight: {
      orderCount: insight.orderCount,
      spendCents: insight.spendCents,
      aovCents: insight.aovCents,
      lastOrderAt: insight.lastOrderAt?.toISOString() ?? null,
      productNames: insight.productNames,
    },
    orders: customer.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      totalCents: order.totalCents,
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      standName: order.stand.name,
      paymentLabel: orderPaymentLabel(order.paymentMethod, order.localTransferMethodId),
      paymentStatusLabel: paymentStatusNote(order.paymentStatus),
    })),
    subscriptions: customer.shopperSubscriptions.map((sub) => ({
      id: sub.id,
      title: sub.offer.title,
      status: sub.status,
      billingPlan: sub.billingPlan,
    })),
  };
}
