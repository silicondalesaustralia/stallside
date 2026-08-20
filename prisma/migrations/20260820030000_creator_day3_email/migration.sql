-- AlterTable
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "creatorDay3SentAt" TIMESTAMP(3);

-- Existing owners at cutover: skip Day 3 creator note (only new signups get it).
UPDATE "Owner"
SET "creatorDay3SentAt" = COALESCE("creatorDay3SentAt", CURRENT_TIMESTAMP)
WHERE "creatorDay3SentAt" IS NULL;
