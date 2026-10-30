import { prisma } from "@/lib/prisma";
import { affiliateEligibilitySelect, isAffiliateEligible } from "./eligibility";
import { ensureReferralCode, referralUrl } from "./referral-code";
import { loadAffiliateStats, type AffiliateStats } from "./load-affiliate-stats";

export type OwnerReferrals = {
  /** On Pro, so the link earns commission. */
  eligible: boolean;
  /** Had a link before (paused while not on Pro). */
  hadLink: boolean;
  /** Shareable link; null when not eligible. */
  url: string | null;
  stats: AffiliateStats | null;
};

/** The owner's referral link and stats; creates the code on first use while on Pro. */
export async function loadOwnerReferrals(ownerId: string): Promise<OwnerReferrals> {
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: ownerId },
    select: { id: true, businessName: true, referralCode: true, ...affiliateEligibilitySelect },
  });
  const eligible = isAffiliateEligible(owner);
  const code = eligible ? await ensureReferralCode(owner) : owner.referralCode;
  return {
    eligible,
    hadLink: Boolean(code),
    url: eligible && code ? referralUrl(code) : null,
    stats: code ? await loadAffiliateStats(owner.id) : null,
  };
}
