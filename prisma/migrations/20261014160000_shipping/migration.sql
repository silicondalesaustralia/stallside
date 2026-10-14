-- CreateEnum
CREATE TYPE "ShippingMode" AS ENUM ('FREE', 'FLAT', 'CUSTOM');

-- AlterTable
ALTER TABLE "Stand" ADD COLUMN "shippingMode" "ShippingMode" NOT NULL DEFAULT 'FREE',
ADD COLUMN "shippingFlatCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "shippingFreeOverCents" INTEGER;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "shippingCents" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "shippingCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "shippingCarrier" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "trackingUrl" TEXT,
ADD COLUMN "shippedAt" TIMESTAMP(3),
ADD COLUMN "deliveredAt" TIMESTAMP(3);
