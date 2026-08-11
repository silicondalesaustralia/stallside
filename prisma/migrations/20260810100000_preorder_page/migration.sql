-- Multi-product pre-order pages (shared collection day, one public link).
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
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PreOrderPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PreOrderPage_standId_slug_key" ON "PreOrderPage"("standId", "slug");
CREATE INDEX IF NOT EXISTS "PreOrderPage_standId_isActive_idx" ON "PreOrderPage"("standId", "isActive");

DO $$ BEGIN
  ALTER TABLE "PreOrderPage" ADD CONSTRAINT "PreOrderPage_standId_fkey"
    FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PreOrderPage" ADD CONSTRAINT "PreOrderPage_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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

DO $$ BEGIN
  ALTER TABLE "PreOrderPageProduct" ADD CONSTRAINT "PreOrderPageProduct_preOrderPageId_fkey"
    FOREIGN KEY ("preOrderPageId") REFERENCES "PreOrderPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PreOrderPageProduct" ADD CONSTRAINT "PreOrderPageProduct_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
