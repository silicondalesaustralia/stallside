-- AlterTable
ALTER TABLE "Category" ADD COLUMN "showOnWebsite" BOOLEAN NOT NULL DEFAULT true;

-- CreateEnum
CREATE TYPE "StandQrLinkMode" AS ENUM ('LEGACY_STAND', 'WEBSITE_HOME', 'WEBSITE_CATEGORY');

-- AlterTable
ALTER TABLE "Stand" ADD COLUMN "qrLinkMode" "StandQrLinkMode" NOT NULL DEFAULT 'LEGACY_STAND';
ALTER TABLE "Stand" ADD COLUMN "qrCategoryId" TEXT;

-- CreateIndex
CREATE INDEX "Stand_qrCategoryId_idx" ON "Stand"("qrCategoryId");

-- AddForeignKey
ALTER TABLE "Stand" ADD CONSTRAINT "Stand_qrCategoryId_fkey" FOREIGN KEY ("qrCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
