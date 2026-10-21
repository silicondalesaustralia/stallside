import { prisma } from "@/lib/prisma";
import { extractWebsiteStudio } from "@/lib/studio/storage";
import { ownerSquareReady } from "@/lib/square/owner-ready";

export type SetupProgress = {
  products: boolean;
  website: boolean;
  payments: boolean;
};

type ProgressOwner = {
  id: string;
  billingCurrency: string | null;
  stripeChargesEnabled: boolean;
  paypalOnboardingComplete: boolean;
};

export async function loadSetupProgress(owner: ProgressOwner): Promise<SetupProgress> {
  const [productCount, storefront] = await Promise.all([
    prisma.product.count({ where: { stand: { ownerId: owner.id }, isArchived: false } }),
    prisma.storefront.findUnique({
      where: { ownerId: owner.id },
      select: { draftConfig: true, isPublished: true },
    }),
  ]);
  const websiteStarted = Boolean(
    storefront && (storefront.isPublished || extractWebsiteStudio(storefront.draftConfig)?.nodes),
  );
  const payments =
    owner.stripeChargesEnabled || owner.paypalOnboardingComplete || (await ownerSquareReady(owner));
  return { products: productCount > 0, website: websiteStarted, payments };
}

export function setupComplete(progress: SetupProgress): boolean {
  return progress.products && progress.website && progress.payments;
}
