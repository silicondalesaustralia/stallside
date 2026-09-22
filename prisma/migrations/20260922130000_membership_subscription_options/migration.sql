-- CreateEnum
CREATE TYPE "SubscriptionOfferKind" AS ENUM ('BOX', 'MEMBERSHIP');

-- CreateEnum
CREATE TYPE "MembershipBillingPlan" AS ENUM ('WEEKLY', 'MONTHLY', 'UPFRONT');

-- AlterTable SubscriptionOffer
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "kind" "SubscriptionOfferKind" NOT NULL DEFAULT 'BOX';
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "imageUrl" TEXT;
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "termWeeks" INTEGER;
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "weeklyPriceCents" INTEGER;
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "monthlyPriceCents" INTEGER;
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "upfrontPriceCents" INTEGER;
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "upfrontBenefitsText" TEXT;
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "termsText" TEXT;
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "stripeWeeklyPriceId" TEXT;
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "stripeMonthlyPriceId" TEXT;
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "stripeUpfrontPriceId" TEXT;
ALTER TABLE "SubscriptionOffer" ADD COLUMN     "fulfillmentProductId" TEXT;

-- AlterTable ShopperSubscription
ALTER TABLE "ShopperSubscription" ADD COLUMN     "billingPlan" "MembershipBillingPlan";
ALTER TABLE "ShopperSubscription" ADD COLUMN     "termEndsAt" TIMESTAMP(3);
ALTER TABLE "ShopperSubscription" ADD COLUMN     "collectionsRemaining" INTEGER;
ALTER TABLE "ShopperSubscription" ADD COLUMN     "paidThroughAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "SubscriptionOffer_fulfillmentProductId_idx" ON "SubscriptionOffer"("fulfillmentProductId");

-- CreateIndex
CREATE INDEX "ShopperSubscription_status_nextCollectionAt_idx" ON "ShopperSubscription"("status", "nextCollectionAt");

-- AddForeignKey
ALTER TABLE "SubscriptionOffer" ADD CONSTRAINT "SubscriptionOffer_fulfillmentProductId_fkey" FOREIGN KEY ("fulfillmentProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
