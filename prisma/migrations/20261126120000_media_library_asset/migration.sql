-- CreateTable
CREATE TABLE "MediaLibraryAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaLibraryAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaLibraryAsset_ownerId_createdAt_idx" ON "MediaLibraryAsset"("ownerId", "createdAt");

-- AddForeignKey
ALTER TABLE "MediaLibraryAsset" ADD CONSTRAINT "MediaLibraryAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
