-- Owner-only product identifiers and cost (not shown on public storefront).
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "costCents" INTEGER;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "upc" TEXT;
