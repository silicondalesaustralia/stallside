import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";

export default function TagsProUpgradeCard() {
  return (
    <section className="dash-card flex flex-col gap-3 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Tags, pixels and conversion tracking
      </p>
      <p className="text-sm text-[var(--muted)]">
        Add Google Analytics, Search Console, Google Ads, Meta, TikTok, Pinterest and more to your website, with
        server-side conversions, a cookie banner and an automatic privacy notice. Included with Vendl Pro.
      </p>
      <Link href="/dashboard/settings/billing" className={dashCtaClass}>
        Upgrade to Pro
      </Link>
    </section>
  );
}
