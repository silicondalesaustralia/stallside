import { PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  batchesForProductDemand,
  contributionCents,
  roundCents,
  surplusFromBatches,
  toNumber,
} from "@/lib/production/costing";
import { costRecipe } from "@/lib/production/recipe-cost";
import { flattenRecipeIngredientsForOwner } from "@/lib/production/flatten-ingredients-db";
import {
  convertMeasure,
  preferDisplayUnit,
  measureFamily,
  type MeasureUnitCode,
  unitLabel,
} from "@/lib/production/units";

/** Same paid-demand set as Collections/sales metrics. */
export const PRODUCTION_PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.CUSTOMER_CONFIRMED,
  PaymentStatus.DEPOSIT_PAID,
  PaymentStatus.BALANCE_DUE,
  PaymentStatus.BALANCE_FAILED,
];

export type ProductionProductRow = {
  productId: string;
  name: string;
  quantity: number;
  revenueCents: number;
  recipeId: string | null;
  recipeName: string | null;
  exactBatches: number | null;
  suggestedBatches: number | null;
  suggestedOutput: number | null;
  surplusYield: number | null;
  yieldLabel: string | null;
  ingredientCostCents: number | null;
  packagingCostCents: number;
};

export type ProductionIngredientRow = {
  key: string;
  name: string;
  quantity: number;
  unit: MeasureUnitCode;
  unitDisplay: string;
  costCents: number;
};

export type ProductionGroup = {
  groupKey: string;
  title: string;
  dateLabel: string;
  collectionAt: Date | null;
  menuId: string | null;
  orderCount: number;
  revenueCents: number;
  currency: string;
  products: ProductionProductRow[];
  ingredients: ProductionIngredientRow[];
  ingredientCostCents: number;
  packagingCostCents: number;
  contributionCents: number;
};

