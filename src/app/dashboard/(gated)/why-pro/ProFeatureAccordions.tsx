"use client";

import type { ProBenefitGroup } from "./pro-benefits";
import { trackProUpgrade } from "@/lib/pro-upgrade-track";

/** Every Pro feature, grouped; coming-soon items are labelled as not yet available. */
export default function ProFeatureAccordions({ groups }: { groups: ProBenefitGroup[] }) {
  return (
    <section aria-label="All Pro features" className="dash-card divide-y divide-[var(--line)]">
      {groups.map((group) => {
        const soon = group.id === "soon";
        return (
          <details
            key={group.id}
            className="group"
            onToggle={(e) => {
              if (e.currentTarget.open) trackProUpgrade("pro_upgrade_feature_expand", { group: group.id });
            }}
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-semibold text-[var(--field)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--leaf)]">
              <span>
                {group.heading}{" "}
                <span className="text-sm font-normal text-[var(--muted)]">({group.items.length})</span>
              </span>
              <span aria-hidden className="transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>
            {soon ? (
              <p className="px-5 text-sm text-[var(--muted)]">
                Not yet available on your account and not part of what Pro includes today.
              </p>
            ) : null}
            <ul className="grid gap-3 px-5 pb-5 pt-3 sm:grid-cols-2">
              {group.items.map((b) => (
                <li key={b.title} className="rounded-xl border border-[var(--line)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-[var(--field)]">{b.title}</h3>
                    <span className="whitespace-nowrap rounded-full border border-[var(--line)] px-2 py-0.5 text-xs font-bold text-[var(--muted)]">
                      {soon ? "SOON" : "PRO"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{b.body}</p>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </section>
  );
}
