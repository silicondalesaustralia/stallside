-- Stripe Connect lifecycle nudge emails
ALTER TABLE "Owner" ADD COLUMN "stripeConnectStartedAt" TIMESTAMP(3);
ALTER TABLE "Owner" ADD COLUMN "stripeRestrictedNudgeSentAt" TIMESTAMP(3);
ALTER TABLE "Owner" ADD COLUMN "stripeNeverStartedNudgeSentAt" TIMESTAMP(3);
