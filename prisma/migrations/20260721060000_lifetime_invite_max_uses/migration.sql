-- AlterTable: seat caps for shareable invite links
ALTER TABLE "LifetimeInvite" ADD COLUMN "maxUses" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "LifetimeInvite" ADD COLUMN "useCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill one-use invites that were already redeemed
UPDATE "LifetimeInvite" SET "useCount" = 1 WHERE "usedAt" IS NOT NULL;

-- CreateTable
CREATE TABLE "LifetimeInviteRedemption" (
    "id" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifetimeInviteRedemption_pkey" PRIMARY KEY ("id")
);

-- Backfill redemptions from legacy used-by columns
INSERT INTO "LifetimeInviteRedemption" ("id", "inviteId", "email", "userId", "createdAt")
SELECT
  gen_random_uuid()::text,
  "id",
  COALESCE("usedByEmail", 'unknown@unknown'),
  "usedByUserId",
  COALESCE("usedAt", CURRENT_TIMESTAMP)
FROM "LifetimeInvite"
WHERE "usedAt" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LifetimeInviteRedemption_inviteId_email_key" ON "LifetimeInviteRedemption"("inviteId", "email");
CREATE INDEX "LifetimeInviteRedemption_inviteId_idx" ON "LifetimeInviteRedemption"("inviteId");

-- AddForeignKey
ALTER TABLE "LifetimeInviteRedemption" ADD CONSTRAINT "LifetimeInviteRedemption_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "LifetimeInvite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop legacy one-use reservation columns
ALTER TABLE "LifetimeInvite" DROP COLUMN IF EXISTS "claimedEmail";
ALTER TABLE "LifetimeInvite" DROP COLUMN IF EXISTS "usedAt";
ALTER TABLE "LifetimeInvite" DROP COLUMN IF EXISTS "usedByEmail";
ALTER TABLE "LifetimeInvite" DROP COLUMN IF EXISTS "usedByUserId";
