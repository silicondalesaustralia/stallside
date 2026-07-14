-- Platform Stripe Billing (SaaS) is separate from Connect Express (payouts).
ALTER TABLE "Owner" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Owner" ADD COLUMN "stripeSubscriptionId" TEXT;

ALTER TABLE "Owner" ALTER COLUMN "subscriptionPlan" SET DEFAULT 'cash';
ALTER TABLE "Owner" ALTER COLUMN "monthlyFeeCents" SET DEFAULT 699;
