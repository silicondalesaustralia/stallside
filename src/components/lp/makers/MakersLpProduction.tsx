import MakersLpCostingCalculator from "@/components/lp/makers/MakersLpCostingCalculator";
import { HOME_EYEBROW, HOME_H2, HOME_PLAN_TAG, HOME_SCREEN_CAPTION, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";

const TOPICS = ["Materials", "Batch costing", "Pricing"] as const;

export default function MakersLpProduction() {
  return (
    <section id="production" className="scroll-mt-6 bg-[#e8eddf] py-14 md:py-20">
      <div className={HOME_WRAP}>
        <div className="mb-8 grid gap-6 md:mb-10 md:grid-cols-[1fr_1fr] md:items-end md:gap-20">
          <div>
            <p className={HOME_EYEBROW}>MADE WITH CARE. PRICED WITH CONFIDENCE.</p>
            <span className={HOME_PLAN_TAG}>PRO</span>
            <h2 className={`${HOME_H2} mt-4 max-w-[340px] md:max-w-none`}>What does it really cost to make?</h2>
          </div>
          <div>
            <p className="text-base text-[var(--muted)]">
              Bring ingredients or parts, packaging, labour and overheads into one calculation. Cost your batches and set a
              price with your margin in mind. Try it below with two bakes and a handmade soap.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-[var(--field)]">
              {TOPICS.map((t) => (
                <span key={t} className="border-b border-[#9ca890] pb-1.5">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <MakersLpCostingCalculator />
        <span className={HOME_SCREEN_CAPTION}>
          Interactive example with sample figures. Change any quantity, pack price, labour or margin. It’s the same costing maths Vendl Pro uses for your recipes.
        </span>
      </div>
    </section>
  );
}
