import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { CHATGPT_FEED_PATH, GMC_FEED_PATH } from "./types";

export type ProductFeedUrls = {
  googleMerchant: string;
  chatgpt: string;
};

/** Absolute feed URLs for the seller's live storefront host. */
export function productFeedUrls(
  slug: string,
  primaryCustomHostname: string | null,
): ProductFeedUrls {
  const opts = { primaryCustomHostname };
  return {
    googleMerchant: storefrontPublicUrl(slug, { ...opts, path: GMC_FEED_PATH }),
    chatgpt: storefrontPublicUrl(slug, { ...opts, path: CHATGPT_FEED_PATH }),
  };
}
