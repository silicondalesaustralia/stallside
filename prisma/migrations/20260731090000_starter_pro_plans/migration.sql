-- Starter / Pro plan rename + CardInterest + trial sequence timestamps

ALTER TABLE "Owner" ALTER COLUMN "subscriptionPlan" SET DEFAULT 'starter';
ALTER TABLE "Owner" ALTER COLUMN "monthlyFeeCents" SET DEFAULT 0;

UPDATE "Owner" SET "subscriptionPlan" = 'starter'
WHERE "subscriptionPlan" IS NULL
   OR lower("subscriptionPlan") = 'cash'
   OR lower("subscriptionPlan") = 'starter';

UPDATE "Owner" SET "subscriptionPlan" = 'pro'
WHERE lower("subscriptionPlan") = 'card';

UPDATE "Owner" SET "subscriptionPlan" = 'pro_paypal'
WHERE lower("subscriptionPlan") = 'card_paypal';

ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "trialDay23SentAt" TIMESTAMP(3);
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "trialDay45SentAt" TIMESTAMP(3);
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "proLapseDay23SentAt" TIMESTAMP(3);
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "proLapseDay45SentAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "CardInterest" (
    "id" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CardInterest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CardInterest_standId_createdAt_idx" ON "CardInterest"("standId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CardInterest_standId_fkey'
  ) THEN
    ALTER TABLE "CardInterest"
      ADD CONSTRAINT "CardInterest_standId_fkey"
      FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
