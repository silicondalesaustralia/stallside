import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CURRENCIES } from "@/lib/constants";
import { STAND_TIMEZONES, resolveStandTimezone } from "@/lib/stand-timezone";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { parseSocialUrl, STAND_SOCIALS } from "@/lib/stand-social";
import { revalidateStandPaths } from "./revalidate-stand-paths";

const timezoneValues = STAND_TIMEZONES.map((z) => z.value) as [string, ...string[]];

const detailsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  locationLabel: z.string().trim().max(120),
  currency: z.enum(CURRENCIES),
  timezone: z.enum(timezoneValues),
});

export type StandDetailsInput = {
  name: string;
  locationLabel: string;
  currency: string;
  timezone: string;
  /** Omit to keep the current description. */
  description?: string;
  /** Omit (or blank) to keep the current web address slug. */
  slug?: string;
};

export type StandSocialLinks = {
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
};

type Result = { ok: true } | { error: string };

/** Saves the business Details form (name, location, currency, timezone). */
export async function updateOwnerStandDetails(
  ownerId: string,
  standId: string,
  input: StandDetailsInput,
): Promise<Result> {
  const existing = await prisma.stand.findFirst({ where: { id: standId, ownerId } });
  if (!existing) return { error: "Stand not found." };

  const parsed = detailsSchema.safeParse({ ...input, timezone: resolveStandTimezone(input.timezone) });
  if (!parsed.success) {
    const detail = parsed.error.issues[0]?.message;
    return { error: detail ? `Check business details (${detail}).` : "Check business details and try again." };
  }
  const description = (input.description ?? existing.description ?? "").trim();
  if (description.length > 8000) return { error: "Check business details (description is too long)." };

  let slug = existing.slug;
  const requestedSlug = (input.slug ?? "").trim().toLowerCase();
  if (requestedSlug && requestedSlug !== existing.slug) {
    const taken = await prisma.stand.findFirst({ where: { slug: requestedSlug, NOT: { id: standId } } });
    if (taken) return { error: "That slug is already taken." };
    slug = requestedSlug;
  }

  const clearLocal = !localTransferForCurrency(parsed.data.currency);
  await prisma.stand.update({
    where: { id: standId },
    data: {
      name: parsed.data.name,
      slug,
      description: description || null,
      locationLabel: parsed.data.locationLabel || null,
      currency: parsed.data.currency,
      timezone: parsed.data.timezone,
      ...(clearLocal ? { localTransferAlias: null, localTransferMethodId: null, acceptLocalTransfer: false } : {}),
    },
  });
  revalidateStandPaths(standId, slug, existing.slug);
  return { ok: true };
}

/** Validates social link URLs; blank hides the icon. */
export function parseStandSocialLinks(
  read: (field: string) => string,
): { ok: true; data: StandSocialLinks } | { ok: false; error: string } {
  const data: StandSocialLinks = {
    instagramUrl: null,
    facebookUrl: null,
    tiktokUrl: null,
    youtubeUrl: null,
    websiteUrl: null,
  };
  for (const social of STAND_SOCIALS) {
    const parsed = parseSocialUrl(read(social.field));
    if (parsed && typeof parsed === "object") return { ok: false, error: `${social.label}: ${parsed.error}` };
    if (social.field in data) data[social.field as keyof StandSocialLinks] = parsed;
  }
  return { ok: true, data };
}

/** Saves the business social links. */
export async function updateOwnerStandSocial(
  ownerId: string,
  standId: string,
  links: Partial<Record<keyof StandSocialLinks, string>>,
): Promise<Result> {
  const existing = await prisma.stand.findFirst({ where: { id: standId, ownerId }, select: { slug: true } });
  if (!existing) return { error: "Stand not found." };
  const parsed = parseStandSocialLinks((field) => links[field as keyof StandSocialLinks] ?? "");
  if (!parsed.ok) return { error: parsed.error };
  await prisma.stand.update({ where: { id: standId }, data: parsed.data });
  revalidateStandPaths(standId, existing.slug, existing.slug);
  return { ok: true };
}
