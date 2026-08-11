-- Per-product cart upsell (optional; overrides stand-level when set).
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "upsellProductId" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "upsellPriceCents" INTEGER;
