import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";

export default function ProUpgradeCard({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="dash-card flex flex-col gap-3 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{eyebrow}</p>
      <p className="text-sm text-[var(--muted)]">{children}</p>
      <Link href="/dashboard/settings/billing" className={`${dashCtaClass} self-start`}>
        Upgrade to Pro
      </Link>
    </section>
  );
}
