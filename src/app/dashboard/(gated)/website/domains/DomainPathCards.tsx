import Link from "next/link";
import { dashCtaClass } from "@/components/DashPrimaryCta";

/** Side-by-side path pickers for Buy (coming soon) vs Connect. */
export default function DomainPathCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="dash-card flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            New domain
          </p>
          <span className="rounded-full bg-[var(--line)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Coming soon
          </span>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Soon you&apos;ll be able to buy .com.au, .com and .net.au domains right here.
          For now, buy one from any domain registrar and connect it — Australian, US
          and other domains from around the world all work. It only takes a few
          minutes.
        </p>
        <span
          aria-disabled="true"
          className={`${dashCtaClass} mt-auto self-start cursor-not-allowed opacity-50`}
        >
          Purchase A Domain Name
        </span>
      </section>

      <section className="dash-card flex flex-col gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Existing domain
        </p>
        <p className="text-sm text-[var(--muted)]">
          Already own a domain, or just bought one? Connect it and we&apos;ll walk you
          through the rest.
        </p>
        <Link
          href="/dashboard/website/domains?path=connect"
          className={`${dashCtaClass} mt-auto self-start`}
        >
          Connect An Existing Domain
        </Link>
      </section>
    </div>
  );
}
