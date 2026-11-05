import { formatLpPrice } from "@/lib/makers-lp-price";
import { isBillingCurrency, type BillingCurrency } from "@/lib/saas-pricing";

export const DFY_BUILD_PATH = "/dashboard/done-for-you-website";
export const DFY_BUILD_PURPOSE = "dfy_website_build";
export const DFY_BUILD_TITLE = "Done-for-you website build";

/** One-off fee in cents: US$400 and its rounded local equivalents. */
export const DFY_BUILD_PRICES: Record<BillingCurrency, number> = {
  USD: 40000,
  AUD: 59900,
  GBP: 31900,
  EUR: 36900,
};

export const DFY_BUILD_SUMMARY =
  "Prefer not to build it yourself? Our team builds your Vendl website for you and connects your own domain if you have one.";

export const DFY_BUILD_INCLUDES = [
  "A website built in Web Studio from your products, branding and business details",
  "Home, about and contact pages written with you",
  "Your own domain connected, with security certificates handled",
  "Your site published and ready to share",
  "Full access to edit everything yourself afterwards",
] as const;

export const DFY_BUILD_STEPS = [
  {
    title: "Book your build",
    body: "Pay the one-off fee below. Add your domain if you already own one.",
  },
  {
    title: "Send us your details",
    body: "We'll email you a short list of what we need: your logo and branding, any styling requests or sites you like, your business information and the story behind your business.",
  },
  {
    title: "We build your website",
    body: "Builds take 1 to 2 weeks from when we have your details, depending on how many builds we have going.",
  },
  {
    title: "Review and go live",
    body: "We share your site for feedback, make your changes, connect your domain and publish it.",
  },
] as const;

export const DFY_BUILD_FREE_NOTE = "Your website and custom domain go live on Vendl Pro.";

export function dfyBuildCurrency(value: string | null | undefined): BillingCurrency {
  const code = (value ?? "").trim().toUpperCase();
  return isBillingCurrency(code) ? code : "USD";
}

/** e.g. US$400, A$599, £319, €369. */
export function formatDfyBuildPrice(currency: BillingCurrency): string {
  return formatLpPrice(DFY_BUILD_PRICES[currency], currency);
}
