-- Idempotent: prod may already have Grow enums/tables from earlier experiments.

DO $$ BEGIN
  CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CampaignRecipientStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsentAt" TIMESTAMP(3),
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MarketingSuppression" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'unsubscribed',
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketingSuppression_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT NOT NULL,
    "previewText" TEXT,
    "heading" TEXT,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "audienceType" TEXT NOT NULL DEFAULT 'all_marketing',
    "audienceRefId" TEXT,
    "templateKey" TEXT,
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "attributedOrders" INTEGER NOT NULL DEFAULT 0,
    "attributedRevenueCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- Older Campaign shapes may omit columns we need.
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "audienceType" TEXT NOT NULL DEFAULT 'all_marketing';
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "audienceRefId" TEXT;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "templateKey" TEXT;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "previewText" TEXT;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "heading" TEXT;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "ctaLabel" TEXT;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "ctaUrl" TEXT;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "recipientCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "sentCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "failedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "clickCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "attributedOrders" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "attributedRevenueCents" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "CampaignRecipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "customerId" TEXT,
    "email" TEXT NOT NULL,
    "status" "CampaignRecipientStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "resendId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CampaignClick" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT,
    CONSTRAINT "CampaignClick_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "campaignId" TEXT;
ALTER TABLE "ShopperSubscription" ADD COLUMN IF NOT EXISTS "customerId" TEXT;
ALTER TABLE "RestockSubscriber" ADD COLUMN IF NOT EXISTS "customerId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Customer_ownerId_email_key" ON "Customer"("ownerId", "email");
CREATE INDEX IF NOT EXISTS "Customer_ownerId_createdAt_idx" ON "Customer"("ownerId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "MarketingSuppression_ownerId_email_key" ON "MarketingSuppression"("ownerId", "email");
CREATE INDEX IF NOT EXISTS "MarketingSuppression_ownerId_idx" ON "MarketingSuppression"("ownerId");
CREATE INDEX IF NOT EXISTS "Campaign_ownerId_status_idx" ON "Campaign"("ownerId", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "CampaignRecipient_campaignId_email_key" ON "CampaignRecipient"("campaignId", "email");
CREATE INDEX IF NOT EXISTS "CampaignRecipient_campaignId_status_idx" ON "CampaignRecipient"("campaignId", "status");
CREATE INDEX IF NOT EXISTS "CampaignRecipient_customerId_idx" ON "CampaignRecipient"("customerId");
CREATE UNIQUE INDEX IF NOT EXISTS "CampaignClick_token_key" ON "CampaignClick"("token");
CREATE INDEX IF NOT EXISTS "CampaignClick_campaignId_clickedAt_idx" ON "CampaignClick"("campaignId", "clickedAt");
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "Order_campaignId_idx" ON "Order"("campaignId");
CREATE INDEX IF NOT EXISTS "ShopperSubscription_customerId_idx" ON "ShopperSubscription"("customerId");
CREATE INDEX IF NOT EXISTS "RestockSubscriber_customerId_idx" ON "RestockSubscriber"("customerId");

DO $$ BEGIN
  ALTER TABLE "Customer" ADD CONSTRAINT "Customer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "MarketingSuppression" ADD CONSTRAINT "MarketingSuppression_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CampaignClick" ADD CONSTRAINT "CampaignClick_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD CONSTRAINT "Order_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ShopperSubscription" ADD CONSTRAINT "ShopperSubscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "RestockSubscriber" ADD CONSTRAINT "RestockSubscriber_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
