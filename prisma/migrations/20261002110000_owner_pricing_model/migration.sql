-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('LEGACY', 'V2026');

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN "pricingModel" "PricingModel" NOT NULL DEFAULT 'V2026',
ADD COLUMN "pricingModelChangedAt" TIMESTAMP(3),
ADD COLUMN "pricingModelReason" TEXT,
ADD COLUMN "lifetimeEndedAt" TIMESTAMP(3);

-- Grandfather every existing owner
UPDATE "Owner" SET "pricingModel" = 'LEGACY';
