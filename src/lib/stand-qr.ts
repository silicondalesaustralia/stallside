import QRCode from "qrcode";
import { appBaseUrl } from "@/lib/app-url";
import type { CartMode } from "@/generated/prisma/client";

export function standCheckoutUrl(
  slug: string,
  cartMode: CartMode | "PRODUCT" | "CUSTOMER_CHOICE" = "PRODUCT",
) {
  const safeSlug = slug.trim().toLowerCase();
  const base = `${appBaseUrl()}/s/${safeSlug}`;
  return cartMode === "CUSTOMER_CHOICE" ? `${base}/pay` : base;
}

export async function standQrDataUrl(checkoutUrl: string, width = 512): Promise<string> {
  return QRCode.toDataURL(checkoutUrl, {
    margin: 2,
    width,
    color: { dark: "#1a2e1a", light: "#ffffff" },
  });
}
