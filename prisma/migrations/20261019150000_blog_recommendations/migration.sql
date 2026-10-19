-- AlterEnum
ALTER TYPE "BlogTopicStatus" ADD VALUE 'SELECTED';

-- AlterTable
ALTER TABLE "BlogTopic" ADD COLUMN     "recommendationRank" INTEGER,
ADD COLUMN     "recommendedAt" TIMESTAMP(3),
ADD COLUMN     "selectedAt" TIMESTAMP(3),
ADD COLUMN     "targetPostSlug" TEXT,
ADD COLUMN     "writeError" TEXT;

-- CreateIndex
CREATE INDEX "BlogTopic_recommendedAt_idx" ON "BlogTopic"("recommendedAt");

-- Seed Jono Farrington as the default author (keeps any profile already entered in admin)
INSERT INTO "BlogAuthor" ("id", "slug", "name", "jobTitle", "shortBio", "bio", "expertise", "isDefault", "active", "updatedAt")
VALUES (
    'author_jono_farrington',
    'jono-farrington',
    'Jono Farrington',
    'Co-founder',
    'Jono Farrington is the co-founder of Vendl. Vendl started at his family''s roadside egg stall in regional Australia, and he still runs a stall on it.',
    E'Jono Farrington is the co-founder of Vendl.\n\nVendl began at his daughter''s roadside egg stall, about 500 metres from the family''s front door in regional Australia. Two problems kept coming up: not knowing when the stall had sold out, and customers who wanted to pay but had no cash. Vendl was built to fix both, and the family still runs its own stall on it.\n\nJono writes about running unattended stalls, taking payments without standing at the table, pre-orders, and selling online as a small producer.',
    ARRAY['Roadside and farm stands', 'Unattended retail', 'QR code payments', 'Pre-orders for small producers', 'Selling online as a home producer'],
    true,
    true,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET "isDefault" = true, "active" = true, "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "BlogAuthor" SET "isDefault" = false WHERE "slug" <> 'jono-farrington' AND "isDefault" = true;

UPDATE "BlogPost" SET "authorId" = (SELECT "id" FROM "BlogAuthor" WHERE "slug" = 'jono-farrington')
WHERE "authorId" IS NULL;
