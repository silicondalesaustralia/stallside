-- Phase 5A: reusable fulfilment architecture

CREATE TYPE "FulfilmentOptionKind" AS ENUM ('STAND_IMMEDIATE', 'PICKUP', 'DELIVERY', 'PREORDER_SHEET', 'SUBSCRIPTION');
CREATE TYPE "PickupLocationType" AS ENUM ('HOME', 'FARM_STAND', 'FARM_GATE', 'MARKET', 'SHOP', 'OTHER');
CREATE TYPE "PickupWindowRecurrence" AS ENUM ('ONE_OFF', 'WEEKLY');
CREATE TYPE "DeliveryZoneRuleKind" AS ENUM ('POSTCODE', 'SUBURB');
CREATE TYPE "FulfilmentStatus" AS ENUM ('NEW', 'PREPARING', 'READY', 'COLLECTED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

CREATE TABLE "PickupLocation" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "standId" TEXT,
    "type" "PickupLocationType" NOT NULL DEFAULT 'OTHER',
    "name" TEXT NOT NULL,
    "publicLabel" TEXT NOT NULL,
    "addressLine1" TEXT,
    "suburb" TEXT,
    "stateTerritory" TEXT,
    "postcode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "publicInstructions" TEXT,
    "privateInstructions" TEXT,
    "showFullAddressBeforePurchase" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PickupLocation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PickupWindow" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "pickupLocationId" TEXT,
    "label" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Australia/Adelaide',
    "recurrence" "PickupWindowRecurrence" NOT NULL DEFAULT 'WEEKLY',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "weekday" INTEGER,
    "startTimeMin" INTEGER,
    "endTimeMin" INTEGER,
    "orderOpensAt" TIMESTAMP(3),
    "orderClosesAt" TIMESTAMP(3),
    "orderOpenWeekday" INTEGER,
    "orderOpenTimeMin" INTEGER,
    "orderCloseWeekday" INTEGER,
    "orderCloseTimeMin" INTEGER,
    "maxOrders" INTEGER,
    "pickupFeeCents" INTEGER NOT NULL DEFAULT 0,
    "minOrderCents" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PickupWindow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deliveryFeeCents" INTEGER NOT NULL DEFAULT 0,
    "freeDeliveryMinCents" INTEGER,
    "minOrderCents" INTEGER NOT NULL DEFAULT 0,
    "timezone" TEXT NOT NULL DEFAULT 'Australia/Adelaide',
    "recurrence" "PickupWindowRecurrence" NOT NULL DEFAULT 'WEEKLY',
    "weekday" INTEGER,
    "startTimeMin" INTEGER,
    "endTimeMin" INTEGER,
    "orderCloseWeekday" INTEGER,
    "orderCloseTimeMin" INTEGER,
    "customerInstructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryZoneRule" (
    "id" TEXT NOT NULL,
    "deliveryZoneId" TEXT NOT NULL,
    "kind" "DeliveryZoneRuleKind" NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "DeliveryZoneRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FulfilmentOption" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "kind" "FulfilmentOptionKind" NOT NULL,
    "label" TEXT NOT NULL,
    "standId" TEXT,
    "pickupLocationId" TEXT,
    "pickupWindowId" TEXT,
    "deliveryZoneId" TEXT,
    "preOrderPageId" TEXT,
    "subscriptionOfferId" TEXT,
    "handoverMode" "HandoverMode" NOT NULL DEFAULT 'COLLECT',
    "paymentTiming" "PaymentTiming" NOT NULL DEFAULT 'PAY_NOW',
    "depositPercent" INTEGER,
    "minOrderCents" INTEGER NOT NULL DEFAULT 0,
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "channels" TEXT[] DEFAULT ARRAY['STAND']::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FulfilmentOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductFulfilmentOption" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fulfilmentOptionId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ProductFulfilmentOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderFulfilment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fulfilmentOptionId" TEXT,
    "kind" "FulfilmentOptionKind" NOT NULL,
    "optionLabel" TEXT NOT NULL,
    "pickupLocationName" TEXT,
    "pickupPublicLabel" TEXT,
    "pickupAddressSnapshot" TEXT,
    "pickupInstructions" TEXT,
    "pickupPrivateInstructions" TEXT,
    "windowLabel" TEXT,
    "collectionStartsAt" TIMESTAMP(3),
    "collectionEndsAt" TIMESTAMP(3),
    "deliveryZoneName" TEXT,
    "deliveryFeeCents" INTEGER NOT NULL DEFAULT 0,
    "handoverMode" "HandoverMode" NOT NULL,
    "fulfilmentStatus" "FulfilmentStatus" NOT NULL DEFAULT 'NEW',
    "sellerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderFulfilment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeliveryZoneRule_deliveryZoneId_kind_value_key" ON "DeliveryZoneRule"("deliveryZoneId", "kind", "value");
CREATE UNIQUE INDEX "FulfilmentOption_preOrderPageId_key" ON "FulfilmentOption"("preOrderPageId");
CREATE UNIQUE INDEX "FulfilmentOption_subscriptionOfferId_key" ON "FulfilmentOption"("subscriptionOfferId");
CREATE UNIQUE INDEX "ProductFulfilmentOption_productId_fulfilmentOptionId_key" ON "ProductFulfilmentOption"("productId", "fulfilmentOptionId");
CREATE UNIQUE INDEX "OrderFulfilment_orderId_key" ON "OrderFulfilment"("orderId");

CREATE INDEX "PickupLocation_ownerId_isActive_sortOrder_idx" ON "PickupLocation"("ownerId", "isActive", "sortOrder");
CREATE INDEX "PickupWindow_ownerId_isActive_idx" ON "PickupWindow"("ownerId", "isActive");
CREATE INDEX "DeliveryZone_ownerId_isActive_sortOrder_idx" ON "DeliveryZone"("ownerId", "isActive", "sortOrder");
CREATE INDEX "FulfilmentOption_ownerId_kind_isActive_sortOrder_idx" ON "FulfilmentOption"("ownerId", "kind", "isActive", "sortOrder");
CREATE INDEX "FulfilmentOption_standId_idx" ON "FulfilmentOption"("standId");
CREATE INDEX "ProductFulfilmentOption_fulfilmentOptionId_idx" ON "ProductFulfilmentOption"("fulfilmentOptionId");
CREATE INDEX "OrderFulfilment_collectionStartsAt_fulfilmentStatus_idx" ON "OrderFulfilment"("collectionStartsAt", "fulfilmentStatus");
CREATE INDEX "OrderFulfilment_fulfilmentOptionId_idx" ON "OrderFulfilment"("fulfilmentOptionId");

ALTER TABLE "PickupLocation" ADD CONSTRAINT "PickupLocation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PickupLocation" ADD CONSTRAINT "PickupLocation_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PickupWindow" ADD CONSTRAINT "PickupWindow_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PickupWindow" ADD CONSTRAINT "PickupWindow_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "PickupLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DeliveryZone" ADD CONSTRAINT "DeliveryZone_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliveryZoneRule" ADD CONSTRAINT "DeliveryZoneRule_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FulfilmentOption" ADD CONSTRAINT "FulfilmentOption_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FulfilmentOption" ADD CONSTRAINT "FulfilmentOption_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FulfilmentOption" ADD CONSTRAINT "FulfilmentOption_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "PickupLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FulfilmentOption" ADD CONSTRAINT "FulfilmentOption_pickupWindowId_fkey" FOREIGN KEY ("pickupWindowId") REFERENCES "PickupWindow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FulfilmentOption" ADD CONSTRAINT "FulfilmentOption_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FulfilmentOption" ADD CONSTRAINT "FulfilmentOption_preOrderPageId_fkey" FOREIGN KEY ("preOrderPageId") REFERENCES "PreOrderPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FulfilmentOption" ADD CONSTRAINT "FulfilmentOption_subscriptionOfferId_fkey" FOREIGN KEY ("subscriptionOfferId") REFERENCES "SubscriptionOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductFulfilmentOption" ADD CONSTRAINT "ProductFulfilmentOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductFulfilmentOption" ADD CONSTRAINT "ProductFulfilmentOption_fulfilmentOptionId_fkey" FOREIGN KEY ("fulfilmentOptionId") REFERENCES "FulfilmentOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderFulfilment" ADD CONSTRAINT "OrderFulfilment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderFulfilment" ADD CONSTRAINT "OrderFulfilment_fulfilmentOptionId_fkey" FOREIGN KEY ("fulfilmentOptionId") REFERENCES "FulfilmentOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