function dayKey(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function formatDayTitle(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

export async function loadProductionOrders(input: {
  ownerId: string;
  standId: string;
  from: Date;
  to: Date;
}) {
  return prisma.order.findMany({
    where: {
      ownerId: input.ownerId,
      standId: input.standId,
      paymentStatus: { in: PRODUCTION_PAYMENT_STATUSES },
      OR: [
        { collectionAt: { gte: input.from, lt: input.to } },
        {
          AND: [
            { isPreOrder: false },
            { createdAt: { gte: input.from, lt: input.to } },
          ],
        },
      ],
    },
    orderBy: [{ collectionAt: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      orderNumber: true,
      totalCents: true,
      currency: true,
      collectionAt: true,
      createdAt: true,
      isPreOrder: true,
      fulfilment: {
        select: {
          fulfilmentOptionId: true,
          optionLabel: true,
          windowLabel: true,
          collectionStartsAt: true,
        },
      },
      items: {
        select: {
          productId: true,
          productNameSnapshot: true,
          optionsSnapshot: true,
          quantity: true,
          lineTotalCents: true,
          product: {
            select: {
              id: true,
              name: true,
              packagingCostCents: true,
              productRecipe: {
                select: {
                  recipeId: true,
                  yieldUnitsPerProduct: true,
                  recipe: {
                    select: {
                      id: true,
                      name: true,
                      yieldQuantity: true,
                      yieldLabel: true,
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

type LoadedOrder = Awaited<ReturnType<typeof loadProductionOrders>>[number];

async function buildGroupFromOrders(input: {
  ownerId: string;
  groupKey: string;
  title: string;
  dateLabel: string;
  collectionAt: Date | null;
  menuId: string | null;
  orders: LoadedOrder[];
  currency: string;
}): Promise<ProductionGroup> {
  const productMap = new Map<
    string,
    {
      productId: string;
      name: string;
      quantity: number;
      revenueCents: number;
      packagingCostCents: number;
      link: LoadedOrder["items"][number]["product"]["productRecipe"];
    }
  >();

  for (const order of input.orders) {
    for (const item of order.items) {
      const key = item.productId;
      const existing = productMap.get(key);
      const packaging = item.product.packagingCostCents ?? 0;
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenueCents += item.lineTotalCents;
      } else {
        productMap.set(key, {
          productId: item.productId,
          name: item.product.name || item.productNameSnapshot,
          quantity: item.quantity,
          revenueCents: item.lineTotalCents,
          packagingCostCents: packaging,
          link: item.product.productRecipe,
        });
      }
    }
  }

  const products: ProductionProductRow[] = [];
  const ingredientAgg = new Map<
    string,
    { name: string; family: ReturnType<typeof measureFamily>; baseQty: number; cost: number; baseUnit: MeasureUnitCode }
  >();

  let ingredientCost = 0;
  let packagingCost = 0;

  for (const row of productMap.values()) {
    packagingCost += row.packagingCostCents * row.quantity;
    let exactBatches: number | null = null;
    let suggestedBatches: number | null = null;
    let suggestedOutput: number | null = null;
    let surplusYield: number | null = null;
    let recipeId: string | null = null;
    let recipeName: string | null = null;
    let yieldLabel: string | null = null;
    let rowIngredientCost: number | null = null;

    const link = row.link;
    if (link?.recipe?.isActive) {
      recipeId = link.recipe.id;
      recipeName = link.recipe.name;
      yieldLabel = link.recipe.yieldLabel;
      const yieldQty = toNumber(link.recipe.yieldQuantity);
      const yup = toNumber(link.yieldUnitsPerProduct);
      exactBatches = batchesForProductDemand({
        productUnits: row.quantity,
        yieldUnitsPerProduct: yup,
        recipeYieldQuantity: yieldQty,
      });
      suggestedBatches =
        exactBatches <= 0 ? 0 : Math.ceil(exactBatches - 1e-9);
      suggestedOutput = suggestedBatches * yieldQty;
      surplusYield = surplusFromBatches({
        exactBatches,
        suggestedBatches,
        recipeYieldQuantity: yieldQty,
      });

      try {
        const activeRecipeId = link.recipe.id;
        const cost = await costRecipe(input.ownerId, activeRecipeId);
        rowIngredientCost = roundCents(cost.totalCents * exactBatches);
        ingredientCost += rowIngredientCost;

        const flatNeeds = await flattenRecipeIngredientsForOwner(
          input.ownerId,
          activeRecipeId,
          exactBatches,
        );
        for (const need of flatNeeds) {
          const family = measureFamily(need.baseUnit);
          const prev = ingredientAgg.get(need.ingredientId);
          if (prev) {
            if (prev.baseUnit !== need.baseUnit) {
              prev.baseQty += convertMeasure(
                need.quantityInBase,
                need.baseUnit,
                prev.baseUnit,
              );
            } else {
              prev.baseQty += need.quantityInBase;
            }
            prev.cost += need.costCents;
          } else {
            ingredientAgg.set(need.ingredientId, {
              name: need.name,
              family,
              baseQty: need.quantityInBase,
              cost: need.costCents,
              baseUnit: need.baseUnit,
            });
          }
        }
      } catch {
        rowIngredientCost = null;
      }
    }

    products.push({
      productId: row.productId,
      name: row.name,
      quantity: row.quantity,
      revenueCents: row.revenueCents,
      recipeId,
      recipeName,
      exactBatches,
      suggestedBatches,
      suggestedOutput,
      surplusYield,
      yieldLabel,
      ingredientCostCents: rowIngredientCost,
      packagingCostCents: row.packagingCostCents * row.quantity,
    });
  }

  products.sort((a, b) => a.name.localeCompare(b.name));

  const ingredients: ProductionIngredientRow[] = [...ingredientAgg.values()]
    .map((v) => {
      const display = preferDisplayUnit(v.baseQty, v.family);
      return {
        key: `${v.name}:${display.unit}`,
        name: v.name,
        quantity: display.quantity,
        unit: display.unit,
        unitDisplay: unitLabel(display.unit),
        costCents: roundCents(v.cost),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const revenueCents = input.orders.reduce((s, o) => s + o.totalCents, 0);

  return {
    groupKey: input.groupKey,
    title: input.title,
    dateLabel: input.dateLabel,
    collectionAt: input.collectionAt,
    menuId: input.menuId,
    orderCount: input.orders.length,
    revenueCents,
    currency: input.currency,
    products,
    ingredients,
    ingredientCostCents: roundCents(ingredientCost),
    packagingCostCents: packagingCost,
    contributionCents: contributionCents({
      revenueCents,
      ingredientCostCents: ingredientCost,
      packagingCostCents: packagingCost,
    }),
  };
}

export async function buildProductionGroups(input: {
  ownerId: string;
  standId: string;
  from: Date;
  to: Date;
  timeZone: string;
  menuId?: string | null;
}): Promise<ProductionGroup[]> {
  const orders = await loadProductionOrders(input);
  if (orders.length === 0) return [];

  const currency = orders[0]?.currency ?? "AUD";

  // Optional filter: orders whose items intersect a menu's products.
  let filtered = orders;
  let menuTitle: string | null = null;
  if (input.menuId) {
    const menu = await prisma.menu.findFirst({
      where: {
        id: input.menuId,
        ownerId: input.ownerId,
        standId: input.standId,
      },
      select: {
        id: true,
        title: true,
        items: { select: { productId: true } },
      },
    });
    if (!menu) return [];
    menuTitle = menu.title;
    const ids = new Set(menu.items.map((i) => i.productId));
    filtered = orders.filter((o) =>
      o.items.some((it) => ids.has(it.productId)),
    );
  }

  const byDay = new Map<string, LoadedOrder[]>();
  for (const order of filtered) {
    const when = order.collectionAt ?? order.createdAt;
    const key = dayKey(when, input.timeZone);
    const list = byDay.get(key) ?? [];
    list.push(order);
    byDay.set(key, list);
  }

  const groups: ProductionGroup[] = [];
  for (const [day, dayOrders] of [...byDay.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    const when = dayOrders[0]?.collectionAt ?? dayOrders[0]?.createdAt ?? null;
    const title = menuTitle
      ? `${menuTitle} · ${formatDayTitle(when ?? new Date(), input.timeZone)}`
      : formatDayTitle(when ?? new Date(), input.timeZone);
    const groupKey = input.menuId
      ? `menu:${input.menuId}:${day}`
      : `day:${day}`;
    groups.push(
      await buildGroupFromOrders({
        ownerId: input.ownerId,
        groupKey,
        title,
        dateLabel: day,
        collectionAt: when,
        menuId: input.menuId ?? null,
        orders: dayOrders,
        currency,
      }),
    );
  }
  return groups;
}
