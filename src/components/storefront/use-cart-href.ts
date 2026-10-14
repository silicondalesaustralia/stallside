"use client";

import { useStorefrontLinkBase } from "./StorefrontLinkProvider";
import { shopAllProductsPath, shopCartPath } from "@/lib/storefront/cart-paths";
import { standCartPath, standCatalogPath } from "@/lib/stand-seo";

/** Cart link: the website's `/cart` inside a storefront, else the stand cart. */
export function useCartHref(standSlug: string): string {
  const { slug, basePath, draft } = useStorefrontLinkBase();
  return slug ? shopCartPath(slug, draft, basePath) : standCartPath(standSlug);
}

/** Continue-shopping link: the website's products page inside a storefront, else the stand. */
export function useShopHref(standSlug: string): string {
  const { slug, basePath, draft } = useStorefrontLinkBase();
  return slug ? shopAllProductsPath(slug, draft, basePath) : standCatalogPath(standSlug);
}

/** Where in-browser PayPal approval lands: the website's thank-you page inside a storefront. */
export function useCheckoutSuccessPath(): string {
  const { slug, basePath } = useStorefrontLinkBase();
  return slug ? `${basePath}/checkout/success` : "/checkout/success";
}
