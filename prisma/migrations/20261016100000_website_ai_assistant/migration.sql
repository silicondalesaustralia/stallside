-- CreateEnum
CREATE TYPE "WebsiteGenerationStatus" AS ENUM ('QUEUED', 'RUNNING', 'RETRY_WAIT', 'READY', 'NEEDS_CONFIRMATION', 'APPLIED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "WebsiteBusinessBrief" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteBusinessBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteGenerationJob" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "activeLock" TEXT,
    "status" "WebsiteGenerationStatus" NOT NULL DEFAULT 'QUEUED',
    "stage" TEXT NOT NULL DEFAULT 'prepare',
    "mode" TEXT NOT NULL DEFAULT 'ai',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "briefRevision" INTEGER NOT NULL,
    "briefSnapshot" JSONB NOT NULL,
    "baseDraftRevision" INTEGER NOT NULL,
    "basePublicationId" TEXT,
    "state" JSONB NOT NULL DEFAULT '{}',
    "candidate" JSONB,
    "restoreDraft" JSONB,
    "appliedRevision" INTEGER,
    "appliedAt" TIMESTAMP(3),
    "restoredAt" TIMESTAMP(3),
    "modelRequested" TEXT,
    "modelUsed" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "reasoningTokens" INTEGER NOT NULL DEFAULT 0,
    "usageUnknownCalls" INTEGER NOT NULL DEFAULT 0,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "leaseToken" TEXT,
    "leaseExpiresAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelRequestedAt" TIMESTAMP(3),
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteGenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "bytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "source" TEXT NOT NULL,
    "role" TEXT,
    "alt" TEXT,
    "sourceRef" TEXT,
    "jobId" TEXT,
    "slotKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteBusinessBrief_ownerId_key" ON "WebsiteBusinessBrief"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteBusinessBrief_storefrontId_key" ON "WebsiteBusinessBrief"("storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteGenerationJob_activeLock_key" ON "WebsiteGenerationJob"("activeLock");

-- CreateIndex
CREATE INDEX "WebsiteGenerationJob_status_nextAttemptAt_idx" ON "WebsiteGenerationJob"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "WebsiteGenerationJob_storefrontId_createdAt_idx" ON "WebsiteGenerationJob"("storefrontId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteGenerationJob_ownerId_idempotencyKey_key" ON "WebsiteGenerationJob"("ownerId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "WebsiteAsset_ownerId_createdAt_idx" ON "WebsiteAsset"("ownerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteAsset_jobId_slotKey_key" ON "WebsiteAsset"("jobId", "slotKey");

-- AddForeignKey
ALTER TABLE "WebsiteBusinessBrief" ADD CONSTRAINT "WebsiteBusinessBrief_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteGenerationJob" ADD CONSTRAINT "WebsiteGenerationJob_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteAsset" ADD CONSTRAINT "WebsiteAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

