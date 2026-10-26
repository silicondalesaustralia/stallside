import {
  BATCH_PREFIX,
  CAMPAIGN_NAME,
  CATEGORY_SLUGS,
  CUSTOMER_SOURCE,
  EMAIL_SUFFIX,
  LIST_NAME,
  MARK,
  OFFER_SLUGS,
  ORDER_PREFIX,
  PICKUP_NAME,
  PREORDER_SLUGS,
  PROMO_CODES,
  QR_NAMES,
  SKU_PREFIX,
  SUPPLIER_EMAIL,
  TAG_NAMES,
  UPSELL_NAME,
  type Db,
  type Scope,
} from "./context";

/** Deletes every row the seed created (matched by its markers). Real data is left alone. */
export async function resetMockData(db: Db, { ownerId, standId }: Scope): Promise<void> {
  const counts: Record<string, number> = {};
  const note = (key: string, r: { count: number }) => (counts[key] = r.count);

  note("reviews", await db.review.deleteMany({ where: { ownerId, authorEmail: { endsWith: EMAIL_SUFFIX } } }));
  note("campaigns", await db.campaign.deleteMany({ where: { ownerId, name: CAMPAIGN_NAME } }));
  note("lists", await db.customerSegment.deleteMany({ where: { ownerId, name: LIST_NAME } }));
  note("tags", await db.customerTag.deleteMany({ where: { ownerId, name: { in: TAG_NAMES } } }));

  const orders = await db.order.findMany({
    where: { ownerId, orderNumber: { startsWith: ORDER_PREFIX } },
    select: { id: true },
  });
  const orderIds = orders.map((o) => o.id);
  const seededStock = await db.inventoryAdjustment.groupBy({
    by: ["productId"],
    where: {
      ownerId,
      AND: [
        { OR: [{ product: { sku: null } }, { product: { sku: { not: { startsWith: SKU_PREFIX } } } }] },
        { OR: [{ orderId: { in: orderIds } }, { reason: { contains: MARK } }] },
      ],
    },
    _sum: { changeQuantity: true },
  });
  for (const row of seededStock) {
    const change = row._sum.changeQuantity ?? 0;
    if (change) await db.product.update({ where: { id: row.productId }, data: { stockQuantity: { decrement: change } } });
  }
  note("orderStock", await db.inventoryAdjustment.deleteMany({ where: { orderId: { in: orderIds } } }));
  note("orders", await db.order.deleteMany({ where: { id: { in: orderIds } } }));

  note("subscribers", await db.shopperSubscription.deleteMany({ where: { ownerId, customerEmail: { endsWith: EMAIL_SUFFIX } } }));
  note("offers", await db.subscriptionOffer.deleteMany({ where: { standId, slug: { in: OFFER_SLUGS } } }));
  note("preOrderPages", await db.preOrderPage.deleteMany({ where: { standId, slug: { in: PREORDER_SLUGS } } }));
  note("upsells", await db.upsell.deleteMany({ where: { ownerId, name: UPSELL_NAME } }));
  note("qr", await db.qrCode.deleteMany({ where: { ownerId, name: { in: QR_NAMES } } }));
  note("promotions", await db.promotion.deleteMany({ where: { ownerId, code: { in: PROMO_CODES } } }));
  note("pickupWindows", await db.pickupWindow.deleteMany({ where: { ownerId, pickupLocation: { name: PICKUP_NAME } } }));
  note("pickupLocations", await db.pickupLocation.deleteMany({ where: { ownerId, name: PICKUP_NAME } }));

  note("batches", await db.productionBatch.deleteMany({ where: { ownerId, batchCode: { startsWith: BATCH_PREFIX } } }));
  note("batchStock", await db.inventoryAdjustment.deleteMany({ where: { ownerId, reason: { contains: MARK } } }));
  note("products", await db.product.deleteMany({ where: { ownerId, sku: { startsWith: SKU_PREFIX } } }));

  const recipes = await db.recipe.findMany({ where: { ownerId, prepNotes: MARK }, select: { id: true } });
  const recipeIds = recipes.map((r) => r.id);
  note("recipeLinks", await db.productRecipe.deleteMany({ where: { recipeId: { in: recipeIds } } }));
  note("recipes", await db.recipe.deleteMany({ where: { id: { in: recipeIds } } }));
  note("materials", await db.ingredient.deleteMany({ where: { ownerId, notes: MARK } }));
  note("categories", await db.category.deleteMany({ where: { ownerId, slug: { in: CATEGORY_SLUGS } } }));
  note("customers", await db.customer.deleteMany({ where: { ownerId, source: CUSTOMER_SOURCE } }));
  note("suppliers", await db.standMember.deleteMany({ where: { standId, email: SUPPLIER_EMAIL } }));

  console.log("Reset:", counts);
}
