/**
 * Seeds 2 categories and 10 synthetic products for a testing account. Testing DB only; idempotent.
 * Usage: npx tsx scripts/seed-mock-products.ts <owner-email>
 */
import "dotenv/config";
import { PrismaClient, ProductChannelType, InventorySource, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { MOCK_CATEGORIES, MOCK_IMAGE, MOCK_PRODUCTS, type MockProduct } from "./mock-products-data";

const cents = (dollars: number) => Math.round(dollars * 100);

function testingDbUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!new URL(url).hostname.startsWith("ep-icy-lake")) throw new Error("Refusing: not the testing database");
  return url;
}

function productData(p: MockProduct, i: number, currency: string, brand: string) {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description,
    imageUrl: MOCK_IMAGE,
    imageAlts: { [MOCK_IMAGE]: p.name },
    seoTitle: `${p.name} | ${brand}`,
    seoDescription: p.description.slice(0, 155),
    priceCents: cents(p.price),
    compareAtPriceCents: p.compareAt ? cents(p.compareAt) : null,
    costCents: cents(p.cost),
    sku: `MOCK-${String(i + 1).padStart(3, "0")}`,
    upc: `93000000${String(i + 1).padStart(5, "0")}`,
    currency,
    stockQuantity: p.stock,
    lowStockThreshold: Math.max(2, Math.round(p.stock / 4)),
    freshnessNote: p.freshness ?? null,
    fulfilment: p.fulfilment,
    preOrderEligible: p.preOrderEligible ?? false,
    priceTiers: p.tiers
      ? p.tiers.map((t) => ({ qty: t.qty, totalCents: cents(t.total) }))
      : Prisma.DbNull,
    sortOrder: i,
  };
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: seed-mock-products.ts <owner-email>");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: testingDbUrl() }) });
  try {
    const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
    const owner = user ? await prisma.owner.findUnique({ where: { userId: user.id } }) : null;
    if (!owner) throw new Error(`No owner for ${email}`);
    const stand = await prisma.stand.findFirst({ where: { ownerId: owner.id }, orderBy: { createdAt: "asc" } });
    if (!stand) throw new Error("Owner has no stand");

    const categoryIds = new Map<string, string>();
    for (const [i, c] of MOCK_CATEGORIES.entries()) {
      const row = await prisma.category.upsert({
        where: { ownerId_slug: { ownerId: owner.id, slug: c.slug } },
        create: { ownerId: owner.id, ...c, imageUrl: MOCK_IMAGE, sortOrder: i },
        update: {},
      });
      categoryIds.set(c.slug, row.id);
    }

    let created = 0;
    for (const [i, p] of MOCK_PRODUCTS.entries()) {
      const exists = await prisma.product.findFirst({ where: { standId: stand.id, slug: p.slug }, select: { id: true } });
      if (exists) continue;
      const categoryId = categoryIds.get(p.category);
      if (!categoryId) throw new Error(`Unknown category ${p.category}`);
      await prisma.product.create({
        data: {
          ...productData(p, i, stand.currency, owner.businessName),
          ownerId: owner.id,
          standId: stand.id,
          primaryCategoryId: categoryId,
          categoryLinks: { create: { categoryId, sortOrder: i } },
          channels: {
            create: [
              { channelType: ProductChannelType.STAND, standId: stand.id },
              { channelType: ProductChannelType.ONLINE, standId: stand.id },
            ],
          },
          optionGroups: p.options
            ? {
                create: {
                  name: p.options.name,
                  choices: {
                    create: p.options.choices.map((c, j) => ({
                      name: c.name,
                      priceDeltaCents: cents(c.delta),
                      sortOrder: j,
                    })),
                  },
                },
              }
            : undefined,
          inventoryAdjustments: {
            create: {
              ownerId: owner.id,
              standId: stand.id,
              changeQuantity: p.stock,
              previousQuantity: 0,
              newQuantity: p.stock,
              reason: "Initial stock",
              source: InventorySource.OWNER_MANUAL,
            },
          },
        },
      });
      created += 1;
    }
    if (created > 0) {
      await prisma.owner.updateMany({
        where: { id: owner.id, firstProductLiveAt: null },
        data: { firstProductLiveAt: new Date() },
      });
    }
    console.log(`Categories: ${categoryIds.size}. Products created: ${created} (skipped ${MOCK_PRODUCTS.length - created}).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
