import QRCode from "qrcode";
import { appBaseUrl } from "@/lib/app-url";

export function standCheckoutUrl(slug: string): string {
  const safeSlug = slug.trim().toLowerCase();
  return `${appBaseUrl()}/s/${safeSlug}`;
}

export async function standQrDataUrl(checkoutUrl: string, width = 512): Promise<string> {
  return QRCode.toDataURL(checkoutUrl, {
    margin: 2,
    width,
    color: { dark: "#1a2e1a", light: "#ffffff" },
  });
}
