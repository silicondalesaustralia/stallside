-- Hide pre-order page products from business catalog / business QR by default.
ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "hideOnBusinessPage" BOOLEAN NOT NULL DEFAULT true;
UPDATE "PreOrderPage" SET "hideOnBusinessPage" = true WHERE "hideOnBusinessPage" IS DISTINCT FROM true;
