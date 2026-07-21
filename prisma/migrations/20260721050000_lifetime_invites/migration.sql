-- AlterTable
ALTER TABLE "SignupIntent" ADD COLUMN "inviteToken" TEXT;

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN "lifetimeAccess" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LifetimeInvite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "note" TEXT,
    "claimedEmail" TEXT,
    "usedAt" TIMESTAMP(3),
    "usedByEmail" TEXT,
    "usedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifetimeInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LifetimeInvite_token_key" ON "LifetimeInvite"("token");
