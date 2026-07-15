-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'LOCAL_TRANSFER';
ALTER TYPE "InventorySource" ADD VALUE 'ORDER_LOCAL_TRANSFER';

-- AlterTable
ALTER TABLE "Stand" ADD COLUMN "localTransferAlias" TEXT;
ALTER TABLE "Stand" ADD COLUMN "localTransferMethodId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "localTransferMethodId" TEXT;
