import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { WHY_PRO_PATH } from "@/components/dash-nav-links";

export default function ProUpgradeCard({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="dash-card flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{eyebrow}</p>
        <span className="rounded-full bg-[var(--marigold)]/25 px-2 py-0.5 text-[10px] font-bold text-[var(--field)]">
          PRO
        </span>
      </div>
      <p className="text-sm text-[var(--muted)]">{children}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/dashboard/settings/billing" className={dashCtaClass}>
          Upgrade to Pro
        </Link>
        <Link href={WHY_PRO_PATH} className="text-sm font-semibold text-[var(--field)] underline">
          See everything in Pro
        </Link>
      </div>
    </section>
  );
}
