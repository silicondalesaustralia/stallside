-- CreateEnum
CREATE TYPE "MenuKind" AS ENUM ('ALWAYS_AVAILABLE', 'PREORDER_DROP');

-- AlterEnum
ALTER TYPE "FulfilmentOptionKind" ADD VALUE 'MENU_SHEET';

-- AlterTable
ALTER TABLE "FulfilmentOption" ADD COLUMN "menuId" TEXT;

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "kind" "MenuKind" NOT NULL DEFAULT 'ALWAYS_AVAILABLE',
    "hideOnBusinessPage" BOOLEAN NOT NULL DEFAULT false,
    "showOnStand" BOOLEAN NOT NULL DEFAULT true,
    "showOnShop" BOOLEAN NOT NULL DEFAULT true,
    "orderByAt" TIMESTAMP(3),
    "collectionAt" TIMESTAMP(3),
    "collectionNote" TEXT,
    "showExactStock" BOOLEAN NOT NULL DEFAULT false,
    "paymentTiming" "PaymentTiming" NOT NULL DEFAULT 'PAY_UPFRONT',
    "depositPercent" INTEGER,
    "handoverMode" "HandoverMode" NOT NULL DEFAULT 'COLLECT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuProduct" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Menu_standId_slug_key" ON "Menu"("standId", "slug");

-- CreateIndex
CREATE INDEX "Menu_standId_isActive_kind_idx" ON "Menu"("standId", "isActive", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "MenuProduct_menuId_productId_key" ON "MenuProduct"("menuId", "productId");

-- CreateIndex
CREATE INDEX "MenuProduct_productId_idx" ON "MenuProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "FulfilmentOption_menuId_key" ON "FulfilmentOption"("menuId");

-- AddForeignKey
ALTER TABLE "FulfilmentOption" ADD CONSTRAINT "FulfilmentOption_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuProduct" ADD CONSTRAINT "MenuProduct_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuProduct" ADD CONSTRAINT "MenuProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
