-- Idempotent and a no-op when the website tables are absent, so it is safe on
-- databases that have not received the storefront migrations yet.
DO $$
BEGIN
  IF to_regclass('"Storefront"') IS NOT NULL THEN
    ALTER TABLE "Storefront" ADD COLUMN IF NOT EXISTS "draftRevision" INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE "Storefront" ADD COLUMN IF NOT EXISTS "activePublicationId" TEXT;

    CREATE TABLE IF NOT EXISTS "StorefrontPublication" (
      "id" TEXT NOT NULL,
      "storefrontId" TEXT NOT NULL,
      "draftRevision" INTEGER NOT NULL,
      "snapshot" JSONB NOT NULL,
      "createdByUserId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "StorefrontPublication_pkey" PRIMARY KEY ("id")
    );

    CREATE INDEX IF NOT EXISTS "StorefrontPublication_storefrontId_createdAt_idx"
      ON "StorefrontPublication"("storefrontId", "createdAt");

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'StorefrontPublication_storefrontId_fkey'
    ) THEN
      ALTER TABLE "StorefrontPublication"
        ADD CONSTRAINT "StorefrontPublication_storefrontId_fkey"
        FOREIGN KEY ("storefrontId") REFERENCES "Storefront"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;
