import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";

export type IoniconName = ComponentProps<typeof Ionicons>["name"];

/** Menu icon per feature id; sections added on the web later get the fallback. */
const FEATURE_ICONS: Record<string, IoniconName> = {
  overview: "home-outline",
  notifications: "notifications-outline",
  knowledge: "book-outline",
  categories: "grid-outline",
  products: "pricetags-outline",
  "pre-order-pages": "calendar-number-outline",
  subscriptions: "repeat-outline",
  upsells: "gift-outline",
  discounts: "pricetag-outline",
  communication: "mail-outline",
  reviews: "star-outline",
  social: "share-social-outline",
  orders: "receipt-outline",
  shipping: "car-outline",
  inventory: "cube-outline",
  customers: "people-outline",
  suppliers: "storefront-outline",
  collections: "basket-outline",
  calendar: "calendar-outline",
  qr: "qr-code-outline",
  payments: "card-outline",
  settings: "person-circle-outline",
};

export function featureIcon(id: string): IoniconName {
  return FEATURE_ICONS[id] ?? "apps-outline";
}
