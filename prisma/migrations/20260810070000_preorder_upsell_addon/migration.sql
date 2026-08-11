-- Pre-order cart add-ons (name/price → hidden linked product).
ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "preOrderUpsellName" TEXT;
ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "preOrderUpsellPriceCents" INTEGER;
ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "preOrderUpsellProductId" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderUpsellName" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderUpsellPriceCents" INTEGER;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderUpsellProductId" TEXT;
