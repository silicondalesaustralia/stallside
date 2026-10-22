import { visibleNavGroups } from "@/components/dash-nav-links";
import type { MobileFeature } from "@/contracts/mobile/me";

/** Desk-only sections the app never lists, on top of the Website-beta links (`websiteOnly`). */
const WEB_ONLY_HREFS = new Set(["/dashboard/connectors", "/dashboard/social"]);

/** Sections with a native screen; every other nav link opens on the web inside the app. */
const NATIVE_HREFS = new Set([
  "/dashboard",
  "/dashboard/orders",
  "/dashboard/products",
  "/dashboard/inventory",
  "/dashboard/collections",
  "/dashboard/customers",
  "/dashboard/notifications",
  "/dashboard/reviews",
  "/dashboard/discounts",
  "/dashboard/subscriptions",
  "/dashboard/qr",
  "/dashboard/categories",
  "/dashboard/pre-order-pages",
  "/dashboard/upsells",
  "/dashboard/communication",
  "/dashboard/shipping",
  "/dashboard/suppliers",
  "/dashboard/calendar",
  "/dashboard/payments",
  "/dashboard/settings",
  "/dashboard/knowledge",
]);

function featureId(href: string): string {
  if (href === "/dashboard") return "overview";
  return href.replace(/^\/dashboard\//, "").replaceAll("/", ".");
}

/** Built from the web dashboard nav, so a new web section shows up in the app with no app release. */
export function buildMobileFeatures(): MobileFeature[] {
  return visibleNavGroups(false).flatMap((group) =>
    group.links
      .filter((link) => !WEB_ONLY_HREFS.has(link.href))
      .map((link) => ({
        id: featureId(link.href),
        label: link.label,
        group: group.heading,
        webPath: link.href,
        native: NATIVE_HREFS.has(link.href),
        comingSoon: Boolean(link.comingSoon),
      })),
  );
}
