import type { ReactNode } from "react";
import { highlightBrandInHeadline } from "@/components/lp/highlightBrandInHeadline";
import LpHeroFeaturePoints, {
  DEFAULT_HERO_FEATURE_POINTS,
  type LpHeroFeaturePoint,
} from "@/components/lp/LpHeroFeaturePoints";
import LpHeroVisual from "@/components/lp/LpHeroVisual";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

const DEFAULTS = {
  eyebrow: "Built for unattended stalls",
  headline: "You Will Make More Sales At Your Farm Stand With Vendl",
  support:
    "Give your stall one QR code so customers can choose what they are taking and pay on their phone - even when nobody is there.",
  chips: ["A$0 monthly on Free", "No customer app", "Instant sale alerts"],
  ctaLabel: "Create my free stall",
  secondaryLabel: "See how it works ↓",
  secondaryHref: "#how-it-works",
} as const;

type Props = {
  eyebrow?: string;
  headline?: string;
  support?: string;
  chips?: string[];
  ctaLabel?: string;
  signupHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  visual?: ReactNode;
  featurePoints?: LpHeroFeaturePoint[] | null;
};

export default function LpHero({
  eyebrow = DEFAULTS.eyebrow,
  headline = DEFAULTS.headline,
  support = DEFAULTS.support,
  chips = [...DEFAULTS.chips],
  ctaLabel = DEFAULTS.ctaLabel,
  signupHref,
  secondaryLabel = DEFAULTS.secondaryLabel,
  secondaryHref = DEFAULTS.secondaryHref,
  visual,
  featurePoints,
}: Props) {
  const points = featurePoints ?? DEFAULT_HERO_FEATURE_POINTS;

  return (
    <section className="relative overflow-hidden bg-[var(--panel)] px-5 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_85%_20%,rgb(46_125_63_/_0.08),transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[48%_52%] lg:gap-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-[1.1] tracking-tight text-[var(--field)] sm:text-5xl lg:text-[clamp(3rem,5vw,4.5rem)]">
            {highlightBrandInHeadline(headline)}
          </h1>
          <LpHeroFeaturePoints points={points} />
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {support}
          </p>

          <div id="lp-hero-cta" className="mt-7 flex flex-col items-start gap-3">
            <LpStartFreeLink
              placement="hero"
              label={ctaLabel}
              href={signupHref}
            />
            <p className="text-sm text-[var(--muted)]">
              No card details · Setup takes minutes
            </p>
            <a
              href={secondaryHref}
              className="text-sm font-semibold text-[var(--leaf-dark)] underline-offset-2 hover:underline"
            >
              {secondaryLabel}
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li
                key={chip}
                className="rounded-[var(--radius-pill)] border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] shadow-sm sm:text-sm"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>

        {visual ?? <LpHeroVisual />}
      </div>
    </section>
  );
}
