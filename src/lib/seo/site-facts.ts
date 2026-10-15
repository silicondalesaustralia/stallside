import type { BusinessProfile } from "./business-profile";

/** Everything the graph builders need about the business, independent of how the page loaded it. */
export type SiteFacts = {
  slug: string;
  primaryCustomHostname: string | null;
  homeUrl: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  email: string | null;
  phone: string | null;
  regionLabel: string | null;
  currency: string;
  businessMode: string;
  /** Social and website links already on the storefront (Instagram, Facebook…). */
  socialUrls: string[];
  profile: BusinessProfile;
};
