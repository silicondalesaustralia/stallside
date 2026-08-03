/**
 * Recompute Owner.lifetimePaidCents from Stripe paid subscription invoices.
 *
 * Usage (production):
 *   vercel env pull .env.production.local --environment=production
 *   set -a && source .env.production.local && set +a
 *   npx tsx scripts/backfill-owner-ltv.ts              # dry-run
 *   npx tsx scripts/backfill-owner-ltv.ts --apply
 *   npx tsx scripts/backfill-owner-ltv.ts cms4q... --apply
 *
 * Needs live STRIPE_SECRET_KEY + production DATABASE_URL.
 */
import "dotenv/config";
import Stripe from "stripe";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sumPaidSubscriptionInvoiceCents } from "../src/lib/stripe-ltv";

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const ownerId = args.find((a) => !a.startsWith("--"));

  const key = clean(process.env.STRIPE_SECRET_KEY);
  const databaseUrl = clean(process.env.DATABASE_URL);
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  if (!databaseUrl) throw new Error("DATABASE_URL missing");
  if (!key.startsWith("sk_live")) {
    throw new Error(
      "STRIPE_SECRET_KEY is not sk_live_… - refuse to backfill against test key",
    );
  }

  const stripe = new Stripe(key);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const owners = await prisma.owner.findMany({
      where: {
        stripeCustomerId: { not: null },
        ...(ownerId
          ? { id: ownerId }
          : { stripeSubscriptionId: { not: null } }),
      },
      select: {
        id: true,
        businessName: true,
        stripeCustomerId: true,
        lifetimePaidCents: true,
      },
    });

    for (const owner of owners) {
      const paid = await sumPaidSubscriptionInvoiceCents(
        stripe,
        owner.stripeCustomerId!,
      );
      console.log(
        JSON.stringify({
          id: owner.id,
          businessName: owner.businessName,
          was: owner.lifetimePaidCents,
          stripePaid: paid,
          delta: paid - owner.lifetimePaidCents,
        }),
      );
      if (apply && paid !== owner.lifetimePaidCents) {
        await prisma.owner.update({
          where: { id: owner.id },
          data: { lifetimePaidCents: paid },
        });
      }
    }

    console.log(apply ? "Applied." : "Dry-run only (pass --apply to write).");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
