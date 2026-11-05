import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft, BadgePercent, Banknote, Bell, BellRing, BookOpen, Boxes, CalendarClock, CalendarDays,
  ChartPie, Check, Clapperboard, ClipboardList, Coins, CreditCard, Download, Film, FlaskConical, Gift, Globe, Handshake, Landmark,
  LayoutTemplate, Link, Mail, MessagesSquare, Nfc, Package, Printer, QrCode, Receipt, Repeat, Route, ScanLine,
  ShoppingBasket, ShoppingCart, Smartphone, Sparkles, Star, Store, Tags, Truck, Undo2, Users, Wallet,
} from "lucide-react";
import { PRO_BENEFIT_GROUPS } from "@/app/dashboard/(gated)/why-pro/pro-benefits";

export type PlanFeature = { label: string; icon: LucideIcon };
export type PlanFeatureGroup = { heading: string; items: PlanFeature[] };

const SOCIAL_PAYG = "Social posts, video clips and the video editor with pay-as-you-go credit packs";
const SOCIAL_PRO = "Social credits every month";
const VIDEO_CLIPS_PRO = "AI video clips";
const VIDEO_EDITOR_PRO = "Video editor";
const SOCIAL_PRO_TITLES = [SOCIAL_PRO, VIDEO_CLIPS_PRO, VIDEO_EDITOR_PRO];

const PAYMENT_TYPES: PlanFeature[] = [
  { label: "Visa, Mastercard and Amex", icon: CreditCard },
  { label: "Apple Pay, Google Pay and Link", icon: Smartphone },
  { label: "Tap & Go on your phone", icon: Nfc },
  { label: "Pay later with Klarna and Zip", icon: Wallet },
  { label: "PayID and PayTo in Australia, no Vendl fee", icon: Landmark },
  { label: "Cash App (US) and Pay by Bank (UK)", icon: Landmark },
  { label: "Cash, with no Vendl fee", icon: Banknote },
];

/** Everything on Free; keep in step with why-pro/free-includes.ts. */
const FREE_GROUPS: PlanFeatureGroup[] = [
  {
    heading: "Sell your way",
    items: [
      { label: "Your store page with logo, colours and socials", icon: Store },
      { label: "Products, categories and product variants", icon: Package },
      { label: "Volume and bundle pricing", icon: Tags },
      { label: "Pre-order pages with order windows and deposits", icon: CalendarClock },
      { label: "Subscriptions and memberships", icon: Repeat },
      { label: "QR self-checkout for stalls and in-person selling", icon: QrCode },
      { label: "Product or Customer Choice cart", icon: ShoppingCart },
      { label: "Main QR code with a printable poster", icon: Printer },
      { label: "Pick-ups and delivery", icon: Truck },
    ],
  },
  {
    heading: "Get paid",
    items: [
      { label: "Connect Square, Stripe or PayPal (Pro) for checkouts (2.5% Vendl fee on card sales)", icon: CreditCard },
      ...PAYMENT_TYPES,
      { label: "Sales tax: GST, VAT and US sales tax", icon: Receipt },
      { label: "Refunds from your orders page", icon: Undo2 },
    ],
  },
  {
    heading: "Run the business",
    items: [
      { label: "Orders with full order details", icon: ClipboardList },
      { label: "Inventory, stock counts and reports", icon: Boxes },
      { label: "Suppliers with their own logins", icon: Handshake },
      { label: "Data export", icon: Download },
      { label: "Sale alerts and notifications", icon: Bell },
    ],
  },
  {
    heading: "Grow your customers",
    items: [
      { label: "Customer list and smart lists", icon: Users },
      { label: "Branded email campaigns with click tracking", icon: Mail },
      { label: "Restock alerts customers can opt in to", icon: BellRing },
      { label: "First-order discount and cart upsells", icon: Gift },
      { label: SOCIAL_PAYG, icon: Sparkles },
    ],
  },
  {
    heading: "Learn and get help",
    items: [
      { label: "Guides and Getting Started onboarding", icon: BookOpen },
      { label: "Maker community", icon: MessagesSquare },
    ],
  },
];

const PRO_ICONS: Record<string, LucideIcon> = {
  "No Vendl fee on card sales": BadgePercent,
  "PayPal checkout": Wallet,
  "Web Studio, pages & blog": LayoutTemplate,
  "Your own web address": Globe,
  "Tags & Pixels": ScanLine,
  Reviews: Star,
  "URL redirects": Route,
  "Discount codes": Tags,
  "Cart upsell rules": ShoppingBasket,
  "Shipping rates": Truck,
  "Batches & materials": FlaskConical,
  "Recipes, costing & pricing": Coins,
  "AI invoice scanning": ScanLine,
  "Profit & loss": ChartPie,
  "The Vendl app": Smartphone,
  Calendar: CalendarDays,
  "More QR codes": QrCode,
  "Data import": ArrowRightLeft,
  [SOCIAL_PRO]: Sparkles,
  [VIDEO_CLIPS_PRO]: Clapperboard,
  [VIDEO_EDITOR_PRO]: Film,
  "Earn from referrals": Link,
};

export function freePlanFeatures(showSocial: boolean): PlanFeatureGroup[] {
  return FREE_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => showSocial || item.label !== SOCIAL_PAYG),
  }));
}

export function proPlanFeatures(showSocial: boolean): PlanFeatureGroup[] {
  const groups = PRO_BENEFIT_GROUPS.map((group) => {
    const items = group.items
      .filter((item) => showSocial || !SOCIAL_PRO_TITLES.includes(item.title))
      .map((item) => ({ label: item.title, icon: PRO_ICONS[item.title] ?? Check }));
    const withoutSocial = items.length < group.items.length;
    return { heading: withoutSocial ? "Referrals" : group.heading, items };
  }).filter((group) => group.items.length > 0);
  const [keepMore, ...rest] = groups;
  return [keepMore, { heading: "Payment types", items: PAYMENT_TYPES }, ...rest, SKOOL_PRO_GROUP];
}

const SKOOL_PRO_GROUP: PlanFeatureGroup = {
  heading: "Skool community",
  items: [
    { label: "Community access (also on Free)", icon: MessagesSquare },
    { label: "Gated Pro sections with advanced tutorials", icon: BookOpen },
    { label: "Templates and guides", icon: LayoutTemplate },
    { label: "Private discussions", icon: Users },
    { label: "Live workshops, coaching and Q&A where available", icon: CalendarDays },
  ],
};
