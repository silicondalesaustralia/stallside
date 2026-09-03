-- Phase 6: Ingredients, Recipes, ProductRecipe, ProductionPlan

CREATE TYPE "MeasureUnit" AS ENUM ('MG', 'G', 'KG', 'ML', 'L', 'EACH');
CREATE TYPE "ProductionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETE');

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "packagingCostCents" INTEGER;

CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseUnit" "MeasureUnit" NOT NULL,
    "purchaseQuantity" DECIMAL(18,6) NOT NULL,
    "purchaseUnit" "MeasureUnit" NOT NULL,
    "purchasePriceCents" INTEGER NOT NULL,
    "supplier" TEXT,
    "sku" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IngredientCostHistory" (
    "id" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "purchaseQuantity" DECIMAL(18,6) NOT NULL,
    "purchaseUnit" "MeasureUnit" NOT NULL,
    "purchasePriceCents" INTEGER NOT NULL,
    "note" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngredientCostHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "yieldQuantity" DECIMAL(18,6) NOT NULL,
    "yieldLabel" TEXT NOT NULL DEFAULT 'units',
    "instructions" TEXT,
    "prepNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT,
    "componentRecipeId" TEXT,
    "quantity" DECIMAL(18,6) NOT NULL,
    "unit" "MeasureUnit",
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductRecipe" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "yieldUnitsPerProduct" DECIMAL(18,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductRecipe_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionPlan" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "groupKey" TEXT NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    "status" "ProductionStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Ingredient_ownerId_isActive_idx" ON "Ingredient"("ownerId", "isActive");
CREATE INDEX "Ingredient_ownerId_name_idx" ON "Ingredient"("ownerId", "name");
CREATE INDEX "IngredientCostHistory_ingredientId_recordedAt_idx" ON "IngredientCostHistory"("ingredientId", "recordedAt");
CREATE INDEX "Recipe_ownerId_isActive_idx" ON "Recipe"("ownerId", "isActive");
CREATE INDEX "Recipe_ownerId_name_idx" ON "Recipe"("ownerId", "name");
CREATE INDEX "RecipeIngredient_recipeId_sortOrder_idx" ON "RecipeIngredient"("recipeId", "sortOrder");
CREATE INDEX "RecipeIngredient_ingredientId_idx" ON "RecipeIngredient"("ingredientId");
CREATE INDEX "RecipeIngredient_componentRecipeId_idx" ON "RecipeIngredient"("componentRecipeId");
CREATE UNIQUE INDEX "ProductRecipe_productId_key" ON "ProductRecipe"("productId");
CREATE INDEX "ProductRecipe_recipeId_idx" ON "ProductRecipe"("recipeId");
CREATE UNIQUE INDEX "ProductionPlan_ownerId_groupKey_key" ON "ProductionPlan"("ownerId", "groupKey");
CREATE INDEX "ProductionPlan_ownerId_standId_idx" ON "ProductionPlan"("ownerId", "standId");

ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IngredientCostHistory" ADD CONSTRAINT "IngredientCostHistory_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_componentRecipeId_fkey" FOREIGN KEY ("componentRecipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductRecipe" ADD CONSTRAINT "ProductRecipe_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductRecipe" ADD CONSTRAINT "ProductRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductionPlan" ADD CONSTRAINT "ProductionPlan_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
