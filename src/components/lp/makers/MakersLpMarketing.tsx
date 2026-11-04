import Link from "next/link";
import MakersLpEmailShot from "@/components/lp/makers/MakersLpEmailShot";
import MakersLpMarketingTools from "@/components/lp/makers/MakersLpMarketingTools";
import MakersLpSocialCreateShot from "@/components/lp/makers/MakersLpSocialCreateShot";
import MakersLpSocialPostShot from "@/components/lp/makers/MakersLpSocialPostShot";
import { HOME_BUTTON, HOME_EYEBROW, HOME_H2, HOME_PLAN_TAG, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { homeMarketingPoints } from "@/lib/makers-lp-marketing-copy";

export default function MakersLpMarketing({ showSocial }: { showSocial: boolean }) {
  return (
    <section id="marketing" className={`${HOME_WRAP} scroll-mt-6 py-16 md:py-[100px]`}>
      <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
        <div>
          <p className={HOME_EYEBROW}>MARKETING</p>
          <span className={HOME_PLAN_TAG}>FREE &amp; PRO</span>
          <h2 className={`${HOME_H2} mb-6 mt-4`}>
            {showSocial ? "One product." : "Bring them back."}
            <br />
            {showSocial ? "A post, a clip and an email." : "Email that sells."}
          </h2>
          <p className="mb-6 text-base text-[var(--muted)]">
            {showSocial
              ? "Pick a product and Vendl helps you turn it into a social post, a short video or a customer email, without leaving your dashboard."
              : "Email your customers from the same place you run your business, using what they’ve actually bought."}
          </p>
          <ul className="mb-6 space-y-3.5 text-sm text-[var(--field)]">
            {homeMarketingPoints(showSocial).map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <Icon aria-hidden className="mt-0.5 size-[18px] shrink-0 text-[var(--leaf)]" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <p className="mb-8 text-xs text-[var(--muted)]">
            Email is included on Free and Pro.
            {showSocial ? " Social uses credits: Pro includes 5 designs and 5 video clips a month, and anyone can buy packs." : null}
          </p>
          <Link href="/signup" className={HOME_BUTTON}>
            Start free <span aria-hidden>↗</span>
          </Link>
        </div>
        <div className="relative min-w-0 sm:pb-10">
          {showSocial ? <MakersLpSocialCreateShot /> : <MakersLpEmailShot />}
          {showSocial ? <MakersLpSocialPostShot /> : null}
        </div>
      </div>
      {showSocial ? <MakersLpMarketingTools /> : null}
    </section>
  );
}
