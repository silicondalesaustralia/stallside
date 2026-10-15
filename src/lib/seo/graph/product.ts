import type { PublicProductCard } from "@/lib/public-product";
import { richTextToPlainOrNull } from "@/lib/website/rich-text/plain";
import type { BusinessProfile } from "../business-profile";
import { graphIds, money, type JsonLdNode } from "./clean";

export type ProductShipping = {
  /** Shipping cost for one of this product; null when it can't be shipped. */
  rateCents: number | null;
  country: string;
};

export type ProductNodeInput = {
  product: PublicProductCard;
  pageUrl: string;
  homeUrl: string;
  brandName: string;
  currency: string;
  categoryName?: string | null;
  rating?: { average: number; count: number } | null;
  shipping?: ProductShipping | null;
  returnPolicy?: BusinessProfile["returnPolicy"];
  /** The seller's SKU and barcode (UPC / EAN) from the product editor. */
  identifiers?: { sku?: string | null; barcode?: string | null };
};

const GTIN_KEYS: Record<number, string> = { 8: "gtin8", 12: "gtin12", 13: "gtin13", 14: "gtin14" };

/** A barcode as the matching gtin8/12/13/14 property; anything that isn't a valid GTIN is left out. */
export function gtinProperty(barcode: string | null | undefined): Record<string, string> {
  const digits = barcode?.replace(/[\s-]/g, "") ?? "";
  const key = GTIN_KEYS[digits.length];
  if (!key || !/^\d+$/.test(digits) || !validCheckDigit(digits)) return {};
  return { [key]: digits };
}

function validCheckDigit(digits: string): boolean {
  const body = digits.slice(0, -1);
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    const n = Number(body[body.length - 1 - i]);
    sum += i % 2 === 0 ? n * 3 : n;
  }
  return (10 - (sum % 10)) % 10 === Number(digits[digits.length - 1]);
}

function availability(p: PublicProductCard): string {
  if (p.soldOut) return "https://schema.org/OutOfStock";
  if (p.isPreOrder) return "https://schema.org/PreOrder";
  if (p.stockQuantity > 0 && p.stockQuantity <= 5) return "https://schema.org/LimitedAvailability";
  return "https://schema.org/InStock";
}

function shippingDetails(s: ProductShipping, currency: string): JsonLdNode | undefined {
  if (s.rateCents === null) return undefined;
  return {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: money(s.rateCents), currency },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: s.country },
  };
}

function returnPolicyNode(policy: ProductNodeInput["returnPolicy"], country: string): JsonLdNode | undefined {
  if (!policy) return undefined;
  if (!policy.accepted) {
    return {
      "@type": "MerchantReturnPolicy",
      applicableCountry: country,
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    };
  }
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: country,
    returnPolicyCategory: policy.days
      ? "https://schema.org/MerchantReturnFiniteReturnWindow"
      : "https://schema.org/MerchantReturnUnlimitedWindow",
    merchantReturnDays: policy.days,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: policy.freeReturns ? "https://schema.org/FreeReturn" : undefined,
  };
}

/** Product with a full Offer: sale "was" price, availability, shipping, returns and review stars. */
export function productNode(input: ProductNodeInput): JsonLdNode {
  const { product: p, currency } = input;
  const business = graphIds(input.homeUrl, input.pageUrl).business;
  const onSale = p.compareAtPriceCents != null && p.compareAtPriceCents > p.priceCents;
  const country = input.shipping?.country ?? "AU";
  return {
    "@type": "Product",
    "@id": `${input.pageUrl}#product`,
    name: p.name,
    description: richTextToPlainOrNull(p.description) ?? undefined,
    image: p.images.length ? p.images : (p.imageUrl ?? undefined),
    url: input.pageUrl,
    sku: input.identifiers?.sku?.trim() || p.id,
    ...gtinProperty(input.identifiers?.barcode),
    category: input.categoryName ?? undefined,
    brand: { "@type": "Brand", name: input.brandName },
    aggregateRating:
      input.rating && input.rating.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: input.rating.average.toFixed(1),
            reviewCount: input.rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: input.pageUrl,
      priceCurrency: currency,
      price: money(p.priceCents),
      priceSpecification: onSale
        ? {
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/StrikethroughPrice",
            price: money(p.compareAtPriceCents as number),
            priceCurrency: currency,
          }
        : undefined,
      availability: availability(p),
      availabilityStarts:
        p.isPreOrder && p.collectionAtMs ? new Date(p.collectionAtMs).toISOString() : undefined,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": business },
      shippingDetails: input.shipping ? shippingDetails(input.shipping, currency) : undefined,
      hasMerchantReturnPolicy: returnPolicyNode(input.returnPolicy, country),
    },
  };
}
