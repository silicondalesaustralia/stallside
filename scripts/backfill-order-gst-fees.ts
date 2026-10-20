/**
 * Fill GST and processor fees on orders created before order export existed.
 * GST uses each product's current GST-free flag and the owner's current GST registration.
 *
 * Dry run (default):  npx tsx scripts/backfill-order-gst-fees.ts
 * Apply:              npx tsx scripts/backfill-order-gst-fees.ts --apply
 * GST only:           npx tsx scripts/backfill-order-gst-fees.ts --apply --gst-only
 * (fee sync needs the live STRIPE_SECRET_KEY / PayPal credentials)
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { lineGstCents } from "../src/lib/gst";
import { syncPendingProcessorFees } from "../src/lib/order-fees/sync-pending-fees";

const apply = process.argv.includes("--apply");
const gstOnly = process.argv.includes("--gst-only");

async function backfillGst() {
  const orders = await prisma.order.findMany({
    where: {
      gstCents: 0,
      currency: "AUD",
      owner: { gstRegistered: true },
    },
    include: { items: { include: { product: { select: { gstFree: true } } } } },
  });
  let updated = 0;
  for (const order of orders) {
    const lines = order.items.map((i) => ({
      lineTotalCents: i.lineTotalCents,
      gstFree: i.product.gstFree,
    }));
    const gst = lineGstCents(lines, order.discountCents, true);
    const total = gst.reduce((sum, cents) => sum + cents, 0);
    if (total === 0) continue;
    updated += 1;
    if (!apply) continue;
    await prisma.$transaction([
      ...order.items.map((item, i) =>
        prisma.orderItem.update({
          where: { id: item.id },
          data: { gstFree: lines[i].gstFree, gstCents: gst[i] },
        }),
      ),
      prisma.order.update({ where: { id: order.id }, data: { gstCents: total } }),
    ]);
  }
  console.log(`GST: ${updated} of ${orders.length} orders ${apply ? "updated" : "would update"}.`);
}

async function backfillFees() {
  if (!apply) {
    console.log("Fees: skipped in dry run (calls Stripe / Square / PayPal).");
    return;
  }
  for (;;) {
    const result = await syncPendingProcessorFees({ limit: 200 });
    console.log("Fees batch:", result);
    if (result.synced === 0) break;
  }
}

async function main() {
  try {
    await backfillGst();
    if (!gstOnly) await backfillFees();
  } catch (error) {
    console.error("Backfill failed", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
