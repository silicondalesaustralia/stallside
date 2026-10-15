ALTER TABLE "Review" ALTER COLUMN "orderId" DROP NOT NULL;
ALTER TABLE "Review" ALTER COLUMN "token" DROP NOT NULL;
ALTER TABLE "Review" ADD COLUMN "authorName" TEXT;
ALTER TABLE "Review" ADD COLUMN "authorEmail" TEXT;
ALTER TABLE "Review" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Review" ADD COLUMN "repliedAt" TIMESTAMP(3);
CREATE INDEX "Review_ownerId_createdAt_idx" ON "Review"("ownerId", "createdAt");
