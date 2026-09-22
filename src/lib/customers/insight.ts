import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";

const PAID: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
  PaymentStatus.DEPOSIT_PAID,
];

export async function loadCustomerInsight(ownerId: string, customerId: string) {
  const orders = await prisma.order.findMany({
    where: {
      ownerId,
      customerId,
      paymentStatus: { in: PAID },
    },
    orderBy: { createdAt: "desc" },
    select: {
      totalCents: true,
      createdAt: true,
      items: { select: { productNameSnapshot: true, productId: true } },
    },
  });

  const spendCents = orders.reduce((sum, o) => sum + o.totalCents, 0);
  const orderCount = orders.length;
  const aovCents = orderCount > 0 ? Math.round(spendCents / orderCount) : 0;
  const lastOrderAt = orders[0]?.createdAt ?? null;

  const names = new Set<string>();
  for (const o of orders) {
    for (const item of o.items) {
      if (item.productNameSnapshot) names.add(item.productNameSnapshot);
    }
  }

  return {
    orderCount,
    spendCents,
    aovCents,
    lastOrderAt,
    productNames: [...names].slice(0, 20),
  };
}
