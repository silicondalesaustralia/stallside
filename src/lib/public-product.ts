import {
  formatCollectionLabel,
  formatOrderByLabel,
} from "@/lib/pre-order";
import type { PublicOptionGroup } from "@/lib/product-options";
import { parsePriceTiers } from "@/lib/price-tiers";
import { DEFAULT_TIMEZONE } from "@/lib/stand-timezone";
import { productImageList } from "@/lib/product-images";
import { imageAltList, parseImageAlts } from "@/lib/product-image-alts";
import { effectiveFulfilment, type FulfilmentChoiceValue } from "@/lib/fulfilment/handover-choice";
import { isOnSale } from "@/lib/product-sale-price";

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
  /** Every photo, main first. Empty when the product has none. */
  images: string[];
  /** Seller's alt text per photo, same order as `images`; blank uses the product name. */
  imageAlts: string[];
  priceCents: number;
  /** Struck-through "was" price; set only while the product is on sale. */
  compareAtPriceCents?: number | null;
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
  handoverMode: "COLLECT" | "DELIVER";
  /** Pickup / delivery this product allows at checkout (own setting, else the stand default). */
  fulfilment: FulfilmentChoiceValue;
  /** Per-item shipping when the stand uses custom shipping. */
  shippingCents: number | null;
  paymentTiming: "PAY_NOW" | "PAY_UPFRONT" | "DEPOSIT_THEN_BALANCE";
  depositPercent: number | null;
  /** When this product is in the cart, offer this product as upsell. */
  upsellProductId: string | null;
  upsellPriceCents: number | null;
  preOrderUpsellName: string | null;
  preOrderUpsellPriceCents: number | null;
  preOrderUpsellDiscountKind: string | null;
  preOrderUpsellDiscountValue: number | null;
  preOrderUpsellProductId: string | null;
  /** Main category slug; product URL is `/{categorySlug}/{slug}`, else `/products/{slug}`. */
  categorySlug?: string | null;
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
    galleryImageUrls?: string[] | null;
    imageAlts?: unknown;
    priceCents: number;
    compareAtPriceCents?: number | null;
    stockQuantity: number;
    lowStockThreshold: number;
    isPreOrder: boolean;
    orderByAt: Date | null;
    collectionAt: Date | null;
    collectionNote: string | null;
    showExactStock?: boolean;
    freshnessNote?: string | null;
    priceTiers?: unknown;
    paymentTiming?: "PAY_NOW" | "PAY_UPFRONT" | "DEPOSIT_THEN_BALANCE";
    depositPercent?: number | null;
    handoverMode?: "COLLECT" | "DELIVER";
    fulfilment?: FulfilmentChoiceValue | null;
    shippingCents?: number | null;
    upsellProductId?: string | null;
    upsellPriceCents?: number | null;
    preOrderUpsellName?: string | null;
    preOrderUpsellPriceCents?: number | null;
    preOrderUpsellDiscountKind?: string | null;
    preOrderUpsellDiscountValue?: number | null;
    preOrderUpsellProductId?: string | null;
    mainCategorySlug?: string | null;
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
    timeZone?: string;
    /** The stand's site-wide pickup / delivery setting. */
    fulfilmentDefault?: FulfilmentChoiceValue;
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

  const priceTiers =
    optionGroups.length > 0 ? [] : parsePriceTiers(p.priceTiers);

  const paymentTiming = isPre
    ? p.paymentTiming === "DEPOSIT_THEN_BALANCE"
      ? "DEPOSIT_THEN_BALANCE"
      : "PAY_UPFRONT"
    : "PAY_NOW";

  const images = productImageList(p.imageUrl, p.galleryImageUrls);

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    images,
    imageAlts: imageAltList(images, parseImageAlts(p.imageAlts)),
    priceCents: p.priceCents,
    compareAtPriceCents: isOnSale(p.priceCents, p.compareAtPriceCents) ? p.compareAtPriceCents : null,
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
    handoverMode: p.handoverMode === "DELIVER" ? "DELIVER" : "COLLECT",
    fulfilment: effectiveFulfilment(
      { isPreOrder: Boolean(isPre), handoverMode: p.handoverMode ?? "COLLECT", fulfilment: p.fulfilment ?? null },
      opts.fulfilmentDefault ?? "PICKUP",
    ),
    shippingCents: p.shippingCents ?? null,
    paymentTiming,
    depositPercent:
      paymentTiming === "DEPOSIT_THEN_BALANCE"
        ? (p.depositPercent ?? 30)
        : null,
    upsellProductId: p.upsellProductId ?? null,
    upsellPriceCents: p.upsellPriceCents ?? null,
    preOrderUpsellName: p.preOrderUpsellName ?? null,
    preOrderUpsellPriceCents: p.preOrderUpsellPriceCents ?? null,
    preOrderUpsellDiscountKind: p.preOrderUpsellDiscountKind ?? null,
    preOrderUpsellDiscountValue: p.preOrderUpsellDiscountValue ?? null,
    preOrderUpsellProductId: p.preOrderUpsellProductId ?? null,
    categorySlug: p.mainCategorySlug ?? null,
  };
}

export function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(cents / 100);
}
