import { requireOwner } from "@/lib/session";
import { loadOwnerReferrals } from "@/lib/affiliate/load-owner-referrals";
import ReferralHowItWorks from "./ReferralHowItWorks";
import ReferralUpgradeCard from "./ReferralUpgradeCard";
import ReferralLinkCard from "./ReferralLinkCard";
import ReferralStats from "./ReferralStats";
import ReferralList from "./ReferralList";

export default async function ReferralsPage() {
  const { owner } = await requireOwner();
  const { url, hadLink, stats } = await loadOwnerReferrals(owner.id);

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
      {url ? (
        <ReferralLinkCard url={url} />
      ) : (
        <ReferralUpgradeCard hadLink={hadLink} />
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
