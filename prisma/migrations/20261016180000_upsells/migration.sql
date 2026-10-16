-- CreateTable
CREATE TABLE "Upsell" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "offerProductId" TEXT NOT NULL,
    "priceCents" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sitewide" BOOLEAN NOT NULL DEFAULT false,
    "categoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "showOnWebsite" BOOLEAN NOT NULL DEFAULT true,
    "showAtStall" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Upsell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Upsell_ownerId_idx" ON "Upsell"("ownerId");

-- CreateIndex
CREATE INDEX "Upsell_standId_isActive_idx" ON "Upsell"("standId", "isActive");

-- CreateIndex
CREATE INDEX "Upsell_offerProductId_idx" ON "Upsell"("offerProductId");

-- AddForeignKey
ALTER TABLE "Upsell" ADD CONSTRAINT "Upsell_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upsell" ADD CONSTRAINT "Upsell_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upsell" ADD CONSTRAINT "Upsell_offerProductId_fkey" FOREIGN KEY ("offerProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
