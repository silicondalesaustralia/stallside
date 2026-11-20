export type FeaturePlan = "FREE" | "PRO" | "FREE & PRO";

export type FeatureVisual =
  | "website"
  | "costing"
  | "stall"
  | "calendar"
  | "email"
  | "social"
  | "payments"
  | "shop"
  | "preorders"
  | "subscriptions"
  | "bundles"
  | "inventory"
  | "orders"
  | "customers"
  | "suppliers"
  | "restock"
  | "dashboard"
  | "generic";

export type FeatureStep = { title: string; body: string };

export type FeatureFaq = { q: string; a: string };

export type FeatureTable = {
  caption: string;
  headers: [string, string, string?];
  rows: Array<[string, string, string?]>;
};

export type FeaturePage = {
  slug: string;
  title: string;
  menuBlurb: string;
  eyebrow: string;
  plan: FeaturePlan;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  support: string;
  /** @deprecated Prefer FEATURE_VISUALS[slug]; kept for content compatibility. */
  visual: FeatureVisual;
  bullets: string[];
  steps: FeatureStep[];
  table?: FeatureTable;
  freeVsPro?: { free: string[]; pro: string[] };
  faqs: FeatureFaq[];
  relatedSlugs: string[];
};

export type FeatureMenuColumn = {
  heading: string;
  items: Array<{ slug: string; label: string }>;
};
