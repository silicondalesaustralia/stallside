import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";

export default function ReferralUpgradeCard({ hadLink }: { hadLink: boolean }) {
  return (
    <section className="dash-card p-5">
      <h2 className="font-semibold text-[var(--field)]">
        You need to be on Pro to earn
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {hadLink
          ? "Your referral link is paused. Referrals stay linked to you, but commission on payments made while you're not on Pro is lost. Upgrade to start earning again."
          : "The referral program is for Pro members. Upgrade to get your personal link and earn 50% of every Pro subscription you refer."}
      </p>
      <Link href="/dashboard/settings/billing" className={`${dashCtaClass} mt-4`}>
        Upgrade to Pro
      </Link>
    </section>
  );
}
