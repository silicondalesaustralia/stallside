-- Shared supplier stock: link to owner products + FIFO contribution lots.
CREATE TYPE "StockLotStatus" AS ENUM ('PENDING', 'ACTIVE');

CREATE TABLE "SupplierProductAccess" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supplierUnitCents" INTEGER NOT NULL,
    "autoApprove" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierProductAccess_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockLot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "memberId" TEXT,
    "supplierUnitCents" INTEGER,
    "quantityRemaining" INTEGER NOT NULL,
    "status" "StockLotStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SupplierProductAccess_memberId_productId_key" ON "SupplierProductAccess"("memberId", "productId");
CREATE INDEX "SupplierProductAccess_productId_idx" ON "SupplierProductAccess"("productId");
CREATE INDEX "StockLot_productId_status_createdAt_idx" ON "StockLot"("productId", "status", "createdAt");
CREATE INDEX "StockLot_memberId_idx" ON "StockLot"("memberId");

ALTER TABLE "SupplierProductAccess" ADD CONSTRAINT "SupplierProductAccess_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "StandMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierProductAccess" ADD CONSTRAINT "SupplierProductAccess_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "StandMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
