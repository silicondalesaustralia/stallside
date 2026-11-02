-- AlterTable
ALTER TABLE "Storefront" ADD COLUMN     "trackingSecrets" JSONB;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "trackingAttribution" JSONB;
