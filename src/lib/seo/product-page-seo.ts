import type { StorefrontContext } from "@/lib/catalogue/storefront";
import type { PublicProductCard } from "@/lib/public-product";
import { loadProductRatings } from "@/lib/studio/load-product-ratings";
import { parseBusinessProfile } from "./business-profile";
import { countryFor } from "./graph/clean";
import type { PageSeo } from "./graph/page-graph";
import { productNode, type ProductShipping } from "./graph/product";

type Ctx = NonNullable<StorefrontContext>;

/** What one shipped item costs; null when the product is pickup-only or a pre-order. */
export function productShipping(stand: Ctx["stand"], product: PublicProductCard, country: string): ProductShipping | null {
  if (product.fulfilment === "PICKUP" || product.isPreOrder) return null;
  const freeOver = stand.shippingFreeOverCents;
  const qualifiesFree = freeOver != null && product.priceCents >= freeOver;
  const rateCents =
    stand.shippingMode === "FREE" || qualifiesFree
      ? 0
      : stand.shippingMode === "FLAT"
        ? stand.shippingFlatCents
        : (product.shippingCents ?? 0);
  return { rateCents, country };
}

export async function productPageSeo(
  ctx: Ctx,
  product: PublicProductCard,
  path: string,
  identifiers?: { sku?: string | null; barcode?: string | null },
): Promise<PageSeo> {
  const profile = parseBusinessProfile(ctx.storefront.businessProfile);
  const country = profile.address?.country ?? countryFor(ctx.stand.currency);
  const ratings = await loadProductRatings(ctx.owner.id, [product.id]);
  return {
    path,
    type: "ItemPage",
    name: product.name,
    imageUrl: product.imageUrl,
    breadcrumb: [
      { label: ctx.branding.headline, path: "/" },
      { label: "Shop", path: "/shop" },
      { label: product.name },
    ],
    nodes: [
      ({ facts, pageUrl }) => productNode({
        product,
        pageUrl,
        homeUrl: facts.homeUrl,
        brandName: facts.name,
        currency: ctx.stand.currency,
        identifiers,
        rating: ratings.get(product.id) ?? null,
        shipping: productShipping(ctx.stand, product, country),
        returnPolicy: profile.returnPolicy,
      }),
    ],
  };
}
