-- AlterTable
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "proOnboardingStartedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LifecycleEmailSend" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "emailKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifecycleEmailSend_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LifecycleEmailSend_ownerId_emailKey_key" ON "LifecycleEmailSend"("ownerId", "emailKey");
CREATE INDEX IF NOT EXISTS "LifecycleEmailSend_ownerId_createdAt_idx" ON "LifecycleEmailSend"("ownerId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "LifecycleEmailSend" ADD CONSTRAINT "LifecycleEmailSend_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
