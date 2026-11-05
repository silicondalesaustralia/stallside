import MakersLpSignupLink from "@/components/lp/makers/MakersLpSignupLink";
import { HOME_BUTTON_GOLD, HOME_BUTTON_OUTLINE, HOME_EYEBROW, HOME_H3, HOME_HEADING_FONT, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";

const LABEL = "mb-2 text-[11px] font-bold tracking-[0.15em]";

/** Compact Free/Pro choice between the Pro pitch and the full pricing cards; no prices here by design. */
export default function MakersLpDecision() {
  return (
    <section aria-labelledby="makers-lp-decision" className={`${HOME_WRAP} pt-14 md:pt-16`}>
      <div className="mb-7 max-w-[720px]">
        <p className={HOME_EYEBROW}>YOUR NEXT STEP WITH VENDL</p>
        <h2 id="makers-lp-decision" className={`${HOME_HEADING_FONT} text-[30px] leading-[1.1] text-[var(--field)] md:text-[38px]`}>
          Ready to Make More of What You Create?
        </h2>
        <p className="mt-4 text-base text-[var(--muted)]">
          Start selling with Vendl Free, or choose Pro for production costing, pricing and social marketing tools.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <article className="flex flex-col border border-[var(--line)] bg-white/60 p-6 md:p-7">
          <p className={`${LABEL} text-[var(--muted)]`}>VENDL FREE</p>
          <h3 className={`${HOME_H3} mb-2 text-[24px]`}>Start selling</h3>
          <p className="mb-6 text-[15px] text-[var(--muted)]">Your shop, products, stock and orders in one place.</p>
          <MakersLpSignupLink placement="decision-free" className={`${HOME_BUTTON_OUTLINE} mt-auto self-start`}>
            Start free <span aria-hidden>↗</span>
          </MakersLpSignupLink>
        </article>
        <article className="flex flex-col border border-[#b0bc9f] bg-[#edf0e6] p-6 md:p-7">
          <p className={`${LABEL} text-[var(--leaf-dark)]`}>VENDL PRO</p>
          <h3 className={`${HOME_H3} mb-2 text-[24px]`}>Make, price and promote</h3>
          <p className="mb-6 text-[15px] text-[var(--muted)]">Production costing, pricing and social marketing tools.</p>
          <a href="#pricing" className={`${HOME_BUTTON_GOLD} mt-auto self-start`}>
            See Pro pricing <span aria-hidden>↓</span>
          </a>
        </article>
      </div>
    </section>
  );
}
