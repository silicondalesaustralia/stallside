import { HOME_EYEBROW, HOME_H2, HOME_H3, HOME_PLAN_TAG, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { MAKERS_LP_CORE_BENEFITS } from "@/lib/makers-lp-benefits";

export default function MakersLpBenefits() {
  return (
    <section id="benefits" className="scroll-mt-6 border-y border-[var(--line)] bg-[#f3f1ea] py-14 md:py-20">
      <div className={HOME_WRAP}>
        <p className={HOME_EYEBROW}>WHY MAKERS CHOOSE VENDL</p>
        <h2 className={`${HOME_H2} mb-10 max-w-[720px]`}>Built for makers, not just online stores.</h2>
        <ul className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {MAKERS_LP_CORE_BENEFITS.map(({ title, body, icon: Icon, tag }) => (
            <li key={title} className="flex flex-col bg-[#faf9f5] p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <Icon aria-hidden className="size-6 text-[var(--leaf)]" />
                <span className={HOME_PLAN_TAG}>{tag}</span>
              </div>
              <h3 className={`${HOME_H3} mb-2 text-[21px]`}>{title}</h3>
              <p className="text-sm text-[var(--muted)]">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
