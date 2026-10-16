import { customPagePublicPath } from "@/lib/studio/custom-page-paths";
import type { StorefrontCustomPage } from "@/lib/studio/custom-pages";

const seg = (s: string) => encodeURIComponent(s.trim().toLowerCase());

export type QrTargetEntity =
  | { kind: "home" | "shop" | "cart" }
  | { kind: "page"; page: StorefrontCustomPage }
  | { kind: "category" | "product" | "preorder_page"; slug: string }
  | { kind: "menu"; slug: string; drop: boolean };

/** Path on the seller's website (no site prefix), matching the routes old stall links redirect to. */
export function qrTargetPath(entity: QrTargetEntity): string {
  switch (entity.kind) {
    case "home":
      return "/";
    case "shop":
      return "/shop";
    case "cart":
      return "/cart";
    case "page":
      return customPagePublicPath("", entity.page, false, "");
    case "category":
      return `/${seg(entity.slug)}`;
    case "product":
      return `/products/${seg(entity.slug)}`;
    case "preorder_page":
      return `/pre-orders/${seg(entity.slug)}`;
    case "menu":
      return `/${entity.drop ? "pre-orders" : "menus"}/${seg(entity.slug)}`;
  }
}
