-- CreateEnum
CREATE TYPE "ProductChannelType" AS ENUM ('STAND', 'ONLINE');

-- CreateTable
CREATE TABLE "Category" (
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

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductChannel" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "channelType" "ProductChannelType" NOT NULL,
    "standId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsentAt" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerId" TEXT;
ALTER TABLE "ShopperSubscription" ADD COLUMN IF NOT EXISTS "customerId" TEXT;
ALTER TABLE "RestockSubscriber" ADD COLUMN IF NOT EXISTS "customerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_ownerId_slug_key" ON "Category"("ownerId", "slug");
CREATE INDEX "Category_ownerId_sortOrder_idx" ON "Category"("ownerId", "sortOrder");

CREATE UNIQUE INDEX "ProductCategory_productId_categoryId_key" ON "ProductCategory"("productId", "categoryId");
CREATE INDEX "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");

CREATE UNIQUE INDEX "ProductChannel_productId_channelType_standId_key" ON "ProductChannel"("productId", "channelType", "standId");
CREATE INDEX "ProductChannel_standId_channelType_isEnabled_idx" ON "ProductChannel"("standId", "channelType", "isEnabled");
CREATE INDEX "ProductChannel_productId_idx" ON "ProductChannel"("productId");

CREATE UNIQUE INDEX "Customer_ownerId_email_key" ON "Customer"("ownerId", "email");
CREATE INDEX "Customer_ownerId_createdAt_idx" ON "Customer"("ownerId", "createdAt");

CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX "ShopperSubscription_customerId_idx" ON "ShopperSubscription"("customerId");
CREATE INDEX "RestockSubscriber_customerId_idx" ON "RestockSubscriber"("customerId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductChannel" ADD CONSTRAINT "ProductChannel_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductChannel" ADD CONSTRAINT "ProductChannel_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShopperSubscription" ADD CONSTRAINT "ShopperSubscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RestockSubscriber" ADD CONSTRAINT "RestockSubscriber_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
