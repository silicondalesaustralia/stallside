-- AlterEnum
ALTER TYPE "InventorySource" ADD VALUE 'PRODUCTION';

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "onHandQuantity" DECIMAL(18,6) NOT NULL DEFAULT 0,
ADD COLUMN     "reorderLevel" DECIMAL(18,6);

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "labourMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "labourRateCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "overheadCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wastePercent" DECIMAL(6,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "IngredientPurchase" (
    "id" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "unit" "MeasureUnit" NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "supplier" TEXT,
    "lotCode" TEXT,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngredientPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBatch" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "recipeId" TEXT,
    "recipeName" TEXT NOT NULL,
    "productId" TEXT,
    "batchCode" TEXT NOT NULL,
    "batchCount" DECIMAL(18,6) NOT NULL,
    "unitsMade" INTEGER NOT NULL DEFAULT 0,
    "madeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bestBefore" TIMESTAMP(3),
    "materialCostCents" INTEGER NOT NULL,
    "labourCostCents" INTEGER NOT NULL,
    "overheadCostCents" INTEGER NOT NULL,
    "totalCostCents" INTEGER NOT NULL,
    "unitCostCents" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBatchLine" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "ingredientId" TEXT,
    "ingredientName" TEXT NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "unit" "MeasureUnit" NOT NULL,
    "costCents" INTEGER NOT NULL,

    CONSTRAINT "ProductionBatchLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IngredientPurchase_ingredientId_receivedAt_idx" ON "IngredientPurchase"("ingredientId", "receivedAt");

-- CreateIndex
CREATE INDEX "ProductionBatch_standId_madeAt_idx" ON "ProductionBatch"("standId", "madeAt");

-- CreateIndex
CREATE INDEX "ProductionBatch_productId_madeAt_idx" ON "ProductionBatch"("productId", "madeAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionBatch_ownerId_batchCode_key" ON "ProductionBatch"("ownerId", "batchCode");

-- CreateIndex
CREATE INDEX "ProductionBatchLine_batchId_idx" ON "ProductionBatchLine"("batchId");

-- CreateIndex
CREATE INDEX "ProductionBatchLine_ingredientId_idx" ON "ProductionBatchLine"("ingredientId");

-- AddForeignKey
ALTER TABLE "IngredientPurchase" ADD CONSTRAINT "IngredientPurchase_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatchLine" ADD CONSTRAINT "ProductionBatchLine_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatchLine" ADD CONSTRAINT "ProductionBatchLine_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
