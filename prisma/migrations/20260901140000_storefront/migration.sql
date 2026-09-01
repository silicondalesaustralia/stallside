-- CreateTable
CREATE TABLE "Storefront" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "headline" TEXT,
    "about" TEXT,
    "customDomain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Storefront_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Storefront_ownerId_key" ON "Storefront"("ownerId");
CREATE UNIQUE INDEX "Storefront_slug_key" ON "Storefront"("slug");
CREATE INDEX "Storefront_isPublished_idx" ON "Storefront"("isPublished");

-- AddForeignKey
ALTER TABLE "Storefront" ADD CONSTRAINT "Storefront_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
