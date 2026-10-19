-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN "standId" TEXT,
ADD COLUMN "showOnWebsite" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "showAtStall" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Promotion_standId_idx" ON "Promotion"("standId");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
