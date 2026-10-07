import "dotenv/config";
import Stripe from "stripe";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PaymentMethod,
  PaymentStatus,
} from "../src/generated/prisma/client";

/**
 * Backfill a Connect PaymentIntent that charged a Vendl application fee
 * but never landed as a paid Order.
 *
 *   set -a && source .env.vercel.live && set +a
 *   npx tsx scripts/backfill-missing-connect-fee.ts pi_... acct_... --apply
 */
function clean(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, "");
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const piId = args.find((a) => a.startsWith("pi_"));
  const acctId = args.find((a) => a.startsWith("acct_"));
  if (!piId || !acctId) {
    throw new Error("Usage: backfill-missing-connect-fee.ts pi_… acct_… [--apply]");
  }

  const key = clean(process.env.STRIPE_SECRET_KEY);
  const databaseUrl = clean(process.env.DATABASE_URL);
  if (!key?.startsWith("sk_live")) {
    throw new Error("Need live STRIPE_SECRET_KEY");
  }
  if (!databaseUrl) throw new Error("DATABASE_URL missing");

  const stripe = new Stripe(key);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const existing = await prisma.order.findFirst({
      where: { stripePaymentIntentId: piId },
      select: { id: true, orderNumber: true, platformFeeCents: true },
    });
    if (existing) {
      console.log(JSON.stringify({ alreadyRecorded: existing }));
      return;
    }

    const owner = await prisma.owner.findFirst({
      where: { stripeAccountId: acctId },
      select: {
        id: true,
        businessName: true,
        stands: {
          select: { id: true, name: true, currency: true },
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!owner?.stands[0]) throw new Error(`No owner/stand for ${acctId}`);
    const stand = owner.stands[0];

    const pi = await stripe.paymentIntents.retrieve(
      piId,
      { expand: ["latest_charge"] },
      { stripeAccount: acctId },
    );
    const feeCents = pi.application_fee_amount ?? 0;
    if (feeCents <= 0) throw new Error("PaymentIntent has no application fee");
    if (pi.status !== "succeeded") {
      throw new Error(`PaymentIntent status is ${pi.status}`);
    }

    const currency = (pi.currency || stand.currency).toUpperCase();
    const goodsCents = Math.max(0, pi.amount - feeCents);
    const orderId = pi.metadata?.orderId || null;
    const pending = orderId
      ? await prisma.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            orderNumber: true,
            paymentStatus: true,
            platformFeeCents: true,
          },
        })
      : null;

    const plan = {
      ownerId: owner.id,
      businessName: owner.businessName,
      standId: stand.id,
      piId,
      feeCents,
      amount: pi.amount,
      currency,
      goodsCents,
      metadataOrderId: orderId,
      pending,
      apply,
    };
    console.log(JSON.stringify(plan, null, 2));

    if (!apply) {
      console.log("Dry-run only (pass --apply to write).");
      return;
    }

    if (pending && pending.paymentStatus !== PaymentStatus.PAID) {
      await prisma.order.update({
        where: { id: pending.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: PaymentMethod.CARD,
          stripePaymentIntentId: piId,
          platformFeeCents: Math.max(pending.platformFeeCents, feeCents),
          totalCents: pi.amount,
        },
      });
      console.log(JSON.stringify({ updated: pending.orderNumber }));
      return;
    }

    const orderNumber = `FS-FEE-${piId.slice(-8).toUpperCase()}`;
    const newId =
      orderId ??
      `cfee${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    await prisma.$executeRaw`
      INSERT INTO "Order" (
        id, "standId", "ownerId", "orderNumber",
        "paymentMethod", "paymentStatus",
        "subtotalCents", "totalCents", "discountCents", currency,
        "platformFeeCents", "stripePaymentIntentId", "receiptChannel",
        "isPreOrder", "paymentTiming", "handoverMode",
        "balanceRetryCount", "createdAt", "updatedAt"
      ) VALUES (
        ${newId}, ${stand.id}, ${owner.id}, ${orderNumber},
        CAST('CARD' AS "PaymentMethod"), CAST('PAID' AS "PaymentStatus"),
        ${goodsCents}, ${pi.amount}, 0, ${currency},
        ${feeCents}, ${piId}, CAST('NONE' AS "ReceiptChannel"),
        false, CAST('PAY_NOW' AS "PaymentTiming"), CAST('COLLECT' AS "HandoverMode"),
        0, NOW(), NOW()
      )
    `;
    console.log(JSON.stringify({ created: { id: newId, orderNumber, platformFeeCents: feeCents } }));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
