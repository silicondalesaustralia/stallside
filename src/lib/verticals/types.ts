export type StarterCatalogueItem = {
  name: string;
  priceCents: number;
  stockQuantity: number;
};

export type VerticalConfig = {
  slug: string;
  displayName: string;
  productNoun: string;
  collectionNoun: string;
  windowNoun: string;
  defaultDepositPct: number | null;
  defaultPaymentTiming: "PAY_NOW" | "PAY_UPFRONT" | "DEPOSIT_THEN_BALANCE";
  defaultHandover: "COLLECT" | "DELIVER";
  defaultLeadDays: number;
  starterCatalogue: StarterCatalogueItem[];
  posterHeadline: string;
  hook: string;
  supporting: string;
  faq: { q: string; a: string }[];
};
