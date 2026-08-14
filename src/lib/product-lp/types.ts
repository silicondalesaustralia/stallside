export type ProductLpStep = {
  n: string;
  title: string;
  body: string;
};

export type ProductLpQa = {
  q: string;
  a: string;
};

export type ProductLpDoorwayLink = {
  href: string;
  label: string;
  blurb: string;
};

export type ProductLpProofStat = {
  label: string;
  value: string;
  warn?: boolean;
};

export type ProductLpContent = {
  /** For metadata */
  metaTitle: string;
  metaDescription: string;
  canonical: string;

  eyebrow: string;
  headline: string;
  support: string;
  chips: string[];
  ctaLabel: string;
  /** Base signup path, e.g. /signup or /signup?vertical=bakers&utm_content=… */
  signupHref: string;
  secondaryLabel: string;

  stripHeading: string;
  stripItems: string[];
  stripFootnote: string;
  /** Second strip for conversion / upsell tools (stall product pages). */
  upsellHeading?: string;
  upsellItems?: string[];
  upsellFootnote?: string;
  /** Above-the-fold upsell callout under the hero support text. */
  heroUpsellLabel?: string;
  heroUpsellDetail?: string;
  /** Icon feature points under the hero headline (upsell, subscriptions, etc.). */
  heroFeaturePoints?: {
    icon: "upsell" | "subscription";
    label: string;
    detail: string;
  }[];
  /** Show payment-brand strip under the hero (default true). */
  showPaymentStrip?: boolean;
  /** UK ads LPs drop PayID / PayTo / Zip. */
  paymentMarket?: "au" | "uk";
  /** Override hardcoded AUD amounts in bakers / collage heroes. */
  heroPrices?: {
    taken: string;
    compareAt: string;
    price: string;
  };

  problemEyebrow: string;
  problemHeadline: string;
  problemBody: string;
  problemPoints: string[];
  problemFlow: string[];

  howHeading: string;
  howSupport: string;
  steps: ProductLpStep[];

  proofEyebrow: string;
  proofHeadline: string;
  proofBody: string;
  proofBenefits: string[];
  proofNote: string;
  proofPanelTitle: string;
  proofPanelSubtitle: string;
  proofStats: ProductLpProofStat[];
  proofRecentTitle: string;
  proofRecentSub: string;

  objectionsHeading: string;
  objectionsSupport: string;
  objections: ProductLpQa[];

  testimonialQuote: string;
  testimonialExtra?: string;
  testimonialCite: string;
  testimonialPlace: string;

  pricingEyebrow: string;
  pricingHeadline: string;
  pricingBody: string[];
  pricingIncluded: string[];
  pricingFullHref: string;

  closingHeadline: string;
  closingSupport: string;
  closingNote: string;

  /** Hub pages only - links to own doorways */
  doorwayLinks?: ProductLpDoorwayLink[];
  doorwaySectionHeading?: string;

  /** Hero visual: stall photo vs make-list panel vs product photo collages */
  heroVisual: "stall" | "makeList" | "delivery" | "bakers" | "firewood" | "farmStalls";
};
