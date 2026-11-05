import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { journeysSince } from "./config";
import { loadAdoption } from "./adoption";
import { pickJourneyStep } from "./pick";
import { JOURNEY_OWNER_SELECT, deliverJourneyEmail } from "./send";
import { startProOnboarding } from "./start";

const CRON_OWNER_SELECT = {
  ...JOURNEY_OWNER_SELECT,
  user: { select: { email: true, name: true, role: true } },
  lifetimeAccess: true,
  subscriptionPlan: true,
  subscriptionStatus: true,
  currentPeriodEndsAt: true,
  cancelAtPeriodEnd: true,
  proOnboardingStartedAt: true,
  cardWelcomeSentAt: true,
  lifecycleSends: { select: { emailKey: true } },
  _count: { select: { products: true } },
} satisfies Prisma.OwnerSelect;

export type JourneysCronResult = { checked: number; sent: number; skipped: number; failed: number; proStarted: number };

/** Daily Free / recovery / Pro journeys (one email per owner per run). */
export async function runJourneysCron(now = new Date()): Promise<JourneysCronResult> {
  const since = journeysSince();
  const owners = await prisma.owner.findMany({
    where: {
      deletedAt: null,
      lifecycleEmailsOptOutAt: null,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: CRON_OWNER_SELECT,
  });
  const result: JourneysCronResult = { checked: owners.length, sent: 0, skipped: 0, failed: 0, proStarted: 0 };

  for (const owner of owners) {
    try {
      const isPro = ownerHasProAccess(owner, {
        email: owner.user.email,
        role: owner.user.role,
        lifetimeAccess: owner.lifetimeAccess,
      });
      const step = pickJourneyStep(
        {
          isPro,
          proAnchor: owner.proOnboardingStartedAt ?? owner.cardWelcomeSentAt,
          hasProducts: owner._count.products > 0,
          createdAt: owner.createdAt,
          handled: new Set(owner.lifecycleSends.map((s) => s.emailKey)),
        },
        now,
      );
      if (!step) continue;
      if (step.kind === "start_pro") {
        await startProOnboarding(owner, now);
        result.proStarted += 1;
        continue;
      }
      const adoption = step.email.skipWhen ? await loadAdoption(owner.id, step.journey === "pro") : null;
      const outcome = await deliverJourneyEmail(owner, step.email, adoption);
      if (outcome === "sent") result.sent += 1;
      else if (outcome === "skipped") result.skipped += 1;
      else if (outcome === "failed") result.failed += 1;
    } catch (error) {
      result.failed += 1;
      console.error("[lifecycle] journeys cron owner failed", owner.id, error);
    }
  }
  return result;
}
