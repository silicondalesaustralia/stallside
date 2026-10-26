-- CreateEnum
CREATE TYPE "MaterialKind" AS ENUM ('INGREDIENT', 'PACKAGING');

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "kind" "MaterialKind" NOT NULL DEFAULT 'INGREDIENT';

-- AlterTable
ALTER TABLE "ProductionBatch" ADD COLUMN     "packagingCostCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductionBatchLine" ADD COLUMN     "isPackaging" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ProductPackaging" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "unit" "MeasureUnit" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductPackaging_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductPackaging_ingredientId_idx" ON "ProductPackaging"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPackaging_productId_ingredientId_key" ON "ProductPackaging"("productId", "ingredientId");

-- AddForeignKey
ALTER TABLE "ProductPackaging" ADD CONSTRAINT "ProductPackaging_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPackaging" ADD CONSTRAINT "ProductPackaging_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

