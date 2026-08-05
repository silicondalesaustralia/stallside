-- Persist Meta/Google click ids through signup → conversion pushback.
ALTER TABLE "SignupIntent" ADD COLUMN IF NOT EXISTS "adAttribution" JSONB;
ALTER TABLE "Owner" ADD COLUMN IF NOT EXISTS "adAttribution" JSONB;
