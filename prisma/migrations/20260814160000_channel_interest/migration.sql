-- CreateEnum
CREATE TYPE "ChannelInterestKind" AS ENUM ('PREORDER', 'SUBSCRIPTION');

-- CreateTable
CREATE TABLE "ChannelInterest" (
    "id" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "kind" "ChannelInterestKind" NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelInterest_standId_kind_email_key" ON "ChannelInterest"("standId", "kind", "email");

-- CreateIndex
CREATE INDEX "ChannelInterest_standId_createdAt_idx" ON "ChannelInterest"("standId", "createdAt");

-- AddForeignKey
ALTER TABLE "ChannelInterest" ADD CONSTRAINT "ChannelInterest_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
