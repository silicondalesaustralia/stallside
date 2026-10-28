import {
  formatCollectionLabel,
  formatOrderByLabel,
  type PaymentTimingValue,
  type PreOrderPaymentTiming,
} from "@/lib/pre-order";
import { payOptionsOf } from "@/lib/pre-order-pay-options";
import type { PublicOptionGroup } from "@/lib/product-options";
import { parsePriceTiers } from "@/lib/price-tiers";
import {
  mapPublicVariants,
  type PublicVariant,
} from "@/lib/product-variants/public-variant";
import { DEFAULT_TIMEZONE } from "@/lib/stand-timezone";

export type PreOrderDetailsData = {
  ordersCloseLabel: string | null;
  collectionLabel: string;
  note: string | null;
};

export type PublicProductCard = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number;
  stockQuantity: number;
  label: string;
  soldOut: boolean;
  isPreOrder: boolean;
  collectionAtMs: number | null;
  preOrderDetails: PreOrderDetailsData | null;
  optionGroups: PublicOptionGroup[];
  /** Variant option names, e.g. ["Size", "Colour"]. Empty when no variants. */
  variantOptionNames: string[];
  variants: PublicVariant[];
  hasOptions: boolean;
  freshnessNote: string | null;
  priceTiers: { qty: number; totalCents: number }[];
  handoverMode: "COLLECT" | "DELIVER";
  paymentTiming: PaymentTimingValue;
  /** Pre-orders: options the shopper can choose at checkout (first is the default). */
  paymentOptions: PreOrderPaymentTiming[];
  depositPercent: number | null;
  /** When this product is in the cart, offer this product as upsell. */
  upsellProductId: string | null;
  upsellPriceCents: number | null;
  preOrderUpsellName: string | null;
  preOrderUpsellPriceCents: number | null;
  preOrderUpsellDiscountKind: string | null;
  preOrderUpsellDiscountValue: number | null;
  preOrderUpsellProductId: string | null;
};

function stockLabel(
  showExact: boolean,
  quantity: number,
  threshold: number,
  preOrder: { collectionAt: Date } | null,
  showPublicScarcity: boolean,
  timeZone: string,
): string {
  if (quantity <= 0) {
    return preOrder
      ? `Sold out for ${formatCollectionLabel(preOrder.collectionAt, timeZone)}`
      : "Sold out";
  }
  if (preOrder && showExact) {
    return `${quantity} left for ${formatCollectionLabel(preOrder.collectionAt, timeZone)}`;
  }
  if (showExact) return `${quantity} left`;
  if (preOrder) {
    if (quantity <= threshold) {
      return showPublicScarcity
        ? `Only ${quantity} left for ${formatCollectionLabel(preOrder.collectionAt, timeZone)}`
        : `Low stock for ${formatCollectionLabel(preOrder.collectionAt, timeZone)}`;
    }
    return `Available for ${formatCollectionLabel(preOrder.collectionAt, timeZone)}`;
  }
  if (quantity <= threshold) {
    return showPublicScarcity ? `Only ${quantity} left` : "Low stock";
  }
  return "Available";
}

