import { prisma } from "@/lib/prisma";
import { InventorySource, type Prisma } from "@/generated/prisma/client";
import {
  computeFirstOrderDiscount,
  normalizeReceiptEmail,
} from "@/lib/first-order-discount";
import {
  CART_MIX_COLLECTION_DAYS,
  CART_MIX_PREORDER_SETTINGS,
  CART_MIX_TAKE_NOW_PREORDER,
} from "@/lib/pre-order";
import {
  formatOptionsSnapshot,
  unitPriceWithOptions,
} from "@/lib/product-options";
import { parsePriceTiers, lineTotalWithTiers } from "@/lib/price-tiers";
import { productLiveWhere } from "@/lib/product-visibility";
import { resolveAddonPricing } from "@/lib/preorder-upsell-pricing";
import { ruleUpsellUnitCents } from "@/lib/cart-upsell";
import { loadUpsellRules } from "@/lib/upsells/load-rules";
import { pickBetterDiscount } from "@/lib/discounts/compute";
import { resolveDiscountCode, type DiscountChannel } from "@/lib/discounts/resolve-code";
import { supplierLineSnapshot } from "@/lib/suppliers/snapshot";
import { lineGstCents } from "@/lib/gst";
import { includedTaxRule } from "@/lib/order-gst";
import { taxConfig, taxRule as taxRuleOf } from "@/lib/tax/config";
import {
  applyLotSharesToOrderItem,
  consumeStockLots,
} from "@/lib/suppliers/lots";
import {
  CUSTOMER_CHOICE_MAX_CENTS,
  CUSTOMER_CHOICE_MIN_CENTS,
  CUSTOMER_CHOICE_PRODUCT_NAME,
} from "@/lib/customer-choice-constants";
import {
  HandoverMode,
  PaymentStatus,
  PaymentTiming,
} from "@/generated/prisma/client";

export type CartItemInput = {
  productId: string;
  quantity: number;
  choiceIds?: string[];
  /** Use stand upsell price (ignore tiers) for this line. */
  asUpsell?: boolean;
};

type Tx = Prisma.TransactionClient;

export type PreOrderCartMeta = {
  isPreOrder: true;
  collectionAt: Date;
  collectionNote: string | null;
  paymentTiming: PaymentTiming;
  depositPercent: number | null;
  handoverMode: HandoverMode;
};

export type CartLineData = {
  productId: string;
  productNameSnapshot: string;
  optionsSnapshot: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  usedTier: boolean;
  usedUpsell: boolean;
  memberId: string | null;
  supplierUnitCents: number | null;
  gstFree: boolean;
};

/** True if this email already has a completed order at the stand. */
export async function emailHasPriorOrderAtStand(
  standId: string,
  email: string,
): Promise<boolean> {
  const normalized = normalizeReceiptEmail(email);
  if (!normalized) return true;
  const prior = await prisma.order.findFirst({
    where: {
      standId,
      receiptEmail: { equals: normalized, mode: "insensitive" },
      paymentStatus: {
        in: [PaymentStatus.CUSTOMER_CONFIRMED, PaymentStatus.PAID],
      },
    },
    select: { id: true },
  });
  return Boolean(prior);
}

