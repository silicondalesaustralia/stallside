-- AlterTable
ALTER TABLE "Product" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- Soft-deleted products become archived
UPDATE "Product" SET "isArchived" = true WHERE "isActive" = false;
