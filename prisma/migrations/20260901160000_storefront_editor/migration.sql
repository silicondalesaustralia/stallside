-- Phase 4B: storefront editor (draft/publish, theme, sections)
ALTER TABLE "Storefront" ADD COLUMN "subheadline" TEXT;
ALTER TABLE "Storefront" ADD COLUMN "heroImageUrl" TEXT;
ALTER TABLE "Storefront" ADD COLUMN "themePreset" TEXT NOT NULL DEFAULT 'market';
ALTER TABLE "Storefront" ADD COLUMN "draftConfig" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Storefront" ADD COLUMN "publishedConfig" JSONB;
ALTER TABLE "Storefront" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "Storefront" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "Storefront" ADD COLUMN "showPhone" BOOLEAN NOT NULL DEFAULT false;
