import type { BusinessDetailsResponse, SocialLinkField } from "@/contracts/mobile/business";
import { SOCIAL_LINK_FIELDS } from "@/contracts/mobile/business";
import { prisma } from "@/lib/prisma";
import { CURRENCIES } from "@/lib/constants";
import { STAND_TIMEZONES, resolveStandTimezone } from "@/lib/stand-timezone";
import { STAND_SOCIALS } from "@/lib/stand-social";
import { standPublicHome } from "@/lib/storefront/legacy-stand-redirect";
import { businessSiteUrl } from "@/lib/storefront/business-site-url";

const isSocialField = (field: string): field is SocialLinkField =>
  (SOCIAL_LINK_FIELDS as readonly string[]).includes(field);

/** The business Details tab: fields, social links and where shoppers land. */
export async function loadBusinessDetails(ownerId: string, standId: string): Promise<BusinessDetailsResponse | null> {
  const stand = await prisma.stand.findFirst({ where: { id: standId, ownerId } });
  if (!stand) return null;
  const [publicHome, site] = await Promise.all([
    standPublicHome(stand.slug, stand.cartMode),
    businessSiteUrl(ownerId),
  ]);
  return {
    id: stand.id,
    name: stand.name,
    locationLabel: stand.locationLabel ?? "",
    currency: stand.currency,
    timezone: resolveStandTimezone(stand.timezone),
    publicUrl: publicHome.url,
    publicLabel: publicHome.label,
    site,
    social: {
      instagramUrl: stand.instagramUrl ?? "",
      facebookUrl: stand.facebookUrl ?? "",
      tiktokUrl: stand.tiktokUrl ?? "",
      youtubeUrl: stand.youtubeUrl ?? "",
      websiteUrl: stand.websiteUrl ?? "",
    },
    socialLabels: STAND_SOCIALS.flatMap((s) => (isSocialField(s.field) ? [{ field: s.field, label: s.label }] : [])),
    currencies: CURRENCIES.map((c) => ({ id: c, label: c === "USD" ? "USD (United States)" : c })),
    timezones: STAND_TIMEZONES.map((z) => ({ id: z.value, label: z.label })),
  };
}
