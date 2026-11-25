import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import { prisma } from "@/lib/prisma";
import { extractWebsiteStudio } from "@/lib/studio/storage";
import { ownerSquareReady } from "@/lib/square/owner-ready";
import {
  onboardingActiveStep,
  setupComplete,
  type SetupProgress,
} from "./setup-progress-state";

export type { SetupProgress };
export { onboardingActiveStep, setupComplete };

type ProgressOwner = {
  id: string;
  billingCurrency: string | null;
  stripeChargesEnabled: boolean;
  paypalOnboardingComplete: boolean;
};

export async function loadSetupProgress(owner: ProgressOwner): Promise<SetupProgress> {
  const [productCount, storefront, pro] = await Promise.all([
    prisma.product.count({ where: { stand: { ownerId: owner.id }, isArchived: false } }),
    prisma.storefront.findUnique({
      where: { ownerId: owner.id },
      select: { draftConfig: true, isPublished: true },
    }),
    ownerIdHasProAccess(owner.id),
  ]);
  const websiteStarted = Boolean(
    storefront && (storefront.isPublished || extractWebsiteStudio(storefront.draftConfig)?.nodes),
  );
  const payments =
    owner.stripeChargesEnabled || owner.paypalOnboardingComplete || (await ownerSquareReady(owner));
  return { products: productCount > 0, website: websiteStarted, payments, pro };
}
