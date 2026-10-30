import { router, type Href } from "expo-router";
import { openOnWeb } from "@/lib/open-web";

/** Dashboard sections the app has screens for, keyed by feature id (the href after /dashboard/). */
export const NATIVE_ROUTES: Record<string, Href> = {
  overview: "/home",
  orders: "/orders",
  products: "/products",
  inventory: "/inventory",
  collections: "/collections",
  customers: "/customers",
  notifications: "/notifications",
  reviews: "/reviews",
  discounts: "/discounts",
  subscriptions: "/subscriptions",
  qr: "/qr",
  categories: "/categories",
  "pre-order-pages": "/pre-orders",
  upsells: "/upsells",
  communication: "/communication",
  shipping: "/shipping",
  suppliers: "/suppliers",
  calendar: "/calendar",
  payments: "/payments",
  settings: "/account",
  knowledge: "/guides",
  production: "/production",
  "production/materials": "/production/materials",
  "production/profit": "/production/profit",
};

/** Opens a dashboard path in the app when there's a matching screen, otherwise on the web. */
export function openDashboardPath(href: string, token: string | null): void {
  const path = href.split("?")[0];
  const id =
    path === "/dashboard" ? "overview" : path.replace(/^\/dashboard\//, "");
  const route = NATIVE_ROUTES[id];
  if (route) router.navigate(route);
  else void openOnWeb(href, token);
}
