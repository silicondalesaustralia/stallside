import {
  BadgePercent,
  Calculator,
  Clapperboard,
  Globe,
  Palette,
  Tags,
  Video,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type ProCard = { title: string; body: string; icon: LucideIcon; social?: boolean };

export const BILLING_PATH = "/dashboard/settings/billing";

export const PRO_GOLD_CTA =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--marigold)] px-6 py-2.5 text-sm font-bold text-[var(--field)] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--field)]";

/** Fixed locale so server and browser render the same string (A$19.99, $14.99, £11.99, €14.99). */
export function formatProMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function proCheckoutHref(currency: string, interval: "month" | "year" = "month"): string {
  const qs = new URLSearchParams({ plan: "pro", currency });
  if (interval === "year") qs.set("interval", "year");
  return `${BILLING_PATH}?${qs.toString()}`;
}

export const OPENING_CARDS: ProCard[] = [
  { title: "Price with confidence", body: "Track materials, recipes and costs to inform your prices.", icon: Calculator },
  {
    title: "Promote what you make",
    body: "Get monthly design and video credits, plus editing tools.",
    icon: Video,
    social: true,
  },
  { title: "Keep more per sale", body: "Pay no Vendl transaction fee on eligible card sales.", icon: Wallet },
];

/** Replaces the social opening card while Social isn't live for the owner. */
export const WEBSITE_OPENING_CARD: ProCard = {
  title: "Build your own website",
  body: "Use Web Studio and connect your own domain.",
  icon: Globe,
};

export const FEATURED_BENEFITS: ProCard[] = [
  { title: "Know what it costs to make", body: "Track ingredients, materials, packaging and production costs.", icon: Calculator },
  { title: "Price with more confidence", body: "Use your product costs to inform selling prices.", icon: Tags },
  {
    title: "Create promotional video clips",
    body: "Turn your footage into content using monthly AI video credits.",
    icon: Clapperboard,
    social: true,
  },
  {
    title: "Make social content faster",
    body: "Create promotional designs with monthly credits and editing tools.",
    icon: Palette,
    social: true,
  },
  { title: "Build a more complete online presence", body: "Use Web Studio and connect your own domain.", icon: Globe },
  { title: "Keep more from eligible sales", body: "Remove Vendl's 2.5% transaction fee on eligible payments.", icon: BadgePercent },
];

export const DECISION_REMINDERS = [
  "Production costing and pricing tools",
  "Social marketing tools and monthly credits",
  "Web Studio and custom domain support",
  "No Vendl transaction fee on eligible payments",
] as const;