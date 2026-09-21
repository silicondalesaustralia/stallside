-- Supplier memberships, sale snapshots, and manual payout records.
CREATE TYPE "StandMemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'REVOKED');

ALTER TYPE "NotificationType" ADD VALUE 'SUPPLIER_STOCK';

CREATE TABLE "StandMember" (
    "id" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "status" "StandMemberStatus" NOT NULL DEFAULT 'INVITED',
    "inviteToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupplierPayout" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "note" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierPayout_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StandMember_inviteToken_key" ON "StandMember"("inviteToken");
CREATE UNIQUE INDEX "StandMember_standId_email_key" ON "StandMember"("standId", "email");
CREATE INDEX "StandMember_ownerId_idx" ON "StandMember"("ownerId");
CREATE INDEX "StandMember_userId_status_idx" ON "StandMember"("userId", "status");
CREATE INDEX "StandMember_email_idx" ON "StandMember"("email");
CREATE INDEX "SupplierPayout_memberId_paidAt_idx" ON "SupplierPayout"("memberId", "paidAt");

ALTER TABLE "Product" ADD COLUMN "memberId" TEXT;
ALTER TABLE "Product" ADD COLUMN "supplierUnitCents" INTEGER;
CREATE INDEX "Product_memberId_idx" ON "Product"("memberId");

ALTER TABLE "OrderItem" ADD COLUMN "memberId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "supplierUnitCents" INTEGER;
CREATE INDEX "OrderItem_memberId_idx" ON "OrderItem"("memberId");

ALTER TABLE "InventoryAdjustment" ADD COLUMN "memberId" TEXT;
CREATE INDEX "InventoryAdjustment_memberId_createdAt_idx" ON "InventoryAdjustment"("memberId", "createdAt");

ALTER TABLE "StandMember" ADD CONSTRAINT "StandMember_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StandMember" ADD CONSTRAINT "StandMember_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StandMember" ADD CONSTRAINT "StandMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupplierPayout" ADD CONSTRAINT "SupplierPayout_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "StandMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "StandMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "StandMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "StandMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
