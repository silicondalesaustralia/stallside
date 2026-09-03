-- Phase 9: StorefrontDomain for multi-tenant custom hostnames
CREATE TYPE "StorefrontDomainType" AS ENUM ('VENDL_SUBDOMAIN', 'CUSTOM');
CREATE TYPE "StorefrontDomainStatus" AS ENUM ('PENDING', 'VERIFYING', 'ACTIVE', 'ERROR', 'DISCONNECTED');

CREATE TABLE "StorefrontDomain" (
    "id" TEXT NOT NULL,
    "storefrontId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "type" "StorefrontDomainType" NOT NULL,
    "status" "StorefrontDomainStatus" NOT NULL DEFAULT 'PENDING',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "cloudflareCustomHostnameId" TEXT,
    "hostnameStatus" TEXT,
    "sslStatus" TEXT,
    "verificationMethod" TEXT,
    "verificationName" TEXT,
    "verificationValue" TEXT,
    "cnameTarget" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorefrontDomain_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StorefrontDomain_hostname_key" ON "StorefrontDomain"("hostname");
CREATE INDEX "StorefrontDomain_storefrontId_status_idx" ON "StorefrontDomain"("storefrontId", "status");
CREATE INDEX "StorefrontDomain_storefrontId_isPrimary_idx" ON "StorefrontDomain"("storefrontId", "isPrimary");
CREATE INDEX "StorefrontDomain_type_status_idx" ON "StorefrontDomain"("type", "status");

ALTER TABLE "StorefrontDomain" ADD CONSTRAINT "StorefrontDomain_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id") ON DELETE CASCADE ON UPDATE CASCADE;
