-- Stand cart mode: PRODUCT (default) | CUSTOMER_CHOICE open-amount checkout.
CREATE TYPE "CartMode" AS ENUM ('PRODUCT', 'CUSTOMER_CHOICE');

ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "cartMode" "CartMode" NOT NULL DEFAULT 'PRODUCT';
ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "customerChoiceProductId" TEXT;
