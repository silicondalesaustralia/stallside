import type { Data } from "@puckeditor/core";
import type {
  ResolvedStorefrontBranding,
  StorefrontPageId,
} from "@/lib/storefront/types";

export const PUCK_SPIKE_VERSION = 1 as const;

export type PuckSpikePayload = {
  version: typeof PUCK_SPIKE_VERSION;
  engine: "puck";
  home: Data;
};

export type PuckSpikeMetadata = {
  branding: {
    headline: string;
    subheadline: string | null;
    about: string | null;
    heroImageUrl: string | null;
    regionLabel: string | null;
    businessName: string;
  };
  products: Array<{
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    imageUrl: string | null;
    soldOut: boolean;
    label: string;
    categoryIds: string[];
  }>;
  menus: Array<{
    slug: string;
    title: string;
    description: string | null;
    orderByLabel: string | null;
    collectionLabel: string | null;
  }>;
  storefrontSlug: string;
  standSlug: string;
  categories: Array<{
    id: string;
    slug: string;
    title: string;
    imageUrl?: string | null;
  }>;
  businessMode: "FOOD_BUSINESS" | "FARM_STAND" | "BOTH";
  currency: string;
  draft?: boolean;
  basePath: string;
  resolvedBranding: ResolvedStorefrontBranding;
  enabledPages: StorefrontPageId[];
};
