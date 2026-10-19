-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BlogTopicSource" ADD VALUE 'COMPETITOR';
ALTER TYPE "BlogTopicSource" ADD VALUE 'COMMUNITY';
ALTER TYPE "BlogTopicSource" ADD VALUE 'AI_ANSWERS';

-- CreateTable
CREATE TABLE "BlogAiVisibilityCheck" (
    "id" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL,
    "engine" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answerExcerpt" TEXT NOT NULL,
    "vendlMentioned" BOOLEAN NOT NULL,
    "vendlCited" BOOLEAN NOT NULL,
    "competitorsMentioned" TEXT[],
    "citations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogAiVisibilityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogAiVisibilityCheck_runAt_idx" ON "BlogAiVisibilityCheck"("runAt");

-- CreateIndex
CREATE INDEX "BlogAiVisibilityCheck_question_runAt_idx" ON "BlogAiVisibilityCheck"("question", "runAt");
