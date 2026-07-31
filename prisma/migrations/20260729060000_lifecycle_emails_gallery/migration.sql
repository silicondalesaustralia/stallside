-- CreateEnum
CREATE TYPE "GalleryStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "GallerySource" AS ENUM ('ADMIN', 'OWNER_SUBMIT');

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN "trialWelcomeSentAt" TIMESTAMP(3),
ADD COLUMN "trialDay7SentAt" TIMESTAMP(3),
ADD COLUMN "trialDay14SentAt" TIMESTAMP(3),
ADD COLUMN "trialDay28SentAt" TIMESTAMP(3),
ADD COLUMN "cashWelcomeSentAt" TIMESTAMP(3),
ADD COLUMN "cashSubscribedAt" TIMESTAMP(3),
ADD COLUMN "cashUpgradeDay2SentAt" TIMESTAMP(3),
ADD COLUMN "cashUpgradeDay7SentAt" TIMESTAMP(3),
ADD COLUMN "cashUpgradeDay14SentAt" TIMESTAMP(3),
ADD COLUMN "cardWelcomeSentAt" TIMESTAMP(3),
ADD COLUMN "firstTenOrdersEmailSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GalleryStand" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "source" "GallerySource" NOT NULL,
    "status" "GalleryStatus" NOT NULL DEFAULT 'PENDING',
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "ownerId" TEXT,
    "standId" TEXT,
    "consentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryStand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryStand_status_sortOrder_idx" ON "GalleryStand"("status", "sortOrder");

-- AddForeignKey
ALTER TABLE "GalleryStand" ADD CONSTRAINT "GalleryStand_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed Alexa’s Egg Stand as first gallery entry
INSERT INTO "GalleryStand" ("id", "displayName", "location", "imageUrl", "caption", "source", "status", "sortOrder", "createdAt", "updatedAt")
VALUES (
  'seed_alexas_egg_stand',
  'Alexa''s Egg Stand',
  'Regional Australia',
  '/about/alexas-egg-stand-roadside-front.jpg',
  'Her stall, still at the road - now with a Stallside QR on it.',
  'ADMIN',
  'APPROVED',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
