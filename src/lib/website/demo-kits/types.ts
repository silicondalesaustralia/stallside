export const DEMO_KIT_IDS = [
  "green-valley",
  "mill-and-crumb",
  "north-and-field",
] as const;

export type DemoKitId = (typeof DEMO_KIT_IDS)[number];

export type DemoImageRole =
  | "HERO_WIDE"
  | "HERO_PORTRAIT"
  | "PLACE"
  | "PROCESS"
  | "PACKSHOT";

export type DemoKitProduct = {
  id: string;
  name: string;
  categoryId: string;
  priceCents: number;
  variants?: string[];
  badge?: "NEW" | "SEASONAL";
  soldOut?: boolean;
  packshotPath: string;
  cutoutPath?: string;
};

export type DemoKitCategory = {
  id: string;
  name: string;
  tilePackshotPath: string;
};

export type DemoKitAbout = {
  heading: string;
  short: string;
  long: string;
  pillars: [string, string, string];
};

export type DemoKitCopy = {
  headline: { short: string; medium: string; long: string };
  subhead: string;
  announcement: string;
  promo: string;
  processSteps: [string, string, string];
  faq: { q: string; a: string }[];
  reviews: { text: string; name: string }[];
  cta: { primary: string; secondary: string };
  about: DemoKitAbout;
};

export type DemoKit = {
  id: DemoKitId;
  placeholderName: string;
  vertical: "FARM_LOCAL" | "BAKERY_PREORDER" | "GENERAL_PRODUCTS";
  backdropHex: string;
  business: { locality: string; contactEmail: string };
  copy: DemoKitCopy;
  categories: DemoKitCategory[];
  products: DemoKitProduct[];
  images: {
    heroWide: string;
    heroPortrait: string;
    place: string;
    process: string;
  };
};

export function isDemoKitId(value: string): value is DemoKitId {
  return (DEMO_KIT_IDS as readonly string[]).includes(value);
}

export function formatKitPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
