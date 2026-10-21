import type { PublicProductCard } from "@/lib/public-product";
import type { StandCartCheckoutProps } from "@/lib/storefront/stand-cart-props";
import type { SuccessPageState } from "@/app/checkout/success/success-state";
import type { PreOrderPageData } from "@/lib/storefront/views/preorder-page-types";
import type { SubscriptionOfferData } from "@/lib/storefront/views/subscription-offer-types";
import type { PreOrderListData, SubscriptionListData } from "@/lib/storefront/views/offer-list-types";

export const COMMERCE_SHOP_KEY = "commerce-shop";
export const COMMERCE_CATEGORY_KEY = "commerce-category";
export const COMMERCE_PRODUCT_KEY = "commerce-product";
export const COMMERCE_MENU_KEY = "commerce-menu";
export const COMMERCE_CART_KEY = "commerce-cart";
export const COMMERCE_SUCCESS_KEY = "commerce-success";
export const COMMERCE_PREORDER_KEY = "commerce-preorder";
export const COMMERCE_SUBSCRIPTION_KEY = "commerce-subscription";
export const COMMERCE_PREORDERS_KEY = "commerce-preorders";
export const COMMERCE_SUBSCRIPTIONS_KEY = "commerce-subscriptions";

export type CommercePageKind =
  | "shop"
  | "category"
  | "product"
  | "menu"
  | "preorders"
  | "preorder"
  | "subscriptions"
  | "subscription"
  | "cart"
  | "success";

export const COMMERCE_PAGE_KEYS = [
  COMMERCE_SHOP_KEY,
  COMMERCE_CATEGORY_KEY,
  COMMERCE_PRODUCT_KEY,
  COMMERCE_MENU_KEY,
  COMMERCE_PREORDERS_KEY,
  COMMERCE_PREORDER_KEY,
  COMMERCE_SUBSCRIPTIONS_KEY,
  COMMERCE_SUBSCRIPTION_KEY,
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
    kind: "preorders",
    key: COMMERCE_PREORDERS_KEY,
    label: "Pre-orders category",
    description: "The list of every open pre-order page (/pre-orders)",
  },
  {
    kind: "preorder",
    key: COMMERCE_PREORDER_KEY,
    label: "Pre-order page",
    description: "Shared layout for every pre-order page",
  },
  {
    kind: "subscriptions",
    key: COMMERCE_SUBSCRIPTIONS_KEY,
    label: "Subscriptions & memberships category",
    description: "The list of every subscription and membership (/subscriptions)",
  },
  {
    kind: "subscription",
    key: COMMERCE_SUBSCRIPTION_KEY,
    label: "Subscription & membership",
    description: "Shared layout for every subscription and membership page",
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
  bottomDescription?: string | null;
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
  /** The pre-order page being shown (pre-order page layout only). */
  preOrder?: PreOrderPageData;
  /** The subscription or membership offer being shown (subscription layout only). */
  subscription?: SubscriptionOfferData;
  /** Open pre-order pages (pre-orders category only). */
  preOrderList?: PreOrderListData;
  /** Live offers (subscriptions category only). */
  subscriptionList?: SubscriptionListData;
  /** Shopper came back from a cancelled checkout. */
  cancelled?: boolean;
  ownerId?: string;
};
