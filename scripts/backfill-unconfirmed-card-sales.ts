/**
 * Recover card orders the customer paid for on Stripe that never flipped to
 * PAID (webhook + success page both missed). Covers every owner, including
 * Free for Life / Pro stalls with no application fee, which the fee-based
 * backfill cannot see.
 *
 * Stock is NOT decremented - owners have likely corrected stock by hand since.
 *
 * Usage (production):
 *   vercel env pull .env.production.local --environment=production
 *   set -a && source .env.production.local && set +a
 *   npx tsx scripts/backfill-unconfirmed-card-sales.ts           # dry-run
 *   npx tsx scripts/backfill-unconfirmed-card-sales.ts --apply
 */
import "dotenv/config";
import Stripe from "stripe";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PaymentMethod,
  PaymentStatus,
  PaymentTiming,
} from "../src/generated/prisma/client";

const MIN_AGE_MS = 60 * 60 * 1000;

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const apply = process.argv.includes("--apply");
  const key = clean(process.env.STRIPE_SECRET_KEY);
  const databaseUrl = clean(process.env.DATABASE_URL);
  if (!key?.startsWith("sk_live")) throw new Error("Need live STRIPE_SECRET_KEY");
  if (!databaseUrl) throw new Error("DATABASE_URL missing");

  const stripe = new Stripe(key);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const candidates = await prisma.order.findMany({
      where: {
        paymentMethod: PaymentMethod.CARD,
        paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.EXPIRED] },
        stripeCheckoutSessionId: { not: null },
        createdAt: { lte: new Date(Date.now() - MIN_AGE_MS) },
      },
      select: {
        id: true,
        orderNumber: true,
        paymentStatus: true,
        paymentTiming: true,
        balanceCents: true,
        totalCents: true,
        currency: true,
        stripeCheckoutSessionId: true,
        owner: { select: { businessName: true, stripeAccountId: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    console.log(`Checking ${candidates.length} unconfirmed card orders…`);

    let recovered = 0;
    let recoveredCents = 0;
    for (const order of candidates) {
      const acct = order.owner.stripeAccountId;
      if (!acct || !order.stripeCheckoutSessionId) continue;
      let session: Stripe.Checkout.Session;
      try {
        session = await stripe.checkout.sessions.retrieve(
          order.stripeCheckoutSessionId,
          undefined,
          { stripeAccount: acct },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`skip ${order.orderNumber}: ${message}`);
        continue;
      }
      if (session.payment_status !== "paid") continue;

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      const isDeposit =
        order.paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE &&
        (order.balanceCents ?? 0) > 0;
      const nextStatus = isDeposit
        ? PaymentStatus.DEPOSIT_PAID
        : PaymentStatus.PAID;

      console.log(
        JSON.stringify({
          order: order.orderNumber,
          owner: order.owner.businessName,
          from: order.paymentStatus,
          to: nextStatus,
          total: `${order.currency} ${(order.totalCents / 100).toFixed(2)}`,
          paymentIntentId,
        }),
      );
      recovered += 1;
      recoveredCents += order.totalCents;

      if (apply) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: nextStatus,
            stripePaymentIntentId: paymentIntentId ?? undefined,
          },
        });
      }
    }

    console.log(
      `${apply ? "Recovered" : "Would recover"} ${recovered} orders (${(recoveredCents / 100).toFixed(2)} mixed-currency total).`,
    );
    if (!apply) console.log("Dry-run only (pass --apply to write).");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
