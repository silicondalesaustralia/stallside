-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('GOOGLE', 'OUTLOOK');

-- CreateTable
CREATE TABLE "CalendarConnection" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "accountEmail" TEXT,
    "accessTokenEnc" TEXT NOT NULL,
    "refreshTokenEnc" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "importEnabled" BOOLEAN NOT NULL DEFAULT true,
    "exportEnabled" BOOLEAN NOT NULL DEFAULT true,
    "exportCalendarId" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarExportLink" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "vendlEventId" TEXT NOT NULL,
    "externalEventId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarExportLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarConnection_ownerId_provider_key" ON "CalendarConnection"("ownerId", "provider");

-- CreateIndex
CREATE INDEX "CalendarExportLink_connectionId_startsAt_idx" ON "CalendarExportLink"("connectionId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarExportLink_connectionId_vendlEventId_key" ON "CalendarExportLink"("connectionId", "vendlEventId");

-- AddForeignKey
ALTER TABLE "CalendarConnection" ADD CONSTRAINT "CalendarConnection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarExportLink" ADD CONSTRAINT "CalendarExportLink_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "CalendarConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

