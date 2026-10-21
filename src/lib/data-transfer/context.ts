import { prisma } from "@/lib/prisma";
import { resolveStandTimezone } from "@/lib/stand-timezone";

export type DataContext = {
  ownerId: string;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
  stand: { id: string; slug: string; currency: string; timeZone: string };
};

export async function loadDataContext(
  owner: { id: string; stripeAccountId: string | null; stripeChargesEnabled: boolean },
  standId: string,
): Promise<DataContext | null> {
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    select: { id: true, slug: true, currency: true, timezone: true },
  });
  if (!stand) return null;
  return {
    ownerId: owner.id,
    stripeAccountId: owner.stripeAccountId,
    stripeChargesEnabled: owner.stripeChargesEnabled,
    stand: {
      id: stand.id,
      slug: stand.slug,
      currency: stand.currency,
      timeZone: resolveStandTimezone(stand.timezone),
    },
  };
}
