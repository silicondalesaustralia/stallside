CREATE TABLE IF NOT EXISTS "CustomerSegment" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "presetKey" TEXT,
    "rules" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerSegment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CustomerSegment_ownerId_isActive_idx" ON "CustomerSegment"("ownerId", "isActive");

DO $$ BEGIN
  ALTER TABLE "CustomerSegment" ADD CONSTRAINT "CustomerSegment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
