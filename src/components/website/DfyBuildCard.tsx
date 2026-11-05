import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { DFY_BUILD_PATH, DFY_BUILD_SUMMARY, dfyBuildCurrency, formatDfyBuildPrice } from "@/lib/website/dfy-build";

/** Dashboard teaser for the paid done-for-you website build, shown to Free and Pro owners. */
export default function DfyBuildCard({ currency }: { currency: string | null | undefined }) {
  const price = formatDfyBuildPrice(dfyBuildCurrency(currency));
  return (
    <section className="dash-card flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Done for you</p>
        <span className="rounded-full bg-[var(--leaf)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--field)]">
          FREE &amp; PRO
        </span>
      </div>
      <h2 className="font-semibold text-[var(--field)]">Want us to build your website?</h2>
      <p className="text-sm text-[var(--muted)]">
        {DFY_BUILD_SUMMARY} One-off {price}.
      </p>
      <Link href={DFY_BUILD_PATH} className={`${dashCtaClass} self-start`}>
        Book a Done-For-You Build
      </Link>
    </section>
  );
}
