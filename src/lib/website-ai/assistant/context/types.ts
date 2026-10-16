import type { BusinessMode } from "@/lib/business-mode";
import type { StudioTemplateId } from "@/lib/studio/types";
import type { FulfilmentChoiceValue } from "@/lib/fulfilment/handover-choice";
import type { SearchProfileFacts } from "./search-profile";

export type NamedEntity = { id: string; title: string; slug: string };

/** Real, owner-scoped facts the assistant may use. Never contains secrets or customer records. */
export type AssistantContext = {
  ownerId: string;
  storefrontId: string;
  storefrontSlug: string;
  businessMode: BusinessMode;
  businessName: string;
  existing: {
    headline: string;
    subheadline: string | null;
    about: string | null;
    regionLabel: string | null;
    logoUrl: string | null;
    heroImageUrl: string | null;
    accentColor: string | null;
    secondaryColor: string | null;
    fontPairId: string | null;
    templateId: StudioTemplateId | null;
    hasLayout: boolean;
    isPublished: boolean;
  };
  catalogue: {
    productCount: number;
    products: { id: string; title: string; slug: string; imageUrl: string | null; categorySlug: string | null }[];
    categories: NamedEntity[];
    productPhotoCount: number;
    /** Distinct freshness notes sellers wrote on products, most used first. */
    freshnessNotes: string[];
    /** How products are handed over, across the catalogue. */
    fulfilments: FulfilmentChoiceValue[];
  };
  features: {
    menus: NamedEntity[];
    preOrders: NamedEntity[];
    subscriptions: NamedEntity[];
    pickup: boolean;
    delivery: boolean;
    pickupLabels: string[];
    deliveryLabels: string[];
    paymentBrands: string[];
    cardPayments: boolean;
  };
  reviews: { count: number; samples: { rating: number; body: string }[] };
  stand: { name: string; locality: string | null };
  /** From Details & publish → Google & search profile. Never written by the assistant. */
  searchProfile: SearchProfileFacts;
};
