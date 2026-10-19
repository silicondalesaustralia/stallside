-- CreateEnum
CREATE TYPE "BlogSection" AS ENUM ('NEWS', 'GUIDE');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BlogRevisionStatus" AS ENUM ('PENDING', 'PUBLISHED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "BlogTopicSource" AS ENUM ('GSC', 'KNOWLEDGE_BASE', 'FEATURE', 'MARKET', 'NEWS', 'MANUAL');

-- CreateEnum
CREATE TYPE "BlogTopicStatus" AS ENUM ('IDEA', 'WAITING_FOR_RELEASE', 'USED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "section" "BlogSection" NOT NULL DEFAULT 'GUIDE',
    "alsoListedIn" "BlogSection",
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "faqs" JSONB,
    "keywords" TEXT,
    "heroImageUrl" TEXT,
    "heroImageAlt" TEXT,
    "heroImageWidth" INTEGER,
    "heroImageHeight" INTEGER,
    "source" "BlogTopicSource" NOT NULL DEFAULT 'MANUAL',
    "targetQueries" JSONB,
    "researchNotes" JSONB,
    "agentSummary" TEXT,
    "rejectionReason" TEXT,
    "timeSensitive" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "contentUpdatedAt" TIMESTAMP(3),
    "topicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostRevision" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "status" "BlogRevisionStatus" NOT NULL DEFAULT 'PENDING',
    "baseBodyHtml" TEXT NOT NULL,
    "baseUpdatedAt" TIMESTAMP(3) NOT NULL,
    "proposedBodyHtml" TEXT NOT NULL,
    "proposedTitle" TEXT,
    "proposedSeoTitle" TEXT,
    "proposedSeoDescription" TEXT,
    "proposedExcerpt" TEXT,
    "proposedFaqs" JSONB,
    "changeNotes" JSONB,
    "targetQueries" JSONB,
    "agentSummary" TEXT,
    "discardReason" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPostRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "angle" TEXT,
    "source" "BlogTopicSource" NOT NULL,
    "status" "BlogTopicStatus" NOT NULL DEFAULT 'IDEA',
    "section" "BlogSection",
    "score" INTEGER NOT NULL DEFAULT 0,
    "targetQueries" JSONB,
    "sourceUrls" JSONB,
    "featureRef" TEXT,
    "notes" TEXT,
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_section_publishedAt_idx" ON "BlogPost"("status", "section", "publishedAt");

-- CreateIndex
CREATE INDEX "BlogPostRevision_status_createdAt_idx" ON "BlogPostRevision"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BlogPostRevision_postId_idx" ON "BlogPostRevision"("postId");

-- CreateIndex
CREATE INDEX "BlogTopic_status_score_idx" ON "BlogTopic"("status", "score");

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "BlogTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostRevision" ADD CONSTRAINT "BlogPostRevision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
