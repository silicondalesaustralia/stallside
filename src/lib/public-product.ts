import {
  formatCollectionLabel,
  formatOrderByLabel,
} from "@/lib/pre-order";
import type { PublicOptionGroup } from "@/lib/product-options";
import { parsePriceTiers } from "@/lib/price-tiers";

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
  hasOptions: boolean;
  freshnessNote: string | null;
  priceTiers: { qty: number; totalCents: number }[];
};

function stockLabel(
  showExact: boolean,
  quantity: number,
  threshold: number,
  preOrder: { collectionAt: Date } | null,
  showPublicScarcity: boolean,
): string {
  if (quantity <= 0) {
    return preOrder
      ? `Sold out for ${formatCollectionLabel(preOrder.collectionAt)}`
      : "Sold out";
  }
  if (preOrder && showExact) {
    return `${quantity} left for ${formatCollectionLabel(preOrder.collectionAt)}`;
  }
  if (showExact) return `${quantity} left`;
  if (preOrder) {
    if (quantity <= threshold) {
      return showPublicScarcity
        ? `Only ${quantity} left for ${formatCollectionLabel(preOrder.collectionAt)}`
        : `Low stock for ${formatCollectionLabel(preOrder.collectionAt)}`;
    }
    return `Available for ${formatCollectionLabel(preOrder.collectionAt)}`;
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
    optionGroups?: {
      id: string;
      name: string;
      choices: { id: string; name: string; priceDeltaCents: number }[];
    }[];
  },
  opts: {
    showExactStock: boolean;
    showPublicScarcity?: boolean;
    now?: number;
  },
): PublicProductCard {
  const now = opts.now ?? Date.now();
  const isPre = Boolean(p.isPreOrder && p.collectionAt && p.orderByAt);
  const closed = isPre && p.orderByAt!.getTime() <= now;
  const soldOut = p.stockQuantity <= 0 || closed;
  const collectionLabel = isPre
    ? formatCollectionLabel(p.collectionAt!)
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
  );
  if (closed && p.stockQuantity > 0) {
    label = `Orders closed (${formatOrderByLabel(p.orderByAt!)})`;
  }
  const preOrderDetails: PreOrderDetailsData | null = isPre
    ? {
        ordersCloseLabel: closed
          ? null
          : formatOrderByLabel(p.orderByAt!),
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

  const priceTiers =
    optionGroups.length > 0 ? [] : parsePriceTiers(p.priceTiers);

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
    hasOptions: optionGroups.length > 0,
    freshnessNote: p.freshnessNote?.trim() || null,
    priceTiers,
  };
}

export function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(cents / 100);
}
