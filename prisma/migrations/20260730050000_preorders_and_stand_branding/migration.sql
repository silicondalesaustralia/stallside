-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('ORDERED', 'READY', 'COLLECTED');

-- AlterTable Stand
ALTER TABLE "Stand" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "Stand" ADD COLUMN "accentColor" TEXT;

-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN "isPreOrder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "orderByAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "collectionAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "collectionNote" TEXT;

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN "isPreOrder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "collectionAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "collectionNote" TEXT;
ALTER TABLE "Order" ADD COLUMN "customerName" TEXT;
ALTER TABLE "Order" ADD COLUMN "customerPhone" TEXT;
ALTER TABLE "Order" ADD COLUMN "collectionStatus" "CollectionStatus";

-- CreateIndex
CREATE INDEX "Order_standId_collectionAt_collectionStatus_idx" ON "Order"("standId", "collectionAt", "collectionStatus");
