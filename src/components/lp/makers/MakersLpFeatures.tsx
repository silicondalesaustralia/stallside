import type { ReactNode } from "react";
import MakersLpFeatureCard from "@/components/lp/makers/MakersLpFeatureCard";
import MakersLpPlanPrice from "@/components/lp/makers/MakersLpPlanPrice";
import { HOME_EYEBROW, HOME_H2, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import {
  MAKERS_LP_FEATURE_GROUPS,
  MAKERS_LP_FEATURES,
  MAKERS_LP_PLANS_FEATURE,
  type MakersLpFeatureGroupId,
} from "@/lib/makers-lp-benefits";

const GRID: Record<MakersLpFeatureGroupId, string> = {
  selling: "sm:grid-cols-2 lg:grid-cols-4",
  tools: "sm:grid-cols-2",
  growth: "sm:grid-cols-2 lg:grid-cols-3",
};

const SPAN: Record<MakersLpFeatureGroupId, string> = {
  selling: "lg:col-span-5",
  tools: "lg:col-span-2",
  growth: "lg:col-span-3",
};

function groupCards(id: MakersLpFeatureGroupId): ReactNode[] {
  const cards: ReactNode[] = MAKERS_LP_FEATURES.filter((f) => f.group === id).map(({ title, body, icon, tag }) => (
    <MakersLpFeatureCard key={title} title={title} icon={icon} tag={tag}>
      {body}
    </MakersLpFeatureCard>
  ));
  if (id === "growth") {
    cards.push(
      <MakersLpFeatureCard key="plans" title={MAKERS_LP_PLANS_FEATURE.title} icon={MAKERS_LP_PLANS_FEATURE.icon} tag="FREE & PRO">
        Get started for <MakersLpPlanPrice plan="free" /> per month, then upgrade to Pro for{" "}
        <MakersLpPlanPrice plan="pro" /> per month when you need additional tools and no Vendl transaction fee.
        Payment-provider fees still apply.
      </MakersLpFeatureCard>,
    );
  }
  return cards;
}

/** Desktop: everyday selling across the top; business tools and growth share the second row. */
export default function MakersLpFeatures() {
  return (
    <section id="features" className={`${HOME_WRAP} scroll-mt-6 py-14 md:py-20`}>
      <div className="mb-8 grid gap-4 md:grid-cols-2 md:items-end md:gap-20">
        <div>
          <p className={HOME_EYEBROW}>FEATURES</p>
          <h2 className={HOME_H2}>What you can do with Vendl.</h2>
        </div>
        <p className="text-base text-[var(--muted)]">
          Start selling on Free. Pro adds the production, website and marketing tools for when you’re ready to grow.
        </p>
      </div>
      <div className="grid gap-x-5 gap-y-8 lg:grid-cols-5">
        {MAKERS_LP_FEATURE_GROUPS.map(({ id, label }) => (
          <div key={id} className={SPAN[id]}>
            <h3 className="mb-3 border-b border-[var(--line)] pb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--field)]">
              {label}
            </h3>
            <ul className={`grid gap-4 ${GRID[id]}`}>{groupCards(id)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}
