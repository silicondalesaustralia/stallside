import { toCsv } from "@/lib/order-export/csv";
import type { DataContext } from "./context";
import { CATEGORY_HEADERS, CATEGORY_TEMPLATE_ROW, exportCategories } from "./sections/categories-export";
import { CUSTOMER_HEADERS, CUSTOMER_TEMPLATE_ROW, exportCustomers } from "./sections/customers-export";
import { exportOrderItems, exportOrders } from "./sections/orders-export";
import { exportPreOrderPages, PREORDER_HEADERS, PREORDER_TEMPLATE_ROW } from "./sections/preorders-export";
import { exportProducts, PRODUCT_HEADERS, PRODUCT_TEMPLATE_ROW } from "./sections/products-export";
import { exportSubscriptions, SUBSCRIPTION_HEADERS, SUBSCRIPTION_TEMPLATE_ROW } from "./sections/subscriptions-export";

export const SECTION_IDS = [
  "categories",
  "products",
  "preorders",
  "subscriptions",
  "customers",
  "orders",
  "order-items",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export type DataSection = {
  fileName: string;
  exportCsv: (ctx: DataContext) => Promise<string>;
  templateCsv?: () => string;
};

function withTemplate(
  fileName: string,
  exportCsv: (ctx: DataContext) => Promise<string>,
  headers: readonly string[],
  templateRow: readonly (string | number)[],
): DataSection {
  return { fileName, exportCsv, templateCsv: () => toCsv(headers, [[...templateRow]]) };
}

export const DATA_SECTIONS: Record<SectionId, DataSection> = {
  categories: withTemplate("categories.csv", exportCategories, CATEGORY_HEADERS, CATEGORY_TEMPLATE_ROW),
  products: withTemplate("products.csv", exportProducts, PRODUCT_HEADERS, PRODUCT_TEMPLATE_ROW),
  preorders: withTemplate("pre-order-pages.csv", exportPreOrderPages, PREORDER_HEADERS, PREORDER_TEMPLATE_ROW),
  subscriptions: withTemplate("subscriptions.csv", exportSubscriptions, SUBSCRIPTION_HEADERS, SUBSCRIPTION_TEMPLATE_ROW),
  customers: withTemplate("customers.csv", exportCustomers, CUSTOMER_HEADERS, CUSTOMER_TEMPLATE_ROW),
  orders: { fileName: "orders.csv", exportCsv: exportOrders },
  "order-items": { fileName: "order-items.csv", exportCsv: exportOrderItems },
};

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}
