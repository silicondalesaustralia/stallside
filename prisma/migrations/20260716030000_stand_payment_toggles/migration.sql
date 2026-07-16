-- Per-stand checkout payment method toggles
ALTER TABLE "Stand" ADD COLUMN "acceptCash" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Stand" ADD COLUMN "acceptLocalTransfer" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Stand" ADD COLUMN "acceptCard" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Stand" ADD COLUMN "acceptPayPal" BOOLEAN NOT NULL DEFAULT true;
