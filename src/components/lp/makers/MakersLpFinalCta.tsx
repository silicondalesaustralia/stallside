import MakersLpSignupLink from "@/components/lp/makers/MakersLpSignupLink";
import { HOME_BUTTON, HOME_EYEBROW, HOME_HEADING_FONT } from "@/components/lp/makers/makers-lp-styles";

export default function MakersLpFinalCta() {
  return (
    <section className="bg-[#f1eddf] px-[22px] pb-14 pt-12 text-center md:pb-[85px] md:pt-16">
      <p className={HOME_EYEBROW}>BUILT FOR PEOPLE WHO MAKE THINGS</p>
      <h2 className={`${HOME_HEADING_FONT} mx-auto mb-6 max-w-[760px] text-[40px] leading-[1.08] text-[var(--field)] md:text-[56px]`}>
        Spend More Time Making. Less Time Managing.
      </h2>
      <p className="mx-auto mb-8 max-w-[620px] text-base text-[var(--muted)]">
        Bring your products, stock, orders and online selling together with Vendl. Start free, then unlock production
        costing, advanced marketing and more with Pro when you&apos;re ready.
      </p>
      <MakersLpSignupLink placement="final" className={HOME_BUTTON}>
        Start free <span aria-hidden>↗</span>
      </MakersLpSignupLink>
      <p className="mt-4 text-sm text-[var(--muted)]">Free plan available · Upgrade when you&apos;re ready · Cancel Pro anytime</p>
    </section>
  );
}
