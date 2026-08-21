import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Record first live product once (signup → live timing). */
export async function markFirstProductLive(ownerId: string): Promise<void> {
  await prisma.owner.updateMany({
    where: { id: ownerId, firstProductLiveAt: null },
    data: { firstProductLiveAt: new Date() },
  });
}

export async function medianSignupToFirstLiveMs(): Promise<number | null> {
  return unstable_cache(computeMedianSignupToFirstLiveMs, ["median-signup-live"], {
    revalidate: 3600,
  })();
}

async function computeMedianSignupToFirstLiveMs(): Promise<number | null> {
  const rows = await prisma.owner.findMany({
    where: { firstProductLiveAt: { not: null }, deletedAt: null },
    select: { createdAt: true, firstProductLiveAt: true },
    take: 5000,
  });
  if (rows.length === 0) return null;
  const deltas = rows
    .map((r) => (r.firstProductLiveAt!.getTime() - r.createdAt.getTime()))
    .filter((ms) => ms >= 0)
    .sort((a, b) => a - b);
  if (deltas.length === 0) return null;
  const mid = Math.floor(deltas.length / 2);
  return deltas.length % 2 === 0
    ? Math.round((deltas[mid - 1] + deltas[mid]) / 2)
    : deltas[mid];
}
