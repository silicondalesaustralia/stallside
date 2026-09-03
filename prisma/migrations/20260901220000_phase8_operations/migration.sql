-- CreateEnum
CREATE TYPE "CustomOrderRequestStatus" AS ENUM ('SUBMITTED', 'REVIEWING', 'ACCEPTED', 'DECLINED', 'CONVERTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CustomOrderFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'EMAIL', 'PHONE', 'NUMBER', 'SELECT', 'DATE');

-- CreateEnum
CREATE TYPE "SellerEventStatus" AS ENUM ('DRAFT', 'LIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "packedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "opsLookupToken" TEXT,
ADD COLUMN "sellerEventId" TEXT,
ADD COLUMN "customOrderRequestId" TEXT;

-- CreateTable
CREATE TABLE "CustomOrderForm" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "thankYouNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrderForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrderField" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" "CustomOrderFieldType" NOT NULL DEFAULT 'TEXT',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomOrderField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomOrderRequest" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "status" "CustomOrderRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "customerName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "answers" JSONB NOT NULL,
    "sellerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrderRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerEvent" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "standId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationLabel" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" "SellerEventStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerEventProduct" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "allocatedQty" INTEGER,
    "soldQty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SellerEventProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_opsLookupToken_key" ON "Order"("opsLookupToken");

-- CreateIndex
CREATE UNIQUE INDEX "Order_customOrderRequestId_key" ON "Order"("customOrderRequestId");

-- CreateIndex
CREATE INDEX "Order_sellerEventId_idx" ON "Order"("sellerEventId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrderForm_ownerId_slug_key" ON "CustomOrderForm"("ownerId", "slug");

-- CreateIndex
CREATE INDEX "CustomOrderForm_ownerId_isPublished_idx" ON "CustomOrderForm"("ownerId", "isPublished");

-- CreateIndex
CREATE INDEX "CustomOrderField_formId_sortOrder_idx" ON "CustomOrderField"("formId", "sortOrder");

-- CreateIndex
CREATE INDEX "CustomOrderRequest_ownerId_status_createdAt_idx" ON "CustomOrderRequest"("ownerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CustomOrderRequest_formId_createdAt_idx" ON "CustomOrderRequest"("formId", "createdAt");

-- CreateIndex
CREATE INDEX "SellerEvent_ownerId_startsAt_idx" ON "SellerEvent"("ownerId", "startsAt");

-- CreateIndex
CREATE INDEX "SellerEvent_standId_status_idx" ON "SellerEvent"("standId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SellerEventProduct_eventId_productId_key" ON "SellerEventProduct"("eventId", "productId");

-- CreateIndex
CREATE INDEX "SellerEventProduct_productId_idx" ON "SellerEventProduct"("productId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerEventId_fkey" FOREIGN KEY ("sellerEventId") REFERENCES "SellerEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customOrderRequestId_fkey" FOREIGN KEY ("customOrderRequestId") REFERENCES "CustomOrderRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderForm" ADD CONSTRAINT "CustomOrderForm_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderField" ADD CONSTRAINT "CustomOrderField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "CustomOrderForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderRequest" ADD CONSTRAINT "CustomOrderRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomOrderRequest" ADD CONSTRAINT "CustomOrderRequest_formId_fkey" FOREIGN KEY ("formId") REFERENCES "CustomOrderForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerEvent" ADD CONSTRAINT "SellerEvent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerEvent" ADD CONSTRAINT "SellerEvent_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerEventProduct" ADD CONSTRAINT "SellerEventProduct_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "SellerEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerEventProduct" ADD CONSTRAINT "SellerEventProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
