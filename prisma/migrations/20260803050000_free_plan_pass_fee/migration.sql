-- Free plan rename + pass-on toggle for Stallside card fee
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "passFeeToCustomer" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Owner"
SET "subscriptionPlan" = 'free'
WHERE "subscriptionPlan" IS NULL
   OR LOWER("subscriptionPlan") IN ('starter', 'cash');

ALTER TABLE "Owner" ALTER COLUMN "subscriptionPlan" SET DEFAULT 'free';
