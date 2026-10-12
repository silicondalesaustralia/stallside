/**
 * Oct 2026 pricing: LEGACY owners with no Stripe order before the cutoff move
 * to V2026 (weekly Monday Stripe payouts). Owners with a Stripe order stay LEGACY.
 * Lifetime access is left untouched.
 *
 * Dry run (default):  npx tsx scripts/migrate-pricing-2026-10.ts
 * Apply:              npx tsx scripts/migrate-pricing-2026-10.ts --apply
 */
import "dotenv/config";
import { PaymentMethod, PricingModel } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";
import { COUNTED_STATUSES } from "../src/lib/order-metrics";
import { LEGACY_CUTOFF, setWeeklyPayouts } from "../src/lib/pricing-model";

const REASON = "pricing_2026_10";

async function ownersWithStripeOrders(): Promise<Set<string>> {
  const rows = await prisma.order.findMany({
    where: {
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: { in: [...COUNTED_STATUSES, "REFUNDED"] },
      createdAt: { lt: LEGACY_CUTOFF },
      OR: [
        { stripePaymentIntentId: { not: null } },
        { stripeCheckoutSessionId: { not: null } },
      ],
    },
    select: { ownerId: true },
    distinct: ["ownerId"],
  });
  return new Set(rows.map((r) => r.ownerId));
}

async function main() {
  const apply = process.argv.includes("--apply");
  const keep = await ownersWithStripeOrders();
  const legacy = await prisma.owner.findMany({
    where: { pricingModel: PricingModel.LEGACY },
    select: { id: true, businessName: true, stripeAccountId: true },
  });
  const toMove = legacy.filter((o) => !keep.has(o.id));

  console.log(`LEGACY owners: ${legacy.length}`);
  console.log(`Grandfathered (Stripe order before cutoff): ${legacy.length - toMove.length}`);
  console.log(`Moving to V2026: ${toMove.length}${apply ? "" : " (dry run)"}\n`);

  const counters = { moved: 0, payouts: 0, failed: 0 };
  for (const owner of toMove) {
    const label = `${owner.id} ${owner.businessName}`;
    if (!apply) {
      console.log(`would move ${label}${owner.stripeAccountId ? " + weekly payouts" : ""}`);
      continue;
    }
    try {
      await prisma.owner.update({
        where: { id: owner.id },
        data: {
          pricingModel: PricingModel.V2026,
          pricingModelChangedAt: new Date(),
          pricingModelReason: REASON,
        },
      });
      counters.moved += 1;
      if (owner.stripeAccountId) {
        await setWeeklyPayouts(owner.stripeAccountId);
        counters.payouts += 1;
      }
      console.log(`moved ${label}`);
    } catch (error) {
      counters.failed += 1;
      console.error(`FAILED ${label}`, error);
    }
  }
  if (apply) console.log("\nDone", counters);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
