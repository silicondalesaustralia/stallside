import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { richTextToPlainOrNull } from "@/lib/website/rich-text/plain";
import { parseBusinessProfile } from "./business-profile";
import type { SiteFacts } from "./site-facts";

export function siteFactsFromContext(
  ctx: NonNullable<StorefrontContext>,
  primaryCustomHostname: string | null,
): SiteFacts {
  const b = ctx.branding;
  const slug = ctx.storefront.slug;
  const homeUrl = storefrontPublicUrl(slug, { primaryCustomHostname });
  const sameHost = (u: string | null) => !!u && u.replace(/\/+$/, "") === homeUrl.replace(/\/+$/, "");
  return {
    slug,
    primaryCustomHostname,
    homeUrl,
    name: b.businessName || b.headline,
    description: richTextToPlainOrNull(b.about) ?? b.subheadline,
    logoUrl: b.logoUrl,
    imageUrl: b.heroImageUrl,
    email: b.contactEmail || null,
    phone: b.showPhone ? b.contactPhone : null,
    regionLabel: b.regionLabel,
    currency: ctx.stand.currency,
    businessMode: ctx.businessMode,
    socialUrls: [b.instagramUrl, b.facebookUrl, b.tiktokUrl, b.youtubeUrl, sameHost(b.websiteUrl) ? null : b.websiteUrl].filter(
      (u): u is string => !!u,
    ),
    profile: parseBusinessProfile(ctx.storefront.businessProfile),
  };
}
