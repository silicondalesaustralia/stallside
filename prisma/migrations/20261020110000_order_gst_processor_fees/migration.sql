-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "gstFree" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "gstCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "processorFeeCents" INTEGER,
ADD COLUMN     "processorFeeTaxCents" INTEGER,
ADD COLUMN     "processorFeeCurrency" TEXT,
ADD COLUMN     "processorFeesSyncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "gstFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gstCents" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Order_paymentStatus_processorFeesSyncedAt_idx" ON "Order"("paymentStatus", "processorFeesSyncedAt");
