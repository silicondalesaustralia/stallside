import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  affiliateEligibilitySelect,
  isAffiliateEligible,
} from "@/lib/affiliate/eligibility";
import { ensureReferralCode, referralUrl } from "@/lib/affiliate/referral-code";
import { loadAffiliateStats } from "@/lib/affiliate/load-affiliate-stats";
import ReferralHowItWorks from "./ReferralHowItWorks";
import ReferralUpgradeCard from "./ReferralUpgradeCard";
import ReferralLinkCard from "./ReferralLinkCard";
import ReferralStats from "./ReferralStats";
import ReferralList from "./ReferralList";

export default async function ReferralsPage() {
  const { owner: sessionOwner } = await requireOwner();
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: sessionOwner.id },
    select: {
      id: true,
      businessName: true,
      referralCode: true,
      ...affiliateEligibilitySelect,
    },
  });
  const eligible = isAffiliateEligible(owner);
  const code = eligible ? await ensureReferralCode(owner) : owner.referralCode;
  const stats = code ? await loadAffiliateStats(owner.id) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Referrals
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Share Vendl and earn 50% of every Pro subscription you refer, for as
          long as they stay on Pro.
        </p>
      </div>
      {eligible && code ? (
        <ReferralLinkCard url={referralUrl(code)} />
      ) : (
        <ReferralUpgradeCard hadLink={Boolean(code)} />
      )}
      {stats ? (
        <>
          <ReferralStats stats={stats} />
          <ReferralList referrals={stats.referrals} />
        </>
      ) : null}
      <ReferralHowItWorks />
    </div>
  );
}
