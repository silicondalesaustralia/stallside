-- CreateEnum
CREATE TYPE "ProductSupplyStatus" AS ENUM ('IN_PRODUCTION', 'ON_ORDER', 'SEASONAL', 'DISCONTINUED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "supplyStatus" "ProductSupplyStatus";