export async function loadCustomerChoiceCheckout(
  standSlug: string,
  amountCents: number,
) {
  if (
    !Number.isInteger(amountCents) ||
    amountCents < CUSTOMER_CHOICE_MIN_CENTS
  ) {
    return {
      error: `Enter at least ${(CUSTOMER_CHOICE_MIN_CENTS / 100).toFixed(2)}.` as const,
    };
  }
  if (amountCents > CUSTOMER_CHOICE_MAX_CENTS) {
    return {
      error: `Amount cannot exceed ${(CUSTOMER_CHOICE_MAX_CENTS / 100).toFixed(0)}.` as const,
    };
  }

  const stand = await prisma.stand.findUnique({
    where: { slug: standSlug },
    include: { owner: true },
  });
  if (!stand || !stand.isActive) {
    return { error: "This stand is not available." as const };
  }
  if (stand.cartMode !== "CUSTOMER_CHOICE") {
    return { error: "This stand uses product checkout." as const };
  }
  if (!stand.customerChoiceProductId) {
    return { error: "Customer Choice is not set up for this stand." as const };
  }

  const product = await prisma.product.findFirst({
    where: {
      id: stand.customerChoiceProductId,
      standId: stand.id,
      isArchived: false,
    },
  });
  if (!product) {
    return { error: "Customer Choice is not set up for this stand." as const };
  }

  const lineData: CartLineData[] = [
    {
      productId: product.id,
      productNameSnapshot: CUSTOMER_CHOICE_PRODUCT_NAME,
      optionsSnapshot: null,
      quantity: 1,
      unitPriceCents: amountCents,
      lineTotalCents: amountCents,
      usedTier: false,
      usedUpsell: false,
      ...supplierLineSnapshot(product),
      gstFree: product.gstFree,
    },
  ];

  const byId = new Map([[product.id, product]]);
  const stockItems = [{ productId: product.id, quantity: 1 }];

  return {
    stand,
    byId,
    items: stockItems,
    lineData,
    subtotalCents: amountCents,
    discountCents: 0,
    discountLabel: null as string | null,
    taxRule: includedTaxRule(stand.owner, stand.currency),
    taxAddedCents: 0,
    totalCents: amountCents,
    preOrderCart: null,
    skipStock: true as const,
    freeShipping: false,
    promotionId: null as string | null,
    promotionCode: null as string | null,
  };
}

