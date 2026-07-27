-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('ACTIVE', 'UNSUBSCRIBED');

-- CreateTable
CREATE TABLE "RestockSubscriber" (
    "id" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "SubStatus" NOT NULL DEFAULT 'ACTIVE',
    "consentText" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentSource" TEXT NOT NULL,
    "unsubToken" TEXT NOT NULL,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestockSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestockNotification" (
    "id" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "sentByUserId" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestockNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestockSubscriber_unsubToken_key" ON "RestockSubscriber"("unsubToken");

-- CreateIndex
CREATE INDEX "RestockSubscriber_standId_status_idx" ON "RestockSubscriber"("standId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RestockSubscriber_standId_email_key" ON "RestockSubscriber"("standId", "email");

-- CreateIndex
CREATE INDEX "RestockNotification_standId_sentAt_idx" ON "RestockNotification"("standId", "sentAt");

-- AddForeignKey
ALTER TABLE "RestockSubscriber" ADD CONSTRAINT "RestockSubscriber_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockNotification" ADD CONSTRAINT "RestockNotification_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
