-- AlterTable
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "businessMode" TEXT;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT 'AU';
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "stateTerritory" TEXT;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "suburb" TEXT;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "postcode" TEXT;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "abn" TEXT;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "gstRegistered" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "pricesIncludeGst" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "shortDescription" TEXT;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "sellCategories" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "fulfilmentIntents" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP(3);
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "brandAccentColor" TEXT;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "brandSecondaryColor" TEXT;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "brandLogoUrl" TEXT;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "defaultTimezone" TEXT NOT NULL DEFAULT 'Australia/Adelaide';

-- Legacy owners: do not force the new wizard.
UPDATE "Owner"
SET
  "onboardingCompletedAt" = COALESCE("onboardingCompletedAt", "createdAt"),
  "businessMode" = COALESCE("businessMode", 'BOTH'),
  "country" = COALESCE(NULLIF("country", ''), 'AU')
WHERE "onboardingCompletedAt" IS NULL;
