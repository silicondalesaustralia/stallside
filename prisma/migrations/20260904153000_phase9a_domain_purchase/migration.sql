-- CreateEnum
CREATE TYPE "DomainPurchaseStatus" AS ENUM ('AWAITING_PAYMENT', 'PAID', 'REGISTERING', 'REGISTERED', 'CONNECTING', 'ACTIVE', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "DomainPurchase" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "storefrontDomainId" TEXT,
    "registrar" TEXT NOT NULL DEFAULT 'NAMECHEAP',
    "registrarDomainId" TEXT,
    "hostname" TEXT NOT NULL,
    "tld" TEXT NOT NULL,
    "status" "DomainPurchaseStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "registrationYears" INTEGER NOT NULL DEFAULT 1,
    "registrarAmountCents" INTEGER NOT NULL,
    "registrarCurrency" TEXT NOT NULL DEFAULT 'USD',
    "retailAmountCents" INTEGER NOT NULL,
    "retailCurrency" TEXT NOT NULL DEFAULT 'AUD',
    "renewalRetailCents" INTEGER,
    "taxAmountCents" INTEGER NOT NULL DEFAULT 0,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "registrantJson" JSONB NOT NULL,
    "auEligibilityJson" JSONB,
    "lastError" TEXT,
    "registeredAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DomainPurchase_idempotencyKey_key" ON "DomainPurchase"("idempotencyKey");
CREATE INDEX "DomainPurchase_ownerId_status_idx" ON "DomainPurchase"("ownerId", "status");
CREATE INDEX "DomainPurchase_storefrontId_status_idx" ON "DomainPurchase"("storefrontId", "status");
CREATE INDEX "DomainPurchase_hostname_idx" ON "DomainPurchase"("hostname");

-- AddForeignKey
ALTER TABLE "DomainPurchase" ADD CONSTRAINT "DomainPurchase_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DomainPurchase" ADD CONSTRAINT "DomainPurchase_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DomainPurchase" ADD CONSTRAINT "DomainPurchase_storefrontDomainId_fkey" FOREIGN KEY ("storefrontDomainId") REFERENCES "StorefrontDomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;
