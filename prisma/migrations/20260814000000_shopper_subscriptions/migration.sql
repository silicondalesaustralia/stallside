-- CreateEnum
CREATE TYPE "ShopperSubInterval" AS ENUM ('WEEKLY', 'FORTNIGHTLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ShopperSubStatus" AS ENUM ('INCOMPLETE', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SubscriptionOffer" (
    "id" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "interval" "ShopperSubInterval" NOT NULL DEFAULT 'WEEKLY',
    "handoverMode" "HandoverMode" NOT NULL DEFAULT 'COLLECT',
    "collectionWeekday" INTEGER,
    "collectionNote" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionOfferProduct" (
    "id" TEXT NOT NULL,
    "subscriptionOfferId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubscriptionOfferProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopperSubscription" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" "ShopperSubStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "deliveryAddressLine1" TEXT,
    "deliverySuburb" TEXT,
    "deliveryPostcode" TEXT,
    "deliveryNotes" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "manageToken" TEXT NOT NULL,
    "skipNextCycle" BOOLEAN NOT NULL DEFAULT false,
    "pausedAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "currentPeriodEndsAt" TIMESTAMP(3),
    "nextCollectionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopperSubscription_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "shopperSubscriptionId" TEXT;
ALTER TABLE "Order" ADD COLUMN "stripeInvoiceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionOffer_standId_slug_key" ON "SubscriptionOffer"("standId", "slug");
CREATE INDEX "SubscriptionOffer_standId_isActive_idx" ON "SubscriptionOffer"("standId", "isActive");

CREATE UNIQUE INDEX "SubscriptionOfferProduct_subscriptionOfferId_productId_key" ON "SubscriptionOfferProduct"("subscriptionOfferId", "productId");
CREATE INDEX "SubscriptionOfferProduct_productId_idx" ON "SubscriptionOfferProduct"("productId");

CREATE UNIQUE INDEX "ShopperSubscription_manageToken_key" ON "ShopperSubscription"("manageToken");
CREATE UNIQUE INDEX "ShopperSubscription_stripeSubscriptionId_key" ON "ShopperSubscription"("stripeSubscriptionId");
CREATE INDEX "ShopperSubscription_standId_status_idx" ON "ShopperSubscription"("standId", "status");
CREATE INDEX "ShopperSubscription_ownerId_createdAt_idx" ON "ShopperSubscription"("ownerId", "createdAt");
CREATE INDEX "ShopperSubscription_offerId_idx" ON "ShopperSubscription"("offerId");

CREATE UNIQUE INDEX "Order_stripeInvoiceId_key" ON "Order"("stripeInvoiceId");
CREATE INDEX "Order_shopperSubscriptionId_idx" ON "Order"("shopperSubscriptionId");

-- AddForeignKey
ALTER TABLE "SubscriptionOffer" ADD CONSTRAINT "SubscriptionOffer_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionOffer" ADD CONSTRAINT "SubscriptionOffer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubscriptionOfferProduct" ADD CONSTRAINT "SubscriptionOfferProduct_subscriptionOfferId_fkey" FOREIGN KEY ("subscriptionOfferId") REFERENCES "SubscriptionOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionOfferProduct" ADD CONSTRAINT "SubscriptionOfferProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShopperSubscription" ADD CONSTRAINT "ShopperSubscription_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "SubscriptionOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShopperSubscription" ADD CONSTRAINT "ShopperSubscription_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShopperSubscription" ADD CONSTRAINT "ShopperSubscription_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_shopperSubscriptionId_fkey" FOREIGN KEY ("shopperSubscriptionId") REFERENCES "ShopperSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
