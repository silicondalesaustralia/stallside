import { CartMode } from "@/generated/prisma/client";
import { appBaseUrl } from "@/lib/app-url";
import { publishedWebsiteForStand, standWebsiteUrl } from "./stand-website";

/**
 * Absolute `/checkout/success` URL card and PayPal payments return to: the stand's published
 * website when it has one, else vendl.app. Customer Choice payments always stay on vendl.app.
 */
export async function checkoutSuccessUrl(standSlug: string, customerChoice: boolean): Promise<string> {
  const apex = `${appBaseUrl()}/checkout/success`;
  if (customerChoice) return apex;
  try {
    const site = await publishedWebsiteForStand(standSlug);
    if (!site || site.cartMode === CartMode.CUSTOMER_CHOICE) return apex;
    return standWebsiteUrl(site, "/checkout/success");
  } catch (err) {
    console.error("[checkout-return-url] website lookup failed; returning to vendl.app", err);
    return apex;
  }
}
