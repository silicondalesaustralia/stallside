import Link from "next/link";
import LandingFooter from "@/components/LandingFooter";
import HomeHeader from "@/components/home/HomeHeader";
import {
  HOME_BUTTON,
  HOME_EYEBROW,
  HOME_H2,
  HOME_H3,
  HOME_PLAN_TAG,
  HOME_TEXT_LINK,
  HOME_WRAP,
} from "@/components/home/home-styles";
import { featuresGroupedForHub } from "@/lib/features";

export default function FeatureHub() {
  const groups = featuresGroupedForHub();

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[#faf9f5] text-[var(--field)]">
      <HomeHeader />
      <main>
        <section className={`${HOME_WRAP} py-14 md:py-20`}>
          <p className={HOME_EYEBROW}>PRODUCT FEATURES</p>
          <h1 className={HOME_H2}>Everything in Vendl, by job.</h1>
          <p className="mt-5 max-w-[520px] text-[var(--muted)]">
            Sell, get paid, run the books, grow customers and cost what you make — from one place.
          </p>
          <Link href="/signup" className={`${HOME_BUTTON} mt-8`}>
            Start free <span aria-hidden>↗</span>
          </Link>
        </section>

        {groups.map((group) => (
          <section
            key={group.heading}
            className={`${HOME_WRAP} border-t border-[var(--line)] py-12 md:py-16`}
          >
            <h2 className={`${HOME_H3} text-2xl md:text-3xl`}>{group.heading}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.features.map((feature) => (
                <Link
                  key={feature.slug}
                  href={`/features/${feature.slug}`}
                  className="rounded-lg border border-[var(--line)] bg-white p-5 transition hover:border-[var(--leaf)]"
                >
                  <span className={HOME_PLAN_TAG}>{feature.plan}</span>
                  <h3 className={`${HOME_H3} mt-3 text-xl`}>{feature.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{feature.menuBlurb}</p>
                  <span className={`${HOME_TEXT_LINK} mt-4 inline-block`}>Open →</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="bg-[#f1eddf] px-[22px] pb-14 pt-12 text-center md:pb-[85px] md:pt-16">
          <p className={HOME_EYEBROW}>COMPARE PLANS</p>
          <h2 className={`${HOME_H2} mb-8`}>See what is on Free and Pro.</h2>
          <Link href="/#pricing" className={HOME_BUTTON}>
            View pricing <span aria-hidden>↗</span>
          </Link>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
