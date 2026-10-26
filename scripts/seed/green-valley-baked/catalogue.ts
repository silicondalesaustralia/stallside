import { COOKIE_PRODUCT_NAME, SKU_PREFIX, type Db, type Scope } from "./context";
import type { RecipeIds } from "./recipes";

export type ProductRef = { id: string; name: string; priceCents: number };
export type Catalogue = { focaccia: ProductRef; cookies: ProductRef; draft: ProductRef };

const FOCACCIA_CENTS = 1050;
const COOKIE_CENTS = 1200;

/** Categories, the focaccia + a hidden draft, the existing cookie bag repriced, and recipe links. */
export async function seedCatalogue(db: Db, scope: Scope, recipes: RecipeIds): Promise<Catalogue> {
  const { ownerId, standId, currency } = scope;
  const breads = await db.category.create({
    data: { ownerId, title: "Breads", slug: "breads", description: "Baked fresh every Friday.", sortOrder: 0 },
  });
  const sweets = await db.category.create({
    data: { ownerId, title: "Cookies & Sweet Treats", slug: "cookies-sweet-treats", sortOrder: 1 },
  });

  const focaccia = await db.product.create({
    data: {
      ownerId,
      standId,
      currency,
      name: "Rosemary & Sea Salt Focaccia",
      slug: "rosemary-sea-salt-focaccia",
      description: "A tray-baked loaf with olive oil, fresh rosemary and flaky sea salt. Serves 4-6.",
      priceCents: FOCACCIA_CENTS,
      sku: `${SKU_PREFIX}FOCACCIA`,
      lowStockThreshold: 5,
      preOrderEligible: true,
      freshnessNote: "Best on the day; refresh in a hot oven for 5 min.",
      primaryCategoryId: breads.id,
      sortOrder: 0,
    },
    select: { id: true, name: true, priceCents: true },
  });
  const draft = await db.product.create({
    data: {
      ownerId,
      standId,
      currency,
      name: "Olive & Feta Focaccia",
      slug: "olive-feta-focaccia",
      description: "Coming soon: kalamata olives and crumbled feta.",
      priceCents: 1250,
      sku: `${SKU_PREFIX}OLIVE-FETA`,
      isHidden: true,
      primaryCategoryId: breads.id,
      sortOrder: 2,
    },
    select: { id: true, name: true, priceCents: true },
  });

  const existing = await db.product.findFirst({
    where: { ownerId, standId, name: COOKIE_PRODUCT_NAME, isArchived: false },
    select: { id: true },
  });
  if (!existing) throw new Error(`Cookie product "${COOKIE_PRODUCT_NAME}" not found`);
  const cookies = await db.product.update({
    where: { id: existing.id },
    data: { priceCents: COOKIE_CENTS, preOrderEligible: true, primaryCategoryId: sweets.id, lowStockThreshold: 6 },
    select: { id: true, name: true, priceCents: true },
  });

  await db.productCategory.createMany({
    data: [
      { productId: focaccia.id, categoryId: breads.id, sortOrder: 0 },
      { productId: draft.id, categoryId: breads.id, sortOrder: 1 },
      { productId: cookies.id, categoryId: sweets.id, sortOrder: 0 },
    ],
    skipDuplicates: true,
  });
  for (const productId of [focaccia.id, draft.id, cookies.id]) {
    for (const channelType of ["STAND", "ONLINE"] as const) {
      await db.productChannel.upsert({
        where: { productId_channelType_standId: { productId, channelType, standId } },
        create: { productId, channelType, standId, isEnabled: true },
        update: { isEnabled: true },
      });
    }
  }

  await db.productRecipe.create({ data: { productId: focaccia.id, recipeId: recipes.focaccia, yieldUnitsPerProduct: 1 } });
  await db.productRecipe.deleteMany({ where: { productId: cookies.id } });
  await db.productRecipe.create({ data: { productId: cookies.id, recipeId: recipes.cookies, yieldUnitsPerProduct: 6 } });

  return { focaccia, cookies, draft };
}
