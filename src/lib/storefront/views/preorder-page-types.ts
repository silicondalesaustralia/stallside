import type { PublicProductCard } from "@/lib/public-product";

/** Everything a pre-order page shows; dates are ISO strings so the editor can preview it. */
export type PreOrderPageData = {
  id: string;
  standSlug: string;
  standName: string;
  timezone: string;
  currency: string;
  accentColor: string | null;
  page: {
    slug: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    collectionAt: string;
    orderByAt: string;
    collectionNote: string | null;
    handoverMode: string;
  };
  pageProducts: PublicProductCard[];
  catalogProducts: PublicProductCard[];
};
