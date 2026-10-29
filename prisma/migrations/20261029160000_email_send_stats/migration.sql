-- AlterTable
ALTER TABLE "EmailSendLog" ADD COLUMN "lastEvent" TEXT,
ADD COLUMN "deliveredAt" TIMESTAMP(3),
ADD COLUMN "firstOpenedAt" TIMESTAMP(3),
ADD COLUMN "openCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "firstClickedAt" TIMESTAMP(3),
ADD COLUMN "clickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "bouncedAt" TIMESTAMP(3),
ADD COLUMN "bounceType" TEXT,
ADD COLUMN "complainedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "EmailSendLog_resendId_idx" ON "EmailSendLog"("resendId");

-- CreateTable
CREATE TABLE "ResendWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resendId" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResendWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResendWebhookEvent_resendId_idx" ON "ResendWebhookEvent"("resendId");
