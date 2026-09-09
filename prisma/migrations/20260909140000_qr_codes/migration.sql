-- Extra printable QR posters (category / shop home), separate from Stand primary QR.
CREATE TABLE "QrCode" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "linkMode" "StandQrLinkMode" NOT NULL DEFAULT 'WEBSITE_CATEGORY',
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QrCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QrCode_ownerId_idx" ON "QrCode"("ownerId");
CREATE INDEX "QrCode_standId_idx" ON "QrCode"("standId");
CREATE INDEX "QrCode_categoryId_idx" ON "QrCode"("categoryId");

ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QrCode" ADD CONSTRAINT "QrCode_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
