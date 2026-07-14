import QRCode from "qrcode";

export function standCheckoutUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}/s/${slug}`;
}

export async function standQrDataUrl(checkoutUrl: string, width = 512): Promise<string> {
  return QRCode.toDataURL(checkoutUrl, {
    margin: 2,
    width,
    color: { dark: "#1a2e1a", light: "#ffffff" },
  });
}
