import type { ProductSupplyStatus } from "@/generated/prisma/client";
import type { PriceTier } from "@/lib/price-tiers";
import type { FulfilmentChoiceValue } from "@/lib/fulfilment/handover-choice";
import type { ShippingModeValue } from "@/lib/shipping/shipping-cost";
import type { SavedOptionGroup } from "./ProductOptionsEditor";
import type { CategoryChoice } from "./ProductOrganisationSection";

export type ProductFields = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  photos: string[];
  /** Alt text by photo URL. */
  photoAlts: Record<string, string>;
  seoTitle: string | null;
  seoDescription: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  costCents: number | null;
  sku: string | null;
  upc: string | null;
  currency: string;
  stockQuantity: number;
  lowStockThreshold: number;
  supplyStatus: ProductSupplyStatus | null;
  isHidden: boolean;
  isArchived: boolean;
  standId: string;
  standName: string;
  standSlug: string;
  publicUrl: string;
  cardTier: boolean;
  preOrderEligible: boolean;
  freshnessNote: string | null;
  /** Null = the business's site-wide setting. */
  fulfilment: FulfilmentChoiceValue | null;
  standFulfilmentDefault: FulfilmentChoiceValue;
  shippingCents: number | null;
  standShippingMode: ShippingModeValue;
  priceTiers: PriceTier[];
  hasOptions: boolean;
  options: SavedOptionGroup[];
  categories: CategoryChoice[];
  primaryCategoryId: string | null;
  upsellProductId: string | null;
  upsellPriceCents: number | null;
  siblingProducts: { id: string; name: string; priceCents: number }[];
};
