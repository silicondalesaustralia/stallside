/**
 * Seed a market-style prepared food fixture for Website Studio visual QA.
 * Usage: npx tsx scripts/seed-market-fixture.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const STAND_SLUG = process.env.STUDIO_FIXTURE_STAND_SLUG ?? "city-kitchen-co";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const stand = await prisma.stand.findFirst({ where: { slug: STAND_SLUG } });
  if (!stand) throw new Error(`Stand ${STAND_SLUG} not found — set STUDIO_FIXTURE_STAND_SLUG`);

  const ownerId = stand.ownerId;
  const categories = ["Meals", "Sides", "Treats"];
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
    { slug: "lasagna-tray", name: "Family Lasagna Tray", priceCents: 2800, category: "Meals" },
    { slug: "roast-chicken", name: "Roast Chicken Dinner", priceCents: 2200, category: "Meals" },
    { slug: "salad-pot", name: "Seasonal Salad Pot", priceCents: 1200, category: "Sides" },
    { slug: "garlic-bread", name: "Garlic Bread (2 pack)", priceCents: 800, category: "Sides" },
    { slug: "brownie-box", name: "Brownie Box (6)", priceCents: 1800, category: "Treats" },
    { slug: "soup-litre", name: "Soup of the Week (1L)", priceCents: 1400, category: "Meals" },
    { slug: "frittata", name: "Vegetable Frittata", priceCents: 1600, category: "Meals" },
    { slug: "cookies", name: "Choc Chip Cookies (6)", priceCents: 900, category: "Treats" },
    { slug: "rice-pot", name: "Herbed Rice Pot", priceCents: 950, category: "Sides" },
    { slug: "curry-tray", name: "Vegetable Curry Tray", priceCents: 2400, category: "Meals" },
    { slug: "muffins", name: "Blueberry Muffins (4)", priceCents: 1100, category: "Treats" },
    { slug: "dips-platter", name: "Dips & Crackers", priceCents: 1500, category: "Sides" },
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

  console.log(`Market fixture seeded for stand: ${STAND_SLUG}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
