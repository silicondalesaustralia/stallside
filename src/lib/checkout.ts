import { prisma } from "@/lib/prisma";
import { InventorySource, type Prisma } from "@/generated/prisma/client";
import {
  CART_MIX_COLLECTION_DAYS,
  CART_MIX_TAKE_NOW_PREORDER,
} from "@/lib/pre-order";
import {
  formatOptionsSnapshot,
  unitPriceWithOptions,
} from "@/lib/product-options";
import { productLiveWhere } from "@/lib/product-visibility";

export type CartItemInput = {
  productId: string;
  quantity: number;
  choiceIds?: string[];
};

type Tx = Prisma.TransactionClient;

export type PreOrderCartMeta = {
  isPreOrder: true;
  collectionAt: Date;
  collectionNote: string | null;
};

export async function loadStandCart(standSlug: string, items: CartItemInput[]) {
  if (!items.length) {
    return { error: "Add at least one item." as const };
  }

  const normalized = items.map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity),
    choiceIds: Array.isArray(item.choiceIds)
      ? item.choiceIds.map(String)
      : [],
  }));

  const stand = await prisma.stand.findUnique({
    where: { slug: standSlug },
    include: { owner: true },
  });
  if (!stand || !stand.isActive) {
    return { error: "This stand is not available." as const };
  }

  const productIds = [...new Set(normalized.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, standId: stand.id, ...productLiveWhere },
    include: {
      optionGroups: {
        orderBy: { sortOrder: "asc" },
        include: { choices: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (products.length !== productIds.length) {
    return { error: "One or more products are unavailable." as const };
  }

  const byId = new Map(products.map((p) => [p.id, p]));
  const now = Date.now();
  let preOrderCart: PreOrderCartMeta | null = null;
  let sawTakeNow = false;

  const qtyByProduct = new Map<string, number>();
  for (const item of normalized) {
    qtyByProduct.set(
      item.productId,
      (qtyByProduct.get(item.productId) ?? 0) + item.quantity,
    );
  }

  for (const item of normalized) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return { error: "Quantities must be whole numbers." as const };
    }
    const product = byId.get(item.productId);
    if (!product) {
      return { error: "One or more products are unavailable." as const };
    }
    const groups = product.optionGroups;
    if (groups.length > 0) {
      if (item.choiceIds.length !== groups.length) {
        return { error: "Choose an option for each product choice." as const };
      }
      for (let i = 0; i < groups.length; i++) {
        const choice = groups[i].choices.find((c) => c.id === item.choiceIds[i]);
        if (!choice) {
          return { error: "One or more product options are invalid." as const };
        }
      }
    } else if (item.choiceIds.length > 0) {
      return { error: "One or more product options are invalid." as const };
    }
  }

  for (const [productId, qty] of qtyByProduct) {
    const product = byId.get(productId)!;
    if (product.stockQuantity < qty) {
      return { error: "Not enough stock for one of your items." as const };
    }
  }

  for (const item of normalized) {
    const product = byId.get(item.productId)!;
    if (product.isPreOrder) {
      if (!product.orderByAt || !product.collectionAt) {
        return { error: "A pre-order product is misconfigured." as const };
      }
      if (product.orderByAt.getTime() <= now) {
        return { error: "Pre-orders for one of your items have closed." as const };
      }
      if (sawTakeNow) {
        return { error: CART_MIX_TAKE_NOW_PREORDER } as const;
      }
      if (preOrderCart) {
        if (preOrderCart.collectionAt.getTime() !== product.collectionAt.getTime()) {
          return { error: CART_MIX_COLLECTION_DAYS } as const;
        }
      } else {
        preOrderCart = {
          isPreOrder: true,
          collectionAt: product.collectionAt,
          collectionNote: product.collectionNote,
        };
      }
    } else {
      sawTakeNow = true;
      if (preOrderCart) {
        return { error: CART_MIX_TAKE_NOW_PREORDER } as const;
      }
    }
  }

  const lineData = normalized.map((item) => {
    const product = byId.get(item.productId)!;
    const picked = product.optionGroups.map((g, i) => {
      const choice = g.choices.find((c) => c.id === item.choiceIds[i])!;
      return { name: g.name, choiceName: choice.name, delta: choice.priceDeltaCents };
    });
    const unitPriceCents = unitPriceWithOptions(
      product.priceCents,
      picked.map((p) => p.delta),
    );
    return {
      productId: product.id,
      productNameSnapshot: product.name,
      optionsSnapshot: formatOptionsSnapshot(
        picked.map((p) => ({ name: p.name, choiceName: p.choiceName })),
      ),
      quantity: item.quantity,
      unitPriceCents,
      lineTotalCents: unitPriceCents * item.quantity,
    };
  });
  const totalCents = lineData.reduce((sum, l) => sum + l.lineTotalCents, 0);

  // Stock decrement uses aggregated qty per product
  const stockItems = [...qtyByProduct.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  return {
    stand,
    byId,
    items: stockItems,
    lineData,
    totalCents,
    preOrderCart,
  };
}

export async function decrementStockForOrder(
  tx: Tx,
  input: {
    items: CartItemInput[];
    byId: Map<string, { id: string; stockQuantity: number }>;
    ownerId: string;
    standId: string;
    orderId: string;
    source:
      | typeof InventorySource.ORDER_CASH
      | typeof InventorySource.ORDER_LOCAL_TRANSFER
      | typeof InventorySource.ORDER_CARD
      | typeof InventorySource.ORDER_PAYPAL;
    reason: string;
  },
) {
  for (const item of input.items) {
    const updated = await tx.product.updateMany({
      where: { id: item.productId, stockQuantity: { gte: item.quantity } },
      data: { stockQuantity: { decrement: item.quantity } },
    });
    if (updated.count !== 1) {
      throw new Error("STOCK");
    }
  }

  for (const item of input.items) {
    const product = input.byId.get(item.productId)!;
    await tx.inventoryAdjustment.create({
      data: {
        productId: product.id,
        ownerId: input.ownerId,
        standId: input.standId,
        changeQuantity: -item.quantity,
        previousQuantity: product.stockQuantity,
        newQuantity: product.stockQuantity - item.quantity,
        reason: input.reason,
        source: input.source,
        orderId: input.orderId,
      },
    });
  }
}
