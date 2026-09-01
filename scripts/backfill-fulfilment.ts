/**
 * Backfill Phase 5 fulfilment entities for existing owners.
 * Run: npx tsx scripts/backfill-fulfilment.ts
 */
import { prisma } from "../src/lib/prisma";
import { ensureStandImmediateForOwner } from "../src/lib/fulfilment/defaults";
import { syncPreOrderPageFulfilmentOption } from "../src/lib/fulfilment/sync-preorder-page";
import { syncSubscriptionOfferFulfilmentOption } from "../src/lib/fulfilment/sync-subscription-offer";

async function main() {
  const owners = await prisma.owner.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });
  console.log(`Owners: ${owners.length}`);

  for (const owner of owners) {
    await ensureStandImmediateForOwner(owner.id);
  }
  console.log("Stand immediate options ensured.");

  const pages = await prisma.preOrderPage.findMany({
    select: { id: true },
  });
  for (const page of pages) {
    await syncPreOrderPageFulfilmentOption(page.id);
  }
  console.log(`Pre-order pages synced: ${pages.length}`);

  const offers = await prisma.subscriptionOffer.findMany({
    select: { id: true },
  });
  for (const offer of offers) {
    await syncSubscriptionOfferFulfilmentOption(offer.id);
  }
  console.log(`Subscription offers synced: ${offers.length}`);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
