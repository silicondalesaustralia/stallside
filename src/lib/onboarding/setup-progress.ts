import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import { prisma } from "@/lib/prisma";
import { extractWebsiteStudio } from "@/lib/studio/storage";
import { ownerSquareReady } from "@/lib/square/owner-ready";

export type SetupProgress = {
  products: boolean;
  website: boolean;
  payments: boolean;
  /** Website building is Pro-only, so Free setup can finish without it. */
  pro: boolean;
};

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

export function setupComplete(progress: SetupProgress): boolean {
  return progress.products && (progress.website || !progress.pro) && progress.payments;
}
