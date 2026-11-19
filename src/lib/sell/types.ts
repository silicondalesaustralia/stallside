export type SellVariant =
  | "fresh"
  | "batch"
  | "labour"
  | "machine"
  | "unique"
  | "personalized";

export type SellMarketStatus = "draft" | "reviewed" | "published";

export type SellCategory = {
  id: string;
  label: string;
  marketCount: number;
  previewSlugs: string[];
};

export type MarketSeed = {
  slug: string;
  label: string;
  aliases: string[];
  categoryId: string;
  variant: SellVariant;
  exampleProduct: string;
  saleUnit: string;
  inputLabels: string[];
  saleableYield: number;
  packagingPerUnit: number;
  currencyPresetId: "USD";
  scope: string;
  relatedSlugs: string[];
};

export type CalculatorInput = {
  id: string;
  label: string;
  unit: string;
  value: number;
  scope: "batch" | "unit";
};

export type SellMarket = {
  slug: string;
  label: string;
  aliases: string[];
  categoryId: string;
  variant: SellVariant;
  status: SellMarketStatus;
  seo: {
    title: string;
    description: string;
    primaryIntent: string;
    exclusions: string[];
  };
  hero: {
    heading: string;
    body: string;
    imageId: string;
    imageAlt: string;
  };
  example: {
    productName: string;
    storeLabel: string;
    isFictional: boolean;
  };
  calculator: {
    saleUnit: string;
    outputLabel: string;
    currencyPresetId: string;
    inputs: CalculatorInput[];
    saleableYield: number;
    unitsPerPack: number;
    assumptions: string[];
  };
  storefront: { heading: string; body: string; previewId: string };
  operations: {
    heading: string;
    body: string;
    steps: Array<{ title: string; description: string; featureId: string }>;
  };
  sellingModes: Array<{ featureId: string; example: string }>;
  marketing: {
    productName: string;
    socialExample: string;
    videoExample: string;
    emailExample: string;
  };
  faqs: Array<{ question: string; answer: string; evidenceIds: string[] }>;
  relatedSlugs: string[];
  resourceLinks: Array<{ href: string; label: string; reason: string }>;
  evidence: Array<{
    id: string;
    source: string;
    checkedAt: string;
    claim: string;
  }>;
  review: {
    contentReviewer: string;
    productReviewer: string;
    reviewedAt: string;
    version: number;
  };
  scope: string;
};
