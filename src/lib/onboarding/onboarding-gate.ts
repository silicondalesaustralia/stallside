import { prisma } from "@/lib/prisma";
import { isPlatformAdminEmail } from "@/lib/session";
import { loadSetupProgress, setupComplete, type SetupProgress } from "./setup-progress";

export const GET_STARTED_PATH = "/dashboard/get-started";

/** Owners who signed up before step 2 existed count as done once they have a product. */
const STEP_TWO_LAUNCH = new Date("2026-10-21T00:00:00Z");

type GateOwner = Parameters<typeof loadSetupProgress>[0] & {
  createdAt: Date;
  onboardingCompletedAt: Date | null;
};

export async function markOnboardingComplete(ownerId: string): Promise<void> {
  await prisma.owner.updateMany({
    where: { id: ownerId, onboardingCompletedAt: null },
    data: { onboardingCompletedAt: new Date() },
  });
}

/**
 * Whether the owner still belongs on the Get started page. Records completion
 * the first time every step is done (or for pre-launch owners with products).
 */
export async function onboardingPending(
  owner: GateOwner,
  email: string | null | undefined,
): Promise<{ pending: boolean; progress: SetupProgress | null }> {
  if (owner.onboardingCompletedAt || isPlatformAdminEmail(email)) {
    return { pending: false, progress: null };
  }
  const progress = await loadSetupProgress(owner);
  const legacyDone = owner.createdAt < STEP_TWO_LAUNCH && progress.products;
  if (legacyDone || setupComplete(progress)) {
    await markOnboardingComplete(owner.id);
    return { pending: false, progress };
  }
  return { pending: true, progress };
}
