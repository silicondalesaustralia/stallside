-- CreateEnum
CREATE TYPE "AffiliateCommissionStatus" AS ENUM ('PENDING', 'PAID', 'INELIGIBLE', 'VOID');

-- AlterTable
ALTER TABLE "SignupIntent" ADD COLUMN     "referralCode" TEXT;

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredAt" TIMESTAMP(3),
ADD COLUMN     "referredByOwnerId" TEXT;

-- CreateTable
CREATE TABLE "AffiliateCommission" (
    "id" TEXT NOT NULL,
    "affiliateOwnerId" TEXT NOT NULL,
    "referredOwnerId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "invoiceAmountCents" INTEGER NOT NULL,
    "commissionCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "AffiliateCommissionStatus" NOT NULL DEFAULT 'PENDING',
    "payoutId" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliatePayout" (
    "id" TEXT NOT NULL,
    "affiliateOwnerId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "note" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliatePayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateClick" (
    "id" TEXT NOT NULL,
    "affiliateOwnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Owner_referralCode_key" ON "Owner"("referralCode");

-- CreateIndex
CREATE INDEX "Owner_referredByOwnerId_idx" ON "Owner"("referredByOwnerId");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateCommission_stripeInvoiceId_key" ON "AffiliateCommission"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "AffiliateCommission_affiliateOwnerId_status_idx" ON "AffiliateCommission"("affiliateOwnerId", "status");

-- CreateIndex
CREATE INDEX "AffiliateCommission_referredOwnerId_idx" ON "AffiliateCommission"("referredOwnerId");

-- CreateIndex
CREATE INDEX "AffiliatePayout_affiliateOwnerId_idx" ON "AffiliatePayout"("affiliateOwnerId");

-- CreateIndex
CREATE INDEX "AffiliateClick_affiliateOwnerId_createdAt_idx" ON "AffiliateClick"("affiliateOwnerId", "createdAt");

-- AddForeignKey
ALTER TABLE "Owner" ADD CONSTRAINT "Owner_referredByOwnerId_fkey" FOREIGN KEY ("referredByOwnerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_affiliateOwnerId_fkey" FOREIGN KEY ("affiliateOwnerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_referredOwnerId_fkey" FOREIGN KEY ("referredOwnerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "AffiliatePayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliatePayout" ADD CONSTRAINT "AffiliatePayout_affiliateOwnerId_fkey" FOREIGN KEY ("affiliateOwnerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateClick" ADD CONSTRAINT "AffiliateClick_affiliateOwnerId_fkey" FOREIGN KEY ("affiliateOwnerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
