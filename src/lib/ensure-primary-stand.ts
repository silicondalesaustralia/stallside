import { prisma } from "@/lib/prisma";
import { uniqueStandSlug } from "@/lib/slug";
import { DEFAULT_TIMEZONE } from "@/lib/stand-timezone";
import { ensureStandImmediateOption } from "@/lib/fulfilment/defaults";

/** Ensure the owner has at least one stand (food businesses need Product.standId). */
export async function ensurePrimaryStand(owner: {
  id: string;
  businessName: string;
  suburb: string | null;
  defaultTimezone: string;
  brandAccentColor: string | null;
  brandSecondaryColor: string | null;
  brandLogoUrl: string | null;
  shortDescription: string | null;
}) {
  const existing = await prisma.stand.findFirst({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "asc" },
  });
  if (existing) {
    await ensureStandImmediateOption(existing);
    return existing;
  }

  const slug = await uniqueStandSlug(owner.businessName, async (s) => {
    const found = await prisma.stand.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  return prisma.stand.create({
    data: {
      ownerId: owner.id,
      name: owner.businessName,
      slug,
      locationLabel: owner.suburb,
      description: owner.shortDescription,
      currency: "AUD",
      timezone: owner.defaultTimezone || DEFAULT_TIMEZONE,
      accentColor: owner.brandAccentColor,
      secondaryColor: owner.brandSecondaryColor,
      logoUrl: owner.brandLogoUrl,
      acceptCash: true,
      acceptLocalTransfer: true,
      acceptCard: true,
    },
  }).then(async (stand) => {
    await ensureStandImmediateOption(stand);
    return stand;
  });
}
