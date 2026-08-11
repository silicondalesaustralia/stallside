-- CreateEnum
CREATE TYPE "PaymentTiming" AS ENUM ('PAY_NOW', 'PAY_UPFRONT', 'DEPOSIT_THEN_BALANCE');

-- CreateEnum
CREATE TYPE "HandoverMode" AS ENUM ('COLLECT', 'DELIVER');

-- AlterEnum PaymentStatus
ALTER TYPE "PaymentStatus" ADD VALUE 'DEPOSIT_PAID';
ALTER TYPE "PaymentStatus" ADD VALUE 'BALANCE_DUE';
ALTER TYPE "PaymentStatus" ADD VALUE 'BALANCE_FAILED';

-- AlterTable Owner
ALTER TABLE "Owner" ADD COLUMN "firstProductLiveAt" TIMESTAMP(3);
ALTER TABLE "Owner" ADD COLUMN "preOrdersCrossSellDismissedAt" TIMESTAMP(3);

-- AlterTable Stand
ALTER TABLE "Stand" ADD COLUMN "verticalSlug" TEXT;

-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN "paymentTiming" "PaymentTiming" NOT NULL DEFAULT 'PAY_NOW';
ALTER TABLE "Product" ADD COLUMN "depositPercent" INTEGER;
ALTER TABLE "Product" ADD COLUMN "handoverMode" "HandoverMode" NOT NULL DEFAULT 'COLLECT';

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN "paymentTiming" "PaymentTiming" NOT NULL DEFAULT 'PAY_NOW';
ALTER TABLE "Order" ADD COLUMN "handoverMode" "HandoverMode" NOT NULL DEFAULT 'COLLECT';
ALTER TABLE "Order" ADD COLUMN "depositCents" INTEGER;
ALTER TABLE "Order" ADD COLUMN "balanceCents" INTEGER;
ALTER TABLE "Order" ADD COLUMN "balanceDueAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "stripePaymentMethodId" TEXT;
ALTER TABLE "Order" ADD COLUMN "balancePaymentIntentId" TEXT;
ALTER TABLE "Order" ADD COLUMN "balanceRetryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "balanceLastFailedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "deliveryAddressLine1" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliverySuburb" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryPostcode" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryNotes" TEXT;

-- Backfill take-now vs pre-order
UPDATE "Product"
SET "paymentTiming" = 'PAY_UPFRONT'
WHERE "isPreOrder" = true;

UPDATE "Order"
SET "paymentTiming" = 'PAY_UPFRONT'
WHERE "isPreOrder" = true;

-- CreateIndex
CREATE INDEX "Order_paymentStatus_balanceDueAt_idx" ON "Order"("paymentStatus", "balanceDueAt");
