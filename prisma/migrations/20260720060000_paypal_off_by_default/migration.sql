-- AlterTable
ALTER TABLE "Stand" ALTER COLUMN "acceptPayPal" SET DEFAULT false;

-- PayPal checkout is not live yet — clear any stands that inherited the old default.
UPDATE "Stand" SET "acceptPayPal" = false WHERE "acceptPayPal" = true;
