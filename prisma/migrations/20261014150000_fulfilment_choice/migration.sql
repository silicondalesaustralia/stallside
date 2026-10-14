-- CreateEnum
CREATE TYPE "FulfilmentChoice" AS ENUM ('PICKUP', 'DELIVERY', 'BOTH');

-- AlterTable
ALTER TABLE "Stand" ADD COLUMN "fulfilmentDefault" "FulfilmentChoice" NOT NULL DEFAULT 'PICKUP';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "fulfilment" "FulfilmentChoice";