export function mapPublicProduct(
  p: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    priceCents: number;
    stockQuantity: number;
    lowStockThreshold: number;
    isPreOrder: boolean;
    orderByAt: Date | null;
    collectionAt: Date | null;
    collectionNote: string | null;
    showExactStock?: boolean;
    freshnessNote?: string | null;
    priceTiers?: unknown;
    paymentTiming?: PaymentTimingValue;
    paymentOptions?: readonly string[] | null;
    depositPercent?: number | null;
    handoverMode?: "COLLECT" | "DELIVER";
    upsellProductId?: string | null;
    upsellPriceCents?: number | null;
    preOrderUpsellName?: string | null;
    preOrderUpsellPriceCents?: number | null;
    preOrderUpsellDiscountKind?: string | null;
    preOrderUpsellDiscountValue?: number | null;
    preOrderUpsellProductId?: string | null;
    optionGroups?: {
      id: string;
      name: string;
      choices: { id: string; name: string; priceDeltaCents: number }[];
    }[];
    option1Name?: string | null;
    option2Name?: string | null;
    option3Name?: string | null;
    variants?: Parameters<typeof mapPublicVariants>[0]["variants"];
  },
  opts: {
    showExactStock: boolean;
    showPublicScarcity?: boolean;
    now?: number;
    timeZone?: string;
  },
): PublicProductCard {
  const now = opts.now ?? Date.now();
  const timeZone = opts.timeZone ?? DEFAULT_TIMEZONE;
  const isPre = Boolean(p.isPreOrder && p.collectionAt && p.orderByAt);
  const closed = isPre && p.orderByAt!.getTime() <= now;
  const soldOut = p.stockQuantity <= 0 || closed;
  const collectionLabel = isPre
    ? formatCollectionLabel(p.collectionAt!, timeZone)
    : null;
  const showExact = isPre
    ? Boolean(p.showExactStock)
    : opts.showExactStock;
  const showPublicScarcity = opts.showPublicScarcity !== false;
  let label = stockLabel(
    showExact,
    p.stockQuantity,
    p.lowStockThreshold,
    isPre ? { collectionAt: p.collectionAt! } : null,
    showPublicScarcity,
    timeZone,
  );
  if (closed && p.stockQuantity > 0) {
    label = `Orders closed (${formatOrderByLabel(p.orderByAt!, timeZone)})`;
  }
  const preOrderDetails: PreOrderDetailsData | null = isPre
    ? {
        ordersCloseLabel: closed
          ? null
          : formatOrderByLabel(p.orderByAt!, timeZone),
        collectionLabel: collectionLabel!,
        note: p.collectionNote,
      }
    : null;

  const optionGroups: PublicOptionGroup[] = (p.optionGroups ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    choices: g.choices.map((c) => ({
      id: c.id,
      name: c.name,
      priceDeltaCents: c.priceDeltaCents,
    })),
  }));

  const { optionNames: variantOptionNames, variants } = mapPublicVariants(p, closed);
  const priceTiers =
    optionGroups.length > 0 || variants.length > 0 ? [] : parsePriceTiers(p.priceTiers);

  const paymentOptions = isPre
    ? payOptionsOf({ paymentTiming: p.paymentTiming ?? "PAY_UPFRONT", paymentOptions: p.paymentOptions })
    : [];
  const paymentTiming: PaymentTimingValue = paymentOptions[0] ?? "PAY_NOW";

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    priceCents: p.priceCents,
    stockQuantity: closed ? 0 : p.stockQuantity,
    label,
    soldOut,
    isPreOrder: Boolean(isPre),
    collectionAtMs: isPre ? p.collectionAt!.getTime() : null,
    preOrderDetails,
    optionGroups,
    variantOptionNames,
    variants,
    hasOptions: optionGroups.length > 0 || variants.length > 0,
    freshnessNote: p.freshnessNote?.trim() || null,
    priceTiers,
    handoverMode: p.handoverMode === "DELIVER" ? "DELIVER" : "COLLECT",
    paymentTiming,
    paymentOptions,
    depositPercent: paymentOptions.includes("DEPOSIT_THEN_BALANCE")
      ? (p.depositPercent ?? 30)
      : null,
    upsellProductId: p.upsellProductId ?? null,
    upsellPriceCents: p.upsellPriceCents ?? null,
    preOrderUpsellName: p.preOrderUpsellName ?? null,
    preOrderUpsellPriceCents: p.preOrderUpsellPriceCents ?? null,
    preOrderUpsellDiscountKind: p.preOrderUpsellDiscountKind ?? null,
    preOrderUpsellDiscountValue: p.preOrderUpsellDiscountValue ?? null,
    preOrderUpsellProductId: p.preOrderUpsellProductId ?? null,
  };
}

export function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(cents / 100);
}
