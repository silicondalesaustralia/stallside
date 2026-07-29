-- CreateTable
CREATE TABLE "EmailSendLog" (
    "id" TEXT NOT NULL,
    "toEmails" TEXT[],
    "subject" TEXT NOT NULL,
    "kind" TEXT,
    "status" TEXT NOT NULL,
    "resendId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailSendLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailSendLog_createdAt_idx" ON "EmailSendLog"("createdAt");

-- CreateIndex
CREATE INDEX "EmailSendLog_kind_createdAt_idx" ON "EmailSendLog"("kind", "createdAt");
