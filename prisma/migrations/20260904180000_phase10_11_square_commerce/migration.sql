-- Phase 10/11: commerce catalogue foundation + Square commerce

CREATE TYPE "CommerceProvider" AS ENUM ('SQUARE');
CREATE TYPE "ExternalConnectionStatus" AS ENUM ('PENDING', 'ACTIVE', 'NEEDS_REAUTH', 'DISCONNECTED', 'ERROR');
CREATE TYPE "SaleOrigin" AS ENUM ('VENDL_WEB', 'FARM_STAND', 'SQUARE_POS', 'MARKET', 'MANUAL');
CREATE TYPE "OnlinePaymentProvider" AS ENUM ('STRIPE', 'SQUARE');

ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'SQUARE';
ALTER TYPE "InventorySource" ADD VALUE IF NOT EXISTS 'ORDER_SQUARE';
ALTER TYPE "InventorySource" ADD VALUE IF NOT EXISTS 'EXTERNAL_SYNC';
ALTER TYPE "InventorySource" ADD VALUE IF NOT EXISTS 'EXTERNAL_POS';
ALTER TYPE "InventorySource" ADD VALUE IF NOT EXISTS 'RECONCILIATION';

ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "onlinePaymentProvider" "OnlinePaymentProvider" NOT NULL DEFAULT 'STRIPE';

ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "acceptSquare" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "saleOrigin" "SaleOrigin" NOT NULL DEFAULT 'VENDL_WEB';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "onlinePaymentProvider" "OnlinePaymentProvider";
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "squarePaymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "squareOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "squareLocationId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Order_squarePaymentId_key" ON "Order"("squarePaymentId");
CREATE INDEX IF NOT EXISTS "Order_squarePaymentId_idx" ON "Order"("squarePaymentId");

ALTER TABLE "InventoryAdjustment" ADD COLUMN IF NOT EXISTS "externalEventId" TEXT;
ALTER TABLE "InventoryAdjustment" ADD COLUMN IF NOT EXISTS "externalReference" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "InventoryAdjustment_externalEventId_key" ON "InventoryAdjustment"("externalEventId");
CREATE INDEX IF NOT EXISTS "InventoryAdjustment_externalReference_idx" ON "InventoryAdjustment"("externalReference");

CREATE TABLE IF NOT EXISTS "ExternalCommerceConnection" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "provider" "CommerceProvider" NOT NULL,
    "providerMerchantId" TEXT NOT NULL,
    "status" "ExternalConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "accessTokenEnc" TEXT,
    "refreshTokenEnc" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "merchantName" TEXT,
    "primaryLocationId" TEXT,
    "paymentsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "inventorySyncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "catalogSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "disconnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExternalCommerceConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ExternalCommerceConnection_ownerId_provider_key" ON "ExternalCommerceConnection"("ownerId", "provider");
CREATE UNIQUE INDEX IF NOT EXISTS "ExternalCommerceConnection_provider_providerMerchantId_key" ON "ExternalCommerceConnection"("provider", "providerMerchantId");
CREATE INDEX IF NOT EXISTS "ExternalCommerceConnection_ownerId_status_idx" ON "ExternalCommerceConnection"("ownerId", "status");

CREATE TABLE IF NOT EXISTS "ExternalLocationMapping" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "providerLocationId" TEXT NOT NULL,
    "providerLocationName" TEXT,
    "standId" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExternalLocationMapping_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ExternalLocationMapping_connectionId_providerLocationId_key" ON "ExternalLocationMapping"("connectionId", "providerLocationId");
CREATE INDEX IF NOT EXISTS "ExternalLocationMapping_standId_idx" ON "ExternalLocationMapping"("standId");

CREATE TABLE IF NOT EXISTS "ExternalProductMapping" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "providerProductId" TEXT NOT NULL,
    "inventorySyncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "confirmedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExternalProductMapping_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ExternalProductMapping_connectionId_productId_key" ON "ExternalProductMapping"("connectionId", "productId");
CREATE UNIQUE INDEX IF NOT EXISTS "ExternalProductMapping_connectionId_providerProductId_key" ON "ExternalProductMapping"("connectionId", "providerProductId");
CREATE INDEX IF NOT EXISTS "ExternalProductMapping_productId_idx" ON "ExternalProductMapping"("productId");

CREATE TABLE IF NOT EXISTS "ExternalVariantMapping" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "providerVariationId" TEXT NOT NULL,
    "providerSku" TEXT,
    "inventorySyncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "confirmedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExternalVariantMapping_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ExternalVariantMapping_connectionId_productId_key" ON "ExternalVariantMapping"("connectionId", "productId");
CREATE UNIQUE INDEX IF NOT EXISTS "ExternalVariantMapping_connectionId_providerVariationId_key" ON "ExternalVariantMapping"("connectionId", "providerVariationId");
CREATE INDEX IF NOT EXISTS "ExternalVariantMapping_productId_idx" ON "ExternalVariantMapping"("productId");

CREATE TABLE IF NOT EXISTS "SquareWebhookReceipt" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "merchantId" TEXT,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "processError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SquareWebhookReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SquareWebhookReceipt_eventId_key" ON "SquareWebhookReceipt"("eventId");
CREATE INDEX IF NOT EXISTS "SquareWebhookReceipt_processedAt_createdAt_idx" ON "SquareWebhookReceipt"("processedAt", "createdAt");
CREATE INDEX IF NOT EXISTS "SquareWebhookReceipt_merchantId_idx" ON "SquareWebhookReceipt"("merchantId");

ALTER TABLE "ExternalCommerceConnection" ADD CONSTRAINT "ExternalCommerceConnection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExternalLocationMapping" ADD CONSTRAINT "ExternalLocationMapping_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ExternalCommerceConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExternalLocationMapping" ADD CONSTRAINT "ExternalLocationMapping_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExternalProductMapping" ADD CONSTRAINT "ExternalProductMapping_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ExternalCommerceConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExternalProductMapping" ADD CONSTRAINT "ExternalProductMapping_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExternalVariantMapping" ADD CONSTRAINT "ExternalVariantMapping_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ExternalCommerceConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExternalVariantMapping" ADD CONSTRAINT "ExternalVariantMapping_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SquareWebhookReceipt" ADD CONSTRAINT "SquareWebhookReceipt_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ExternalCommerceConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
