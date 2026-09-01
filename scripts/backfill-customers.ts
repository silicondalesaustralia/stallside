/**
 * Idempotent Customer backfill from Order / ShopperSubscription / RestockSubscriber.
 * Skips blank emails. marketingConsent stays false except restock opt-ins.
 *
 * Usage: npx tsx scripts/backfill-customers.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { ensureCustomer } from "../src/lib/catalogue/customers";
import { normalizeReceiptEmail } from "../src/lib/first-order-discount";

async function main() {
  let orderLinked = 0;
  let subLinked = 0;
  let restockLinked = 0;

  const orders = await prisma.order.findMany({
    where: { customerId: null, receiptEmail: { not: null } },
    select: {
      id: true,
      ownerId: true,
      receiptEmail: true,
      customerName: true,
      customerPhone: true,
    },
  });
  for (const o of orders) {
    const customer = await ensureCustomer({
      ownerId: o.ownerId,
      email: o.receiptEmail,
      name: o.customerName,
      phone: o.customerPhone,
      source: "order",
    });
    if (!customer) continue;
    await prisma.order.update({
      where: { id: o.id },
      data: { customerId: customer.id },
    });
    orderLinked += 1;
  }

  const subs = await prisma.shopperSubscription.findMany({
    where: { customerId: null },
    select: {
      id: true,
      ownerId: true,
      customerEmail: true,
      customerName: true,
      customerPhone: true,
    },
  });
  for (const s of subs) {
    const customer = await ensureCustomer({
      ownerId: s.ownerId,
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
    subLinked += 1;
  }

  const restocks = await prisma.restockSubscriber.findMany({
    where: { customerId: null },
    select: {
      id: true,
      email: true,
      stand: { select: { ownerId: true } },
    },
  });
  for (const r of restocks) {
    const email = normalizeReceiptEmail(r.email);
    if (!email) continue;
    const customer = await ensureCustomer({
      ownerId: r.stand.ownerId,
      email,
      source: "restock",
      marketingConsent: true,
    });
    if (!customer) continue;
    await prisma.restockSubscriber.update({
      where: { id: r.id },
      data: { customerId: customer.id },
    });
    restockLinked += 1;
  }

  console.log(
    `Customer backfill: orders=${orderLinked} subscriptions=${subLinked} restock=${restockLinked}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
