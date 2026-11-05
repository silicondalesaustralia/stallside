import MakersLpFeatureCard from "@/components/lp/makers/MakersLpFeatureCard";
import MakersLpPlanPrice from "@/components/lp/makers/MakersLpPlanPrice";
import { HOME_EYEBROW, HOME_H2, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { MAKERS_LP_FEATURES, MAKERS_LP_PLANS_FEATURE } from "@/lib/makers-lp-benefits";

export default function MakersLpFeatures() {
  return (
    <section id="features" className={`${HOME_WRAP} scroll-mt-6 py-16 md:py-[100px]`}>
      <div className="mb-10 grid gap-6 md:grid-cols-2 md:items-end md:gap-20">
        <div>
          <p className={HOME_EYEBROW}>FEATURES</p>
          <h2 className={HOME_H2}>What you can do with Vendl.</h2>
        </div>
        <p className="text-base text-[var(--muted)]">
          Start selling on Free. Pro adds the production, website and marketing tools for when you’re ready to grow.
        </p>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MAKERS_LP_FEATURES.map(({ title, body, icon, tag }) => (
          <MakersLpFeatureCard key={title} title={title} icon={icon} tag={tag}>
            {body}
          </MakersLpFeatureCard>
        ))}
        <MakersLpFeatureCard title={MAKERS_LP_PLANS_FEATURE.title} icon={MAKERS_LP_PLANS_FEATURE.icon} tag="FREE & PRO">
          Get started for <MakersLpPlanPrice plan="free" /> per month, then upgrade to Pro for{" "}
          <MakersLpPlanPrice plan="pro" /> per month when you need additional tools and no Vendl transaction fee.
          Payment-provider fees still apply.
        </MakersLpFeatureCard>
      </ul>
    </section>
  );
}
