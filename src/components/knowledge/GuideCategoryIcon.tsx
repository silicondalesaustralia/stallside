import {
  Bell,
  CalendarClock,
  ChefHat,
  CreditCard,
  Handshake,
  Megaphone,
  Package,
  Receipt,
  Repeat,
  Rocket,
  Share2,
  ShoppingBag,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import type { KnowledgeIconName } from "@/lib/knowledge-base";

const ICONS: Record<KnowledgeIconName, LucideIcon> = {
  start: Rocket,
  products: Package,
  orders: ShoppingBag,
  preorders: CalendarClock,
  subscriptions: Repeat,
  marketing: Megaphone,
  social: Share2,
  production: ChefHat,
  suppliers: Handshake,
  payments: CreditCard,
  alerts: Bell,
  tax: Receipt,
  account: UserCog,
};

type GuideCategoryIconProps = {
  name: KnowledgeIconName;
  className?: string;
};

export default function GuideCategoryIcon({ name, className }: GuideCategoryIconProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden className={className ?? "size-5"} />;
}
