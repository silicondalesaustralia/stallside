-- AlterTable
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;
ALTER TABLE "Product" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Product" ADD COLUMN "seoDescription" TEXT;

-- Backfill slugs from name
UPDATE "Product" p
SET "slug" = COALESCE(
  NULLIF(
    TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(REGEXP_REPLACE(p."name", '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))),
    ''
  ),
  'item'
);

-- Disambiguate collisions within a stand
WITH ranked AS (
  SELECT
    id,
    "standId",
    slug,
    ROW_NUMBER() OVER (PARTITION BY "standId", slug ORDER BY "createdAt", id) AS rn
  FROM "Product"
)
UPDATE "Product" p
SET slug = p.slug || '-' || ranked.rn
FROM ranked
WHERE p.id = ranked.id AND ranked.rn > 1;

-- Avoid reserved path segments
UPDATE "Product" SET slug = slug || '-item' WHERE slug IN ('cart', 'checkout');

ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Product_standId_slug_key" ON "Product"("standId", "slug");
