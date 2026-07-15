ALTER TABLE "Owner" ADD COLUMN "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Owner" ADD COLUMN "trialReminderSentAt" TIMESTAMP(3);

CREATE TABLE "SignupIntent" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupIntent_pkey" PRIMARY KEY ("email")
);
