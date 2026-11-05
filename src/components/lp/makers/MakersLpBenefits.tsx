import { HOME_EYEBROW, HOME_HEADING_FONT, HOME_PLAN_TAG, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { MAKERS_LP_CORE_BENEFITS } from "@/lib/makers-lp-benefits";

export default function MakersLpBenefits() {
  return (
    <section id="benefits" className="scroll-mt-6 border-y border-[var(--line)] bg-[#f3f1ea] py-10 md:py-14">
      <div className={HOME_WRAP}>
        <p className={`${HOME_EYEBROW} mb-3`}>WHY MAKERS CHOOSE VENDL</p>
        <h2 className={`${HOME_HEADING_FONT} mb-7 text-[28px] leading-[1.1] text-[var(--field)] md:text-[36px]`}>
          Built for makers, not just online stores.
        </h2>
        <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {MAKERS_LP_CORE_BENEFITS.map(({ title, body, icon: Icon, tag }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e3e9d9]">
                <Icon aria-hidden className="size-[18px] text-[var(--leaf)]" />
              </span>
              <div>
                <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold text-[var(--field)]">
                  {title}
                  {tag === "PRO" ? <span className={HOME_PLAN_TAG}>PRO</span> : null}
                </h3>
                <p className="mt-0.5 text-[15px] leading-snug text-[var(--muted)]">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
