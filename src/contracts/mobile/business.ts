import { z } from "zod";

const option = z.object({ id: z.string(), label: z.string() });

export const SOCIAL_LINK_FIELDS = [
  "instagramUrl",
  "facebookUrl",
  "tiktokUrl",
  "youtubeUrl",
  "websiteUrl",
] as const;
export type SocialLinkField = (typeof SOCIAL_LINK_FIELDS)[number];

const socialLinks = z.object({
  instagramUrl: z.string(),
  facebookUrl: z.string(),
  tiktokUrl: z.string(),
  youtubeUrl: z.string(),
  websiteUrl: z.string(),
});

export const businessQuery = z.object({ standId: z.string().min(1) });

export const businessDetailsResponse = z.object({
  id: z.string(),
  name: z.string(),
  locationLabel: z.string(),
  currency: z.string(),
  timezone: z.string(),
  /** Where shoppers land: the website, or the business checkout page. */
  publicUrl: z.string(),
  publicLabel: z.string(),
  site: z
    .object({
      url: z.string(),
      label: z.string(),
      customDomain: z.boolean(),
      published: z.boolean(),
    })
    .nullable(),
  social: socialLinks,
  socialLabels: z.array(z.object({ field: z.enum(SOCIAL_LINK_FIELDS), label: z.string() })),
  currencies: z.array(option),
  timezones: z.array(option),
});
export type BusinessDetailsResponse = z.infer<typeof businessDetailsResponse>;

export const businessDetailsBody = z.object({
  standId: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  locationLabel: z.string().trim().max(120),
  currency: z.string().min(3).max(3),
  timezone: z.string().min(1).max(60),
});
export type BusinessDetailsBody = z.infer<typeof businessDetailsBody>;

export const businessSocialBody = socialLinks.extend({ standId: z.string().min(1) });
export type BusinessSocialBody = z.infer<typeof businessSocialBody>;
