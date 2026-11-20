import Link from "next/link";
import FeatureBulletCards from "@/components/features/FeatureBulletCards";
import FeatureLogoStrip from "@/components/features/FeatureLogoStrip";
import FeatureVisual from "@/components/features/FeatureVisual";
import LandingFooter from "@/components/LandingFooter";
import HomeHeader from "@/components/home/HomeHeader";
import {
  HOME_BUTTON,
  HOME_BUTTON_OUTLINE,
  HOME_EYEBROW,
  HOME_H2,
  HOME_H3,
  HOME_PLAN_TAG,
  HOME_TEXT_LINK,
  HOME_WRAP,
} from "@/components/home/home-styles";
import { featureIcon } from "@/lib/features/icons";
import { getRelatedFeatures } from "@/lib/features";
import { featureLogoStrip } from "@/lib/features/visuals";
import type { FeaturePage } from "@/lib/features/types";

export default function FeaturePageView({ feature }: { feature: FeaturePage }) {
  const related = getRelatedFeatures(feature);
  const Icon = featureIcon(feature.slug);
  const logos = featureLogoStrip(feature.slug);

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[#faf9f5] text-[var(--field)]">
      <HomeHeader />
      <main>
        <section className={`${HOME_WRAP} grid items-center gap-10 py-12 md:grid-cols-2 md:gap-16 md:py-20`}>
          <div>
            <p className={HOME_EYEBROW}>{feature.eyebrow}</p>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-[var(--wash)] text-[var(--leaf)] ring-1 ring-[var(--line)]">
                <Icon aria-hidden className="size-6" strokeWidth={1.75} />
              </span>
              <span className={HOME_PLAN_TAG}>{feature.plan}</span>
            </div>
            <h1 className={HOME_H2}>{feature.headline}</h1>
            <p className="mt-5 max-w-[460px] text-[var(--muted)]">{feature.support}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className={HOME_BUTTON}>
                Start free <span aria-hidden>↗</span>
              </Link>
              <Link href="/#pricing" className={HOME_BUTTON_OUTLINE}>
                See pricing
              </Link>
            </div>
          </div>
          <FeatureVisual slug={feature.slug} />
        </section>

        <FeatureBulletCards slug={feature.slug} bullets={feature.bullets} />
        <FeatureLogoStrip kind={logos} />

        <section className={`${HOME_WRAP} grid gap-10 border-t border-[var(--line)] py-16 md:grid-cols-2 md:py-[88px]`}>
          <div>
            <p className={HOME_EYEBROW}>HOW IT WORKS</p>
            <h2 className={HOME_H2}>Three steps to start.</h2>
          </div>
          <ol>
            {feature.steps.map((step, index) => (
              <li key={step.title} className="flex gap-6 border-b border-[var(--line)] py-6 first:pt-0 last:border-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--field)] text-xs font-bold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className={`${HOME_H3} mb-2 text-2xl`}>{step.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {feature.table ? (
          <section className={`${HOME_WRAP} border-t border-[var(--line)] py-16 md:py-[88px]`}>
            <p className={HOME_EYEBROW}>AT A GLANCE</p>
            <h2 className={`${HOME_H2} mb-8`}>{feature.table.caption}</h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white shadow-[0_4px_16px_#17361f08]">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-[var(--line)] bg-[var(--panel)] text-[11px] font-bold tracking-[0.08em] uppercase">
                  <tr>
                    {feature.table.headers.filter(Boolean).map((header) => (
                      <th key={header} className="px-4 py-3">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {feature.table.rows.map((row) => (
                    <tr key={row.join("-")} className="border-b border-[var(--line)] last:border-0">
                      {row.filter((cell) => cell !== undefined).map((cell) => (
                        <td key={`${row[0]}-${cell}`} className="px-4 py-3 text-[var(--field)]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {feature.freeVsPro ? (
          <section className={`${HOME_WRAP} grid gap-6 border-t border-[var(--line)] py-16 md:grid-cols-2 md:py-[88px]`}>
            <div className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-[0_4px_16px_#17361f08]">
              <p className={HOME_PLAN_TAG}>FREE</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {feature.freeVsPro.free.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-[0_4px_16px_#17361f08]">
              <p className={HOME_PLAN_TAG}>PRO</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {feature.freeVsPro.pro.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className={`${HOME_WRAP} border-t border-[var(--line)] py-16 md:py-[88px]`}>
          <p className={HOME_EYEBROW}>QUESTIONS</p>
          <h2 className={`${HOME_H2} mb-8`}>A few things people ask.</h2>
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {feature.faqs.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="cursor-pointer list-none font-semibold text-[var(--field)]">{faq.q}</summary>
                <p className="mt-3 max-w-[640px] text-sm text-[var(--muted)]">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {related.length ? (
          <section className={`${HOME_WRAP} border-t border-[var(--line)] py-16 md:py-[88px]`}>
            <p className={HOME_EYEBROW}>RELATED</p>
            <h2 className={`${HOME_H2} mb-8`}>Keep exploring.</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => {
                const RelIcon = featureIcon(item.slug);
                return (
                  <Link
                    key={item.slug}
                    href={`/features/${item.slug}`}
                    className="rounded-xl border border-[var(--line)] bg-white p-5 shadow-[0_4px_16px_#17361f08] transition hover:border-[var(--leaf)]"
                  >
                    <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--wash)] text-[var(--leaf)]">
                      <RelIcon aria-hidden className="size-5" strokeWidth={1.75} />
                    </span>
                    <p className="mt-3 text-xs font-bold tracking-[0.12em] text-[var(--muted)]">{item.plan}</p>
                    <h3 className={`${HOME_H3} mt-1 text-xl`}>{item.title}</h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">{item.menuBlurb}</p>
                    <span className={`${HOME_TEXT_LINK} mt-4 inline-block`}>View feature →</span>
                  </Link>
                );
              })}
            </div>
            <p className="mt-8">
              <Link href="/features" className={HOME_TEXT_LINK}>
                All product features →
              </Link>
            </p>
          </section>
        ) : null}

        <section className="bg-[#f1eddf] px-[22px] pb-14 pt-12 text-center md:pb-[85px] md:pt-16">
          <p className={HOME_EYEBROW}>READY WHEN YOU ARE</p>
          <h2 className={`${HOME_H2} mb-8`}>Try {feature.title.toLowerCase()} on your products.</h2>
          <Link href="/signup" className={HOME_BUTTON}>
            Start free <span aria-hidden>↗</span>
          </Link>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
