/**
 * Ensure two-product schema exists on the APP database (DATABASE_URL).
 * Prisma migrate uses DIRECT_DATABASE_URL — keep both in sync.
 *
 * Usage: npx tsx scripts/ensure-two-product-schema.ts
 */
import "dotenv/config";
import pg from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  const host = url.replace(/:[^:@/]+@/, "@").split("@")[1]?.split("/")[0];
  console.log("Using DATABASE_URL host:", host);

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PaymentTiming" AS ENUM ('PAY_NOW', 'PAY_UPFRONT', 'DEPOSIT_THEN_BALANCE');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
      DO $$ BEGIN
        CREATE TYPE "HandoverMode" AS ENUM ('COLLECT', 'DELIVER');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // PaymentStatus extras (ADD VALUE is not fully IF NOT EXISTS on all PG versions)
    for (const v of ["DEPOSIT_PAID", "BALANCE_DUE", "BALANCE_FAILED"]) {
      await client.query(`
        DO $$ BEGIN
          ALTER TYPE "PaymentStatus" ADD VALUE '${v}';
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);
    }

    await client.query(`
      ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "firstProductLiveAt" TIMESTAMP(3);
      ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "preOrdersCrossSellDismissedAt" TIMESTAMP(3);
      ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "verticalSlug" TEXT;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "paymentTiming" "PaymentTiming" NOT NULL DEFAULT 'PAY_NOW';
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "depositPercent" INTEGER;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "handoverMode" "HandoverMode" NOT NULL DEFAULT 'COLLECT';
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentTiming" "PaymentTiming" NOT NULL DEFAULT 'PAY_NOW';
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "handoverMode" "HandoverMode" NOT NULL DEFAULT 'COLLECT';
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "depositCents" INTEGER;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "balanceCents" INTEGER;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "balanceDueAt" TIMESTAMP(3);
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripePaymentMethodId" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "balancePaymentIntentId" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "balanceRetryCount" INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "balanceLastFailedAt" TIMESTAMP(3);
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryAddressLine1" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliverySuburb" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryPostcode" TEXT;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryNotes" TEXT;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "upsellProductId" TEXT;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "upsellPriceCents" INTEGER;
      ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "preOrderUpsellName" TEXT;
      ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "preOrderUpsellPriceCents" INTEGER;
      ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "preOrderUpsellProductId" TEXT;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderUpsellName" TEXT;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderUpsellPriceCents" INTEGER;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderUpsellProductId" TEXT;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "costCents" INTEGER;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sku" TEXT;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "upc" TEXT;
      ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountKind" TEXT;
      ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountValue" INTEGER;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountKind" TEXT;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountValue" INTEGER;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderEligible" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "preOrderUpsellName" TEXT;
      ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "preOrderUpsellPriceCents" INTEGER;
      ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountKind" TEXT;
      ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountValue" INTEGER;
      ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "preOrderUpsellProductId" TEXT;
      ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "hideOnBusinessPage" BOOLEAN NOT NULL DEFAULT true;
      UPDATE "Product" SET "preOrderEligible" = true WHERE "isPreOrder" = true;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "PreOrderPage" (
        "id" TEXT NOT NULL,
        "standId" TEXT NOT NULL,
        "ownerId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "orderByAt" TIMESTAMP(3) NOT NULL,
        "collectionAt" TIMESTAMP(3) NOT NULL,
        "collectionNote" TEXT,
        "showExactStock" BOOLEAN NOT NULL DEFAULT false,
        "paymentTiming" "PaymentTiming" NOT NULL DEFAULT 'PAY_UPFRONT',
        "depositPercent" INTEGER,
        "handoverMode" "HandoverMode" NOT NULL DEFAULT 'COLLECT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PreOrderPage_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "PreOrderPage_standId_slug_key" ON "PreOrderPage"("standId", "slug");
      CREATE INDEX IF NOT EXISTS "PreOrderPage_standId_isActive_idx" ON "PreOrderPage"("standId", "isActive");
      CREATE TABLE IF NOT EXISTS "PreOrderPageProduct" (
        "id" TEXT NOT NULL,
        "preOrderPageId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "PreOrderPageProduct_pkey" PRIMARY KEY ("id")
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "PreOrderPageProduct_preOrderPageId_productId_key"
        ON "PreOrderPageProduct"("preOrderPageId", "productId");
      CREATE INDEX IF NOT EXISTS "PreOrderPageProduct_productId_idx" ON "PreOrderPageProduct"("productId");
    `);

    const { rows } = await client.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'Owner'
         AND column_name IN ('firstProductLiveAt', 'preOrdersCrossSellDismissedAt')
       ORDER BY 1`,
    );
    console.log(
      "Owner columns present:",
      rows.map((r) => r.column_name).join(", ") || "(none)",
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
