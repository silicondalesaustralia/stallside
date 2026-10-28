import type { ImportEntity } from "../fields";
import type { ImportPreset } from "../types";
import { shopifyCustomers, shopifyInventory, shopifyProducts } from "./shopify";
import { squareCustomers, squareItems } from "./square";
import { squarespaceCustomers, squarespaceProducts } from "./squarespace";
import { wixCustomers, wixProducts } from "./wix";
import { wixProductsV3 } from "./wix-v3";
import { wooCustomers, wooProducts } from "./woocommerce";

/** Most specific first: detection takes the first full fingerprint match. */
export const IMPORT_PRESETS: ImportPreset[] = [
  shopifyInventory,
  shopifyProducts,
  wooProducts,
  squarespaceProducts,
  wixProductsV3,
  wixProducts,
  squareItems,
  squareCustomers,
  wooCustomers,
  squarespaceCustomers,
  wixCustomers,
  shopifyCustomers,
];

export const PLATFORMS = ["Shopify", "WooCommerce", "Squarespace", "Wix", "Square"] as const;

export function presetsFor(platform: string, entity: ImportEntity): ImportPreset[] {
  return IMPORT_PRESETS.filter((p) => p.platform === platform && p.entity === entity);
}
