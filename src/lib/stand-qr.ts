import QRCode from "qrcode";
import { appBaseUrl } from "@/lib/app-url";
import type { CartMode, StandQrLinkMode } from "@/generated/prisma/client";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";

export function standCheckoutUrl(
  slug: string,
  cartMode: CartMode | "PRODUCT" | "CUSTOMER_CHOICE" = "PRODUCT",
) {
  const safeSlug = slug.trim().toLowerCase();
  const base = `${appBaseUrl()}/s/${safeSlug}`;
  return cartMode === "CUSTOMER_CHOICE" ? `${base}/pay` : base;
}

export type StandQrTargetInput = {
  linkMode: StandQrLinkMode | "LEGACY_STAND" | "WEBSITE_HOME" | "WEBSITE_CATEGORY";
  standSlug: string;
  cartMode?: CartMode | "PRODUCT" | "CUSTOMER_CHOICE";
  storefrontSlug?: string | null;
  categorySlug?: string | null;
  primaryCustomHostname?: string | null;
};

/**
 * Prefer website home when a storefront exists (unless Customer Choice forces
 * legacy stand checkout, or the owner explicitly chose a category).
 */
export function resolveStandQrLinkMode(input: {
  linkMode: StandQrLinkMode | string;
  cartMode?: CartMode | "PRODUCT" | "CUSTOMER_CHOICE";
  storefrontSlug?: string | null;
}): StandQrLinkMode | "LEGACY_STAND" | "WEBSITE_HOME" | "WEBSITE_CATEGORY" {
  if (input.cartMode === "CUSTOMER_CHOICE") return "LEGACY_STAND";
  if (input.linkMode === "WEBSITE_CATEGORY") return "WEBSITE_CATEGORY";
  if (input.storefrontSlug?.trim()) return "WEBSITE_HOME";
  if (input.linkMode === "WEBSITE_HOME") return "WEBSITE_HOME";
  return "LEGACY_STAND";
}

/** Public URL encoded into stand QR posters. */
export function standQrTargetUrl(input: StandQrTargetInput): string {
  const mode = resolveStandQrLinkMode({
    linkMode: input.linkMode,
    cartMode: input.cartMode,
    storefrontSlug: input.storefrontSlug,
  });
  const storefrontSlug = input.storefrontSlug?.trim().toLowerCase() || null;
  const categorySlug = input.categorySlug?.trim().toLowerCase() || null;

  if (mode === "WEBSITE_HOME" && storefrontSlug) {
    return storefrontPublicUrl(storefrontSlug, {
      path: "/",
      primaryCustomHostname: input.primaryCustomHostname,
    });
  }

  if (mode === "WEBSITE_CATEGORY" && storefrontSlug && categorySlug) {
    return storefrontPublicUrl(storefrontSlug, {
      path: `/shop/${encodeURIComponent(categorySlug)}`,
      primaryCustomHostname: input.primaryCustomHostname,
    });
  }

  return standCheckoutUrl(input.standSlug, input.cartMode ?? "PRODUCT");
}

export async function standQrDataUrl(
  checkoutUrl: string,
  width = 512,
): Promise<string> {
  return QRCode.toDataURL(checkoutUrl, {
    margin: 2,
    width,
    color: { dark: "#1a2e1a", light: "#ffffff" },
  });
}
