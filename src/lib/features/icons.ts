import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  Boxes,
  CalendarClock,
  CalendarDays,
  Coins,
  FlaskConical,
  Globe,
  Handshake,
  LayoutTemplate,
  Mail,
  Package,
  QrCode,
  Repeat,
  ShoppingCart,
  Sparkles,
  Store,
  Tags,
  Users,
  CreditCard,
  ClipboardList,
} from "lucide-react";

/** Primary icon for hub cards, mega menu, and page heroes. */
export const FEATURE_ICONS: Record<string, LucideIcon> = {
  "online-shop": Store,
  "pre-orders": CalendarClock,
  subscriptions: Repeat,
  "stall-checkout": QrCode,
  bundles: Tags,
  payments: CreditCard,
  inventory: Boxes,
  orders: ClipboardList,
  suppliers: Handshake,
  calendar: CalendarDays,
  customers: Users,
  "email-marketing": Mail,
  social: Sparkles,
  "restock-alerts": BellRing,
  costing: FlaskConical,
  website: LayoutTemplate,
};

/** Icons paired with each feature’s bullet list (same order). */
export const FEATURE_BULLET_ICONS: Record<string, LucideIcon[]> = {
  "online-shop": [Store, Package, ShoppingCart, LayoutTemplate, Globe],
  "pre-orders": [CalendarClock, CreditCard, CalendarDays, ClipboardList, Store],
  subscriptions: [Repeat, Users, CalendarDays, Package, CreditCard],
  "stall-checkout": [QrCode, ShoppingCart, LayoutTemplate, BellRing, Boxes],
  bundles: [Tags, Package, Store, ShoppingCart],
  payments: [CreditCard, ShoppingCart, Globe, Coins, ClipboardList],
  inventory: [Boxes, CalendarDays, Coins, Package, Tags],
  orders: [ClipboardList, Store, CreditCard, BellRing],
  suppliers: [Handshake, Package, Boxes, Tags, Coins],
  calendar: [CalendarDays, Globe, FlaskConical],
  customers: [Users, Tags, Package, Sparkles],
  "email-marketing": [Mail, Users, BellRing, Tags],
  social: [Sparkles, CalendarDays, Package, Coins],
  "restock-alerts": [BellRing, Boxes, Users],
  costing: [FlaskConical, Coins, Tags, Package, LayoutTemplate],
  website: [LayoutTemplate, Globe, Tags, Sparkles, Store],
};

export function featureIcon(slug: string): LucideIcon {
  return FEATURE_ICONS[slug] ?? Package;
}

export function featureBulletIcons(slug: string, count: number): LucideIcon[] {
  const listed = FEATURE_BULLET_ICONS[slug] ?? [];
  const fallback = featureIcon(slug);
  return Array.from({ length: count }, (_, i) => listed[i] ?? fallback);
}
