-- AlterTable
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "welcomeChoice" TEXT,
ADD COLUMN IF NOT EXISTS "welcomeChoiceAt" TIMESTAMP(3);

-- Existing accounts never see the post-signup welcome screen.
UPDATE "Owner" SET "welcomeChoice" = 'legacy', "welcomeChoiceAt" = "createdAt" WHERE "welcomeChoiceAt" IS NULL;
