-- AlterTable
ALTER TABLE "WebsiteGenerationJob" ADD COLUMN "costUsdMicros" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AiUsageEvent" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "storefrontId" TEXT,
    "feature" TEXT NOT NULL,
    "jobId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'openai',
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "cachedInputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "reasoningTokens" INTEGER NOT NULL DEFAULT 0,
    "images" INTEGER NOT NULL DEFAULT 0,
    "costUsdMicros" INTEGER,
    "costQuality" TEXT NOT NULL,
    "pricingVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiUsageEvent_ownerId_createdAt_idx" ON "AiUsageEvent"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageEvent_createdAt_idx" ON "AiUsageEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AiUsageEvent_jobId_idx" ON "AiUsageEvent"("jobId");

-- AddForeignKey
ALTER TABLE "AiUsageEvent" ADD CONSTRAINT "AiUsageEvent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
