-- Idempotent: Category / ProductCategory may already exist on databases that
-- received the staging catalogue migrations.

CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "showOnWebsite" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "ProductCategory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_ownerId_slug_key" ON "Category"("ownerId", "slug");
CREATE INDEX IF NOT EXISTS "Category_ownerId_sortOrder_idx" ON "Category"("ownerId", "sortOrder");
CREATE UNIQUE INDEX IF NOT EXISTS "ProductCategory_productId_categoryId_key" ON "ProductCategory"("productId", "categoryId");
CREATE INDEX IF NOT EXISTS "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Category_ownerId_fkey') THEN
    ALTER TABLE "Category" ADD CONSTRAINT "Category_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductCategory_productId_fkey') THEN
    ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductCategory_categoryId_fkey') THEN
    ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StandShopLayout') THEN
    CREATE TYPE "StandShopLayout" AS ENUM ('ALL_PRODUCTS', 'CATEGORIES');
  END IF;
END $$;

ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "shopLayout" "StandShopLayout" NOT NULL DEFAULT 'ALL_PRODUCTS';
