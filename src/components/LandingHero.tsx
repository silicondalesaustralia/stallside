import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import HeroCheckoutDemo from "@/components/HeroCheckoutDemo";
import {
  LandingHeroIconChip,
  type LandingHeroIconName,
} from "@/components/LandingHeroIconChip";
import LpHeroFeaturePoints, {
  DEFAULT_HERO_FEATURE_POINTS,
} from "@/components/lp/LpHeroFeaturePoints";
import MarketingNavLinks from "@/components/MarketingNavLinks";
import OwnerAuthLink from "@/components/OwnerAuthLink";
import StartFreeNavLink from "@/components/StartFreeNavLink";
import {
  APP_NAME,
  APP_HERO_SUPPORT,
  APP_POSITIONING,
  APP_TAGLINE,
} from "@/lib/constants";

const WORDMARK = APP_NAME.toLowerCase();

const FOR_AUDIENCE: { label: string; icon: LandingHeroIconName }[] = [
  { label: "Farm stands", icon: "farm" },
  { label: "Bakers", icon: "baker" },
  { label: "Produce sellers", icon: "produce" },
  {
    label:
      "Anyone who needs easy unattended payments, pre-orders or subscriptions",
    icon: "anyone",
  },
];

const PAYMENT_POINTS: { label: string; icon: LandingHeroIconName }[] = [
  { label: "Cash and card", icon: "cashCard" },
  { label: "Every payment method in your region", icon: "payments" },
];

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--field)] text-[var(--ink-on-dark)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 15% 20%, rgb(46 125 63 / 0.45) 0%, transparent 55%),
            radial-gradient(ellipse 50% 45% at 88% 75%, rgb(46 125 63 / 0.22) 0%, transparent 50%),
            linear-gradient(165deg, #1f4a2a 0%, var(--field) 48%, #0f2416 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath d='M0 0h8v8H0zm28 28h8v8h-8z' fill='%23EAF2E6'/%3E%3C/svg%3E")`,
          backgroundSize: "64px 64px",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <BrandLockup variant="dark" size="sm" />
          <MarketingNavLinks variant="dark" />
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <StartFreeNavLink variant="hero" />
          <Link
            href="/demo"
            className="hidden rounded-[var(--radius-pill)] border border-[var(--ink-on-dark)]/30 bg-white/5 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap backdrop-blur-sm transition duration-150 hover:bg-white/10 sm:inline-flex sm:px-4 sm:py-2 sm:text-sm"
          >
            Demo
          </Link>
          <OwnerAuthLink variant="hero" />
        </div>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 px-5 pb-8 pt-2 sm:px-6 sm:pb-10 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)] xl:items-center xl:gap-6 xl:pb-8">
        <div
          aria-hidden
          className="hero-bracket pointer-events-none absolute left-5 top-0 size-12 border-l-[3px] border-t-[3px] border-[var(--ink-on-dark)]/40 sm:left-6 sm:size-16"
          style={{ borderTopLeftRadius: 10 }}
        />

        <div className="relative min-w-0">
          <h1
            className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,11vw,5.25rem)] font-bold leading-[0.9] tracking-[-0.035em] lowercase xl:text-[clamp(2.75rem,4.2vw,3.85rem)]"
            aria-label={WORDMARK}
          >
            {WORDMARK.split("").map((letter, i) => (
              <span
                key={`${letter}-${i}`}
                className="hero-letter"
                style={{ animationDelay: `${i * 28}ms` }}
              >
                {letter}
              </span>
            ))}
          </h1>
          <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--ink-on-dark)] sm:mt-4 sm:text-2xl xl:mt-3 xl:text-xl">
            {APP_TAGLINE}
          </p>
          <p className="mt-3 max-w-xl text-base leading-snug text-[var(--ink-on-dark)]/75 xl:mt-2 xl:text-sm">
            {APP_POSITIONING}
          </p>
          <p className="mt-2 max-w-xl text-base leading-snug text-[var(--ink-on-dark)]/75 xl:text-sm">
            {APP_HERO_SUPPORT}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-snug text-[var(--ink-on-dark)]/60 sm:text-base xl:text-sm">
            Fewer missed sales. Bigger baskets. Recurring revenue.
          </p>
          <div className="mt-4 max-w-xl xl:mt-3">
            <p className="text-sm font-semibold text-[var(--ink-on-dark)]/80">
              For:
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2.5 text-sm leading-snug text-[var(--ink-on-dark)]/75">
              {FOR_AUDIENCE.map((item) => (
                <LandingHeroIconChip
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </ul>
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2.5 text-sm font-medium text-[var(--ink-on-dark)] xl:mt-3">
            {PAYMENT_POINTS.map((item) => (
              <LandingHeroIconChip
                key={item.label}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-3 xl:mt-4">
            <Link
              href="/signup"
              className="inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--leaf-dark)]"
            >
              Get Free Account
            </Link>
            <Link
              href="#pricing"
              className="inline-flex rounded-[var(--radius-pill)] border border-[var(--ink-on-dark)]/35 px-6 py-3 text-sm font-semibold text-[var(--ink-on-dark)] transition hover:bg-white/5"
            >
              See pricing
            </Link>
          </div>
        </div>

        <div className="min-w-0">
          <HeroCheckoutDemo />
          <div className="mt-4 rounded-xl bg-[var(--panel)] p-1 shadow-sm">
            <LpHeroFeaturePoints points={DEFAULT_HERO_FEATURE_POINTS} />
          </div>
        </div>
      </div>
    </section>
  );
}
