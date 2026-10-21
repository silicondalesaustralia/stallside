import { toCsv } from "@/lib/order-export/csv";
import type { CsvRow } from "./parse-csv";
import type { DataContext, Importer, RowError } from "./context";
import { CATEGORY_HEADERS, CATEGORY_TEMPLATE_ROW, exportCategories } from "./sections/categories-export";
import { categoriesImporter } from "./sections/categories-import";
import { CUSTOMER_HEADERS, CUSTOMER_TEMPLATE_ROW, exportCustomers } from "./sections/customers-export";
import { customersImporter } from "./sections/customers-import";
import { exportOrderItems, exportOrders } from "./sections/orders-export";
import { exportPreOrderPages, PREORDER_HEADERS, PREORDER_TEMPLATE_ROW } from "./sections/preorders-export";
import { preOrdersImporter } from "./sections/preorders-import";
import { exportProducts, PRODUCT_HEADERS, PRODUCT_TEMPLATE_ROW } from "./sections/products-export";
import { productsImporter } from "./sections/products-import";
import { exportSubscriptions, SUBSCRIPTION_HEADERS, SUBSCRIPTION_TEMPLATE_ROW } from "./sections/subscriptions-export";
import { subscriptionsImporter } from "./sections/subscriptions-import";

/** Order matters: an "everything" import runs sections top to bottom so links resolve. */
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

export type ImportPreview = {
  creates: string[];
  updates: string[];
  errors: RowError[];
};
export type ImportOutcome = { created: number; updated: number; warnings: string[] };

export type DataSection = {
  fileName: string;
  exportCsv: (ctx: DataContext) => Promise<string>;
  templateCsv?: () => string;
  preview?: (rows: CsvRow[], ctx: DataContext) => Promise<ImportPreview>;
  /** Re-plans the rows and writes them; throws when the file still has errors. */
  apply?: (rows: CsvRow[], ctx: DataContext) => Promise<ImportOutcome>;
};

function importable<T>(
  fileName: string,
  exportCsv: (ctx: DataContext) => Promise<string>,
  headers: readonly string[],
  templateRow: (string | number)[],
  importer: Importer<T>,
): DataSection {
  return {
    fileName,
    exportCsv,
    templateCsv: () => toCsv(headers, [templateRow]),
    async preview(rows, ctx) {
      const plan = await importer.plan(rows, ctx);
      return {
        creates: plan.rows.filter((r) => !r.existingId).map((r) => r.label),
        updates: plan.rows.filter((r) => r.existingId).map((r) => r.label),
        errors: plan.errors,
      };
    },
    async apply(rows, ctx) {
      const plan = await importer.plan(rows, ctx);
      if (plan.errors.length) throw new Error(`${fileName} has ${plan.errors.length} problem(s); fix them and try again`);
      return importer.apply(plan, ctx);
    },
  };
}

export const DATA_SECTIONS: Record<SectionId, DataSection> = {
  categories: importable("categories.csv", exportCategories, CATEGORY_HEADERS, CATEGORY_TEMPLATE_ROW, categoriesImporter),
  products: importable("products.csv", exportProducts, PRODUCT_HEADERS, PRODUCT_TEMPLATE_ROW, productsImporter),
  preorders: importable("pre-order-pages.csv", exportPreOrderPages, PREORDER_HEADERS, PREORDER_TEMPLATE_ROW, preOrdersImporter),
  subscriptions: importable(
    "subscriptions.csv",
    exportSubscriptions,
    SUBSCRIPTION_HEADERS,
    SUBSCRIPTION_TEMPLATE_ROW,
    subscriptionsImporter,
  ),
  customers: importable("customers.csv", exportCustomers, CUSTOMER_HEADERS, CUSTOMER_TEMPLATE_ROW, customersImporter),
  orders: { fileName: "orders.csv", exportCsv: exportOrders },
  "order-items": { fileName: "order-items.csv", exportCsv: exportOrderItems },
};

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

export function sectionForFileName(name: string): SectionId | null {
  const base = name.split("/").pop()?.toLowerCase() ?? "";
  return SECTION_IDS.find((id) => DATA_SECTIONS[id].fileName === base) ?? null;
}
