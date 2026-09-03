/**
 * Seed a credible artisan bakery fixture for Website Studio visual QA.
 * Targets STAND_SLUG only — does not modify other sellers.
 *
 * Usage: npx tsx scripts/seed-artisan-bakery-fixture.ts
 */
import "dotenv/config";
import { PrismaClient, MenuKind } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const STAND_SLUG = process.env.STUDIO_FIXTURE_STAND_SLUG ?? "green-valley-baked-goods";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const stand = await prisma.stand.findFirst({ where: { slug: STAND_SLUG } });
  if (!stand) throw new Error(`Stand ${STAND_SLUG} not found`);

  const ownerId = stand.ownerId;
  const categories = ["Bread", "Pastries", "Cakes"];
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
    { slug: "sourdough-loaf", name: "Country Sourdough", priceCents: 850, category: "Bread" },
    { slug: "olive-focaccia", name: "Olive & Rosemary Focaccia", priceCents: 700, category: "Bread" },
    { slug: "croissant", name: "Butter Croissant", priceCents: 450, category: "Pastries" },
    { slug: "pain-au-choc", name: "Pain au Chocolat", priceCents: 500, category: "Pastries" },
    { slug: "cinnamon-scroll", name: "Cinnamon Scroll", priceCents: 550, category: "Pastries" },
    { slug: "seasonal-tart", name: "Seasonal Fruit Tart", priceCents: 650, category: "Cakes" },
    { slug: "almond-slice", name: "Almond Slice", priceCents: 480, category: "Cakes" },
    { slug: "baguette", name: "Traditional Baguette", priceCents: 420, category: "Bread" },
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
            isArchived: false,
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

  await prisma.storefront.update({
    where: { ownerId },
    data: {
      headline: "Hearth & Crumb Bakery",
      subheadline: "Slow-fermented bread and viennoiserie, baked fresh in the Adelaide Hills.",
      about: "We started in a home kitchen with a starter named Margaret. Today we bake for farmers markets and pre-order collections every week.",
      themePreset: "modern",
    },
  });

  const orderByAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const collectionAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  await prisma.menu.upsert({
    where: { standId_slug: { standId: stand.id, slug: "saturday-bake" } },
    create: {
      ownerId,
      standId: stand.id,
      title: "Saturday Bake",
      slug: "saturday-bake",
      description: "Pre-order pastries and loaves for Saturday collection.",
      kind: MenuKind.PREORDER_DROP,
      isActive: true,
      showOnShop: true,
      orderByAt,
      collectionAt,
      collectionNote: "Collect from our bakery counter 8am–12pm",
    },
    update: {
      title: "Saturday Bake",
      description: "Pre-order pastries and loaves for Saturday collection.",
      kind: MenuKind.PREORDER_DROP,
      isActive: true,
      showOnShop: true,
      orderByAt,
      collectionAt,
    },
  });

  console.log(`Artisan bakery fixture updated for ${STAND_SLUG}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
