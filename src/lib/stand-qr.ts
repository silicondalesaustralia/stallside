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

/** Public URL encoded into stand QR posters. */
export function standQrTargetUrl(input: StandQrTargetInput): string {
  const mode = input.linkMode;
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

export async function standQrDataUrl(checkoutUrl: string, width = 512): Promise<string> {
  return QRCode.toDataURL(checkoutUrl, {
    margin: 2,
    width,
    color: { dark: "#1a2e1a", light: "#ffffff" },
  });
}