export async function loadStandCart(
  standSlug: string,
  items: CartItemInput[],
  opts?: {
    receiptEmail?: string | null;
    claimFirstOrder?: boolean;
    couponCode?: string | null;
    channel?: DiscountChannel;
    codePreview?: boolean;
  },
) {
  if (!items.length) {
    return { error: "Add at least one item." as const };
  }

  const normalized = items.map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity),
    choiceIds: Array.isArray(item.choiceIds)
      ? item.choiceIds.map(String)
      : [],
    asUpsell: Boolean(item.asUpsell),
  }));

  const stand = await prisma.stand.findUnique({
    where: { slug: standSlug },
    include: { owner: true },
  });
  if (!stand || !stand.isActive) {
    return { error: "This stand is not available." as const };
  }
  if (stand.cartMode === "CUSTOMER_CHOICE") {
    return {
      error: "This stand uses Customer Choice checkout." as const,
    };
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

  const nonUpsellIds = normalized
    .filter((n) => !n.asUpsell)
    .map((n) => n.productId);
  const activePages = await prisma.preOrderPage.findMany({
    where: {
      standId: stand.id,
      isActive: true,
      OR: [
        { preOrderUpsellProductId: { in: productIds } },
        { items: { some: { productId: { in: nonUpsellIds } } } },
      ],
    },
    select: {
      preOrderUpsellProductId: true,
      preOrderUpsellName: true,
      preOrderUpsellPriceCents: true,
      preOrderUpsellDiscountKind: true,
      preOrderUpsellDiscountValue: true,
      items: { select: { productId: true } },
    },
  });
  const pageUpsellByProductId = new Map(
    activePages
      .filter((p) => p.preOrderUpsellProductId && p.preOrderUpsellName)
      .map((p) => [p.preOrderUpsellProductId!, p]),
  );

  const upsellRules = normalized.some((n) => n.asUpsell) ? await loadUpsellRules(stand.id) : [];
  const ruleUpsellCents = (offerProductId: string) =>
    ruleUpsellUnitCents({
      cartLines: normalized,
      products,
      rules: upsellRules,
      standUpsell: stand.upsellProductId
        ? { productId: stand.upsellProductId, priceCents: stand.upsellPriceCents ?? 0 }
        : null,
      offerProductId,
    });

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
    if (item.asUpsell) {
      const allowedByStand =
        stand.upsellProductId === item.productId ||
        stand.preOrderUpsellProductId === item.productId;
      const allowedByPage = pageUpsellByProductId.has(item.productId);
      const allowedByProduct = normalized.some((n) => {
        if (n.asUpsell) return false;
        const trigger = byId.get(n.productId);
        return (
          trigger?.upsellProductId === item.productId ||
          trigger?.preOrderUpsellProductId === item.productId
        );
      });
      const allowedByRule = ruleUpsellCents(item.productId) != null;
      if (!allowedByStand && !allowedByPage && !allowedByProduct && !allowedByRule) {
        return { error: "Upsell is not available." as const };
      }
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
    if (item.asUpsell) continue;
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
      const timing =
        product.paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE
          ? PaymentTiming.DEPOSIT_THEN_BALANCE
          : PaymentTiming.PAY_UPFRONT;
      const depositPercent =
        timing === PaymentTiming.DEPOSIT_THEN_BALANCE
          ? (product.depositPercent ?? 30)
          : null;
      if (preOrderCart) {
        if (preOrderCart.collectionAt.getTime() !== product.collectionAt.getTime()) {
          return { error: CART_MIX_COLLECTION_DAYS } as const;
        }
        if (
          preOrderCart.paymentTiming !== timing ||
          preOrderCart.handoverMode !== product.handoverMode ||
          preOrderCart.depositPercent !== depositPercent
        ) {
          return { error: CART_MIX_PREORDER_SETTINGS } as const;
        }
      } else {
        preOrderCart = {
          isPreOrder: true,
          collectionAt: product.collectionAt,
          collectionNote: product.collectionNote,
          paymentTiming: timing,
          depositPercent,
          handoverMode: product.handoverMode,
        };
      }
    } else {
      sawTakeNow = true;
      if (preOrderCart) {
        return { error: CART_MIX_TAKE_NOW_PREORDER } as const;
      }
    }
  }

  const lineData: CartLineData[] = normalized.map((item) => {
    const product = byId.get(item.productId)!;
    const picked = product.optionGroups.map((g, i) => {
      const choice = g.choices.find((c) => c.id === item.choiceIds[i])!;
      return { name: g.name, choiceName: choice.name, delta: choice.priceDeltaCents };
    });
    const baseUnit = unitPriceWithOptions(
      product.priceCents,
      picked.map((p) => p.delta),
    );

    if (item.asUpsell) {
      const trigger = normalized.find((n) => {
        if (n.asUpsell) return false;
        const t = byId.get(n.productId);
        return (
          t?.upsellProductId === item.productId ||
          t?.preOrderUpsellProductId === item.productId
        );
      });
      let unit = product.priceCents;
      let displayName = product.name;
      const pageOffer = pageUpsellByProductId.get(item.productId);
      if (
        pageOffer &&
        nonUpsellIds.every((id) =>
          pageOffer.items.some((i) => i.productId === id),
        )
      ) {
        if (pageOffer.preOrderUpsellName) {
          displayName = pageOffer.preOrderUpsellName;
        }
        if (
          pageOffer.preOrderUpsellPriceCents != null &&
          pageOffer.preOrderUpsellPriceCents >= 0
        ) {
          unit = resolveAddonPricing(
            pageOffer.preOrderUpsellPriceCents,
            pageOffer.preOrderUpsellDiscountKind,
            pageOffer.preOrderUpsellDiscountValue,
          ).saleCents;
        }
      } else if (trigger) {
        const triggerProduct = byId.get(trigger.productId)!;
        if (triggerProduct.preOrderUpsellProductId === item.productId) {
          if (triggerProduct.preOrderUpsellName) {
            displayName = triggerProduct.preOrderUpsellName;
          }
          if (
            triggerProduct.preOrderUpsellPriceCents != null &&
            triggerProduct.preOrderUpsellPriceCents >= 0
          ) {
            unit = resolveAddonPricing(
              triggerProduct.preOrderUpsellPriceCents,
              triggerProduct.preOrderUpsellDiscountKind,
              triggerProduct.preOrderUpsellDiscountValue,
            ).saleCents;
          }
        } else if (
          triggerProduct.upsellPriceCents != null &&
          triggerProduct.upsellPriceCents >= 0
        ) {
          unit = triggerProduct.upsellPriceCents;
        }
      } else if (stand.preOrderUpsellProductId === item.productId) {
        if (stand.preOrderUpsellName) displayName = stand.preOrderUpsellName;
        if (
          stand.preOrderUpsellPriceCents != null &&
          stand.preOrderUpsellPriceCents >= 0
        ) {
          unit = resolveAddonPricing(
            stand.preOrderUpsellPriceCents,
            stand.preOrderUpsellDiscountKind,
            stand.preOrderUpsellDiscountValue,
          ).saleCents;
        }
      } else if (
        stand.upsellProductId === item.productId &&
        stand.upsellPriceCents != null &&
        stand.upsellPriceCents >= 0
      ) {
        unit = stand.upsellPriceCents;
      }
      const ruleCents = ruleUpsellCents(item.productId);
      if (ruleCents != null) {
        unit = ruleCents;
        displayName = product.name;
      }
      return {
        productId: product.id,
        productNameSnapshot: displayName,
        optionsSnapshot: formatOptionsSnapshot(
          picked.map((p) => ({ name: p.name, choiceName: p.choiceName })),
        ),
        quantity: item.quantity,
        unitPriceCents: unit,
        lineTotalCents: unit * item.quantity,
        usedTier: false,
        usedUpsell: true,
        ...supplierLineSnapshot(product),
        gstFree: product.gstFree,
      };
    }

    const tiers =
      product.optionGroups.length > 0
        ? []
        : parsePriceTiers(product.priceTiers);
    const priced = lineTotalWithTiers(baseUnit, item.quantity, tiers);
    return {
      productId: product.id,
      productNameSnapshot: product.name,
      optionsSnapshot: formatOptionsSnapshot(
        picked.map((p) => ({ name: p.name, choiceName: p.choiceName })),
      ),
      quantity: item.quantity,
      unitPriceCents: priced.unitPriceCents,
      lineTotalCents: priced.lineTotalCents,
      usedTier: priced.usedTier,
      usedUpsell: false,
      ...supplierLineSnapshot(product),
      gstFree: product.gstFree,
    };
  });

  const subtotalCents = lineData.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const usedTier = lineData.some((l) => l.usedTier);

  const firstOrder = { discountCents: 0, label: null as string | null };
  const email = opts?.receiptEmail
    ? normalizeReceiptEmail(opts.receiptEmail)
    : "";
  if (opts?.claimFirstOrder && email && stand.firstOrderDiscountEnabled) {
    const already = await emailHasPriorOrderAtStand(stand.id, email);
    if (!already) {
      const d = computeFirstOrderDiscount({
        enabled: true,
        percent: stand.firstOrderDiscountPercent,
        amountCents: stand.firstOrderDiscountAmountCents,
        subtotalCents,
        usedTier,
      });
      firstOrder.discountCents = d.discountCents;
      firstOrder.label = d.label;
    }
  }

  const code = opts?.couponCode?.trim()
    ? await resolveDiscountCode({
        ownerId: stand.ownerId,
        standId: stand.id,
        currency: stand.currency,
        rawCode: opts.couponCode,
        email,
        lines: lineData,
        channel: opts.channel,
        hasPriorOrder: () => emailHasPriorOrderAtStand(stand.id, email),
        emailOptional: opts.codePreview,
      })
    : null;
  if (code && "error" in code) return { error: code.error };
  const chosen = pickBetterDiscount(firstOrder, code);
  const discountCents = chosen.discountCents;
  const discountLabel = chosen.label;
  const freeShipping = Boolean(code?.freeShipping);
  const promotionId = code && (chosen.usedCode || freeShipping) ? code.promotionId : null;
  const promotionCode = promotionId ? (code?.code ?? null) : null;

  const taxRule = taxRuleOf(taxConfig(stand.owner, stand.currency));
  const taxAddedCents = taxRule?.inclusive
    ? 0
    : lineGstCents(lineData, discountCents, taxRule).reduce((sum, cents) => sum + cents, 0);
  const totalCents = Math.max(0, subtotalCents - discountCents) + taxAddedCents;

  const stockItems = [...qtyByProduct.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  return {
    stand,
    byId,
    items: stockItems,
    lineData,
    subtotalCents,
    discountCents,
    discountLabel,
    taxRule,
    /** Sales tax added on top of prices (US/CA); already inside `totalCents`. */
    taxAddedCents,
    totalCents,
    preOrderCart,
    skipStock: false as const,
    freeShipping,
    promotionId,
    promotionCode,
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
      | typeof InventorySource.ORDER_PAYPAL
      | typeof InventorySource.ORDER_SQUARE;
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

  const orderItems = await tx.orderItem.findMany({
    where: { orderId: input.orderId },
    orderBy: { createdAt: "asc" },
    select: { id: true, productId: true, quantity: true },
  });
  for (const orderItem of orderItems) {
    const activeLots = await tx.stockLot.count({
      where: {
        productId: orderItem.productId,
        status: "ACTIVE",
        quantityRemaining: { gt: 0 },
      },
    });
    if (activeLots === 0) continue;
    const shares = await consumeStockLots(
      tx,
      orderItem.productId,
      orderItem.quantity,
    );
    await applyLotSharesToOrderItem(tx, orderItem.id, shares);
  }
}
