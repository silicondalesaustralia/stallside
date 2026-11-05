import { prisma } from "@/lib/prisma";
import { journeysSince } from "./config";
import { FREE_WELCOME_KEY, PRO_WELCOME_KEY, journeyEmail } from "./catalog";
import { JOURNEY_OWNER_SELECT, deliverJourneyEmail, type JourneyOwner } from "./send";

function inJourneyScope(owner: { createdAt: Date }): boolean {
  const since = journeysSince();
  return !since || owner.createdAt >= since;
}

async function loadOwner(ownerId: string) {
  return prisma.owner.findUnique({
    where: { id: ownerId },
    select: { ...JOURNEY_OWNER_SELECT, deletedAt: true, trialWelcomeSentAt: true, proOnboardingStartedAt: true },
  });
}

/**
 * Free journey Day 0 welcome. Returns false when the owner is outside the journeys
 * (created before LIFECYCLE_JOURNEYS_V2_SINCE) so the caller can send the legacy welcome.
 */
export async function sendFreeJourneyWelcome(ownerId: string): Promise<boolean> {
  const owner = await loadOwner(ownerId);
  if (!owner || owner.deletedAt) return true;
  if (!inJourneyScope(owner)) return false;
  if (owner.trialWelcomeSentAt) return true;
  const email = journeyEmail(FREE_WELCOME_KEY);
  if (!email) throw new Error(`Missing journey email ${FREE_WELCOME_KEY}`);
  const result = await deliverJourneyEmail(owner, email, null);
  if (result !== "failed") {
    await prisma.owner.update({ where: { id: ownerId }, data: { trialWelcomeSentAt: new Date() } });
  }
  return true;
}

/** Anchors the Pro journey (Day 0 = now) and sends the Pro welcome, once per owner. */
export async function startProOnboarding(owner: JourneyOwner, now = new Date()): Promise<void> {
  const claimed = await prisma.owner.updateMany({
    where: { id: owner.id, proOnboardingStartedAt: null },
    data: { proOnboardingStartedAt: now },
  });
  if (claimed.count === 0) return;
  const email = journeyEmail(PRO_WELCOME_KEY);
  if (!email) throw new Error(`Missing journey email ${PRO_WELCOME_KEY}`);
  const result = await deliverJourneyEmail(owner, email, null);
  if (result !== "failed") {
    await prisma.owner.updateMany({
      where: { id: owner.id, cardWelcomeSentAt: null },
      data: { cardWelcomeSentAt: now },
    });
  }
}

/** Pro journey start for upgrade hooks. Returns false when the owner is outside the journeys. */
export async function startProJourneyById(ownerId: string): Promise<boolean> {
  const owner = await loadOwner(ownerId);
  if (!owner || owner.deletedAt) return true;
  if (!inJourneyScope(owner)) return false;
  if (!owner.proOnboardingStartedAt) await startProOnboarding(owner);
  return true;
}
