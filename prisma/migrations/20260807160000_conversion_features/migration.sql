-- Conversion features v2: tiers, upsell, first-order, freshness, poster blocks

ALTER TABLE "Stand" ADD COLUMN "upsellProductId" TEXT;
ALTER TABLE "Stand" ADD COLUMN "upsellPriceCents" INTEGER;
ALTER TABLE "Stand" ADD COLUMN "firstOrderDiscountEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Stand" ADD COLUMN "firstOrderDiscountPercent" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Stand" ADD COLUMN "firstOrderDiscountAmountCents" INTEGER;
ALTER TABLE "Stand" ADD COLUMN "showPublicScarcity" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Stand" ADD COLUMN "posterShowCta" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Stand" ADD COLUMN "posterCtaText" TEXT;
ALTER TABLE "Stand" ADD COLUMN "posterShowBundles" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Stand" ADD COLUMN "posterShowFirstOrder" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Stand" ADD COLUMN "posterShowInstructions" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Stand" ADD COLUMN "posterShowFreshness" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Stand" ADD COLUMN "posterShowHowItWorks" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Product" ADD COLUMN "freshnessNote" TEXT;
ALTER TABLE "Product" ADD COLUMN "priceTiers" JSONB;

ALTER TABLE "Order" ADD COLUMN "discountCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "discountLabel" TEXT;
