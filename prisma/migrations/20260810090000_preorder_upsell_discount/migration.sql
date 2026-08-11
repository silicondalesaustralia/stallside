-- Pre-order add-on discount (percent or amount off list price).
ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountKind" TEXT;
ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountValue" INTEGER;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountKind" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrderUpsellDiscountValue" INTEGER;
