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
import { syncOwnerOrderGst } from "../src/lib/order-gst-sync";
import { syncPendingProcessorFees } from "../src/lib/order-fees/sync-pending-fees";

const apply = process.argv.includes("--apply");
const gstOnly = process.argv.includes("--gst-only");

async function backfillGst() {
  const owners = await prisma.owner.findMany({
    where: { gstRegistered: true },
    select: { id: true },
  });
  let checked = 0;
  let updated = 0;
  for (const { id } of owners) {
    const result = await syncOwnerOrderGst(id, { onlyMissing: true, dryRun: !apply });
    checked += result.checked;
    updated += result.updated;
  }
  console.log(`GST: ${updated} of ${checked} orders ${apply ? "updated" : "would update"}.`);
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
