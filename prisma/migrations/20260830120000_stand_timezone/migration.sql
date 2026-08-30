-- Stand timezone for consistent pre-order / collection wall-clock times.
ALTER TABLE "Stand" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'Australia/Adelaide';
