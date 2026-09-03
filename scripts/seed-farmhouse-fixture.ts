/**
 * Seed a farmhouse produce fixture for Website Studio visual QA.
 * Usage: npx tsx scripts/seed-farmhouse-fixture.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const STAND_SLUG = process.env.STUDIO_FIXTURE_STAND_SLUG ?? "green-valley-farm";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const stand = await prisma.stand.findFirst({ where: { slug: STAND_SLUG } });
  if (!stand) throw new Error(`Stand ${STAND_SLUG} not found — set STUDIO_FIXTURE_STAND_SLUG`);

  const ownerId = stand.ownerId;
  const categories = ["Vegetables", "Eggs", "Preserves"];
  const categoryIds = new Map<string, string>();

  for (const [i, title] of categories.entries()) {
    const cat = await prisma.category.upsert({
      where: { ownerId_slug: { ownerId, slug: title.toLowerCase() } },
      create: { ownerId, title, slug: title.toLowerCase(), sortOrder: i },
      update: { title, sortOrder: i, isActive: true },
    });
    categoryIds.set(title, cat.id);
  }

  const products = [
    { slug: "mixed-greens", name: "Mixed Salad Greens", priceCents: 600, category: "Vegetables" },
    { slug: "free-range-eggs", name: "Free Range Eggs (dozen)", priceCents: 750, category: "Eggs" },
    { slug: "tomatoes", name: "Vine Tomatoes (kg)", priceCents: 800, category: "Vegetables" },
    { slug: "honey-jar", name: "Raw Honey 500g", priceCents: 1400, category: "Preserves" },
    { slug: "zucchini", name: "Zucchini", priceCents: 450, category: "Vegetables" },
    { slug: "passata", name: "Farm Passata", priceCents: 900, category: "Preserves" },
  ];

  for (const [i, p] of products.entries()) {
    const existing = await prisma.product.findFirst({
      where: { standId: stand.id, slug: p.slug },
    });
    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: { name: p.name, priceCents: p.priceCents, sortOrder: i, isArchived: false },
        })
      : await prisma.product.create({
          data: {
            ownerId,
            standId: stand.id,
            name: p.name,
            slug: p.slug,
            priceCents: p.priceCents,
            sortOrder: i,
          },
        });

    const catId = categoryIds.get(p.category);
    if (catId) {
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: product.id, categoryId: catId } },
        create: { productId: product.id, categoryId: catId },
        update: {},
      });
    }
  }

  console.log(`Farmhouse fixture seeded for stand: ${STAND_SLUG}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
