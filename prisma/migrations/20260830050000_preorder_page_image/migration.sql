-- Optional cover image for pre-order page social / Open Graph previews.
ALTER TABLE "PreOrderPage" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
