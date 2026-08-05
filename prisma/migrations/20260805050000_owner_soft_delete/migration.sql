-- Soft-close accounts: retain data, block login and outbound owner email.
ALTER TABLE "Owner" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE INDEX "Owner_deletedAt_idx" ON "Owner"("deletedAt");
