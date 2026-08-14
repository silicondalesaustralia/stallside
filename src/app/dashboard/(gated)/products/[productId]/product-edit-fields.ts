import type { PriceTier } from "@/lib/price-tiers";

export type ProductFields = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  priceCents: number;
  costCents: number | null;
  sku: string | null;
  upc: string | null;
  currency: string;
  lowStockThreshold: number;
  standId: string;
  standName: string;
  standSlug: string;
  publicUrl: string;
  cardTier: boolean;
  preOrderEligible: boolean;
  freshnessNote: string | null;
  priceTiers: PriceTier[];
  hasOptions: boolean;
  upsellProductId: string | null;
  upsellPriceCents: number | null;
  siblingProducts: { id: string; name: string; priceCents: number }[];
};
