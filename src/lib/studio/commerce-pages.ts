import type { PublicProductCard } from "@/lib/public-product";
import type { StandCartCheckoutProps } from "@/lib/storefront/stand-cart-props";
import type { SuccessPageState } from "@/app/checkout/success/success-state";

export const COMMERCE_SHOP_KEY = "commerce-shop";
export const COMMERCE_CATEGORY_KEY = "commerce-category";
export const COMMERCE_PRODUCT_KEY = "commerce-product";
export const COMMERCE_MENU_KEY = "commerce-menu";
export const COMMERCE_CART_KEY = "commerce-cart";
export const COMMERCE_SUCCESS_KEY = "commerce-success";

export type CommercePageKind = "shop" | "category" | "product" | "menu" | "cart" | "success";

export const COMMERCE_PAGE_KEYS = [
  COMMERCE_SHOP_KEY,
  COMMERCE_CATEGORY_KEY,
  COMMERCE_PRODUCT_KEY,
  COMMERCE_MENU_KEY,
  COMMERCE_CART_KEY,
  COMMERCE_SUCCESS_KEY,
] as const;

export type CommercePageKey = (typeof COMMERCE_PAGE_KEYS)[number];

export const COMMERCE_PAGES: {
  kind: CommercePageKind;
  key: CommercePageKey;
  label: string;
  description: string;
}[] = [
  {
    kind: "shop",
    key: COMMERCE_SHOP_KEY,
    label: "Shop",
    description: "Product catalogue layout when browsing all products",
  },
  {
    kind: "category",
    key: COMMERCE_CATEGORY_KEY,
    label: "Category",
    description: "Layout when a shop category filter is active",
  },
  {
    kind: "product",
    key: COMMERCE_PRODUCT_KEY,
    label: "Product",
    description: "Shared layout for every product detail page",
  },
  {
    kind: "menu",
    key: COMMERCE_MENU_KEY,
    label: "Menu",
    description: "Shared layout for menu and drop order pages",
  },
  {
    kind: "cart",
    key: COMMERCE_CART_KEY,
    label: "Cart & checkout",
    description: "Cart, pickup / delivery details and payment choice, before the payment screen",
  },
  {
    kind: "success",
    key: COMMERCE_SUCCESS_KEY,
    label: "Order confirmation",
    description: "Thank-you page after a card or PayPal payment",
  },
];

export function commerceKeyForKind(kind: CommercePageKind): CommercePageKey {
  const hit = COMMERCE_PAGES.find((p) => p.kind === kind);
  if (!hit) throw new Error(`Unknown commerce kind: ${kind}`);
  return hit.key;
}

export function commerceKindFromParam(param: string): CommercePageKind | null {
  return COMMERCE_PAGES.find((p) => p.kind === param)?.kind ?? null;
}

export function isCommercePageKey(key: string): key is CommercePageKey {
  return (COMMERCE_PAGE_KEYS as readonly string[]).includes(key);
}

export type StudioCommerceCategory = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
};

export type StudioCommerceMenu = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  scheduleLabel?: string | null;
  isPreOrderDrop: boolean;
  products: PublicProductCard[];
};

export type StudioCommerceContext = {
  kind: CommercePageKind;
  product?: PublicProductCard;
  /** Full catalogue for product page actions / upsells */
  catalogProducts?: PublicProductCard[];
  category?: StudioCommerceCategory;
  menu?: StudioCommerceMenu;
  /** Live cart & checkout data (cart page only). */
  cart?: StandCartCheckoutProps;
  /** Payment result (order confirmation page only). */
  success?: SuccessPageState;
  ownerId?: string;
};
