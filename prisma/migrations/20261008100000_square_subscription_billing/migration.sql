-- AlterTable
ALTER TABLE "ShopperSubscription" ADD COLUMN     "billingFailures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "billingLockedUntil" TIMESTAMP(3),
ADD COLUMN     "billingRetryAt" TIMESTAMP(3),
ADD COLUMN     "lastPaymentAt" TIMESTAMP(3),
ADD COLUMN     "nextBillingAt" TIMESTAMP(3),
ADD COLUMN     "paymentProvider" "OnlinePaymentProvider" NOT NULL DEFAULT 'STRIPE',
ADD COLUMN     "recurringPriceCents" INTEGER,
ADD COLUMN     "squareCardId" TEXT,
ADD COLUMN     "squareCardLabel" TEXT,
ADD COLUMN     "squareCustomerId" TEXT;

-- AlterTable
ALTER TABLE "ExternalCommerceConnection" ADD COLUMN     "subscriptionsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ShopperSubscriptionCharge" (
    "id" TEXT NOT NULL,
    "shopperSubscriptionId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "appFeeCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "squarePaymentId" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopperSubscriptionCharge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopperSubscriptionCharge_squarePaymentId_key" ON "ShopperSubscriptionCharge"("squarePaymentId");

-- CreateIndex
CREATE INDEX "ShopperSubscriptionCharge_shopperSubscriptionId_createdAt_idx" ON "ShopperSubscriptionCharge"("shopperSubscriptionId", "createdAt");

-- CreateIndex
CREATE INDEX "ShopperSubscriptionCharge_ownerId_createdAt_idx" ON "ShopperSubscriptionCharge"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "ShopperSubscription_paymentProvider_status_nextBillingAt_idx" ON "ShopperSubscription"("paymentProvider", "status", "nextBillingAt");

-- AddForeignKey
ALTER TABLE "ShopperSubscriptionCharge" ADD CONSTRAINT "ShopperSubscriptionCharge_shopperSubscriptionId_fkey" FOREIGN KEY ("shopperSubscriptionId") REFERENCES "ShopperSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
