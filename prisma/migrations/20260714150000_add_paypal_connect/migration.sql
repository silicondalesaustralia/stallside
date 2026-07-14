-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'PAYPAL';
ALTER TYPE "InventorySource" ADD VALUE 'ORDER_PAYPAL';

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN "paypalMerchantId" TEXT;
ALTER TABLE "Owner" ADD COLUMN "paypalOnboardingComplete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Owner" ADD COLUMN "paypalPaymentsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paypalOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN "paypalCaptureId" TEXT;
