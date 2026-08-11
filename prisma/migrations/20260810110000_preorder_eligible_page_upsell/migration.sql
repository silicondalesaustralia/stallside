-- Product eligibility for pre-order pages; page-level add-on upsell.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderEligible" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Product" SET "preOrderEligible" = true WHERE "isPreOrder" = true;

ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "preOrderUpsellName" TEXT;
ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "preOrderUpsellPriceCents" INTEGER;
ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountKind" TEXT;
ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountValue" INTEGER;
ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "preOrderUpsellProductId" TEXT;
