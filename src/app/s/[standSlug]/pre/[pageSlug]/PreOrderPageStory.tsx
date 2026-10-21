import PreOrderPageFacts from "./PreOrderPageFacts";
import type { PreorderDetailFact } from "@/lib/preorder-detail-copy";
import SectionCopy from "@/components/studio/SectionCopy";
import SectionElement from "@/components/studio/SectionElement";

export default function PreOrderPageStory({
  standName,
  title,
  intro,
  ordersOpen,
  facts,
  showEyebrow = true,
}: {
  standName: string;
  title: string;
  intro: string | null;
  ordersOpen: boolean;
  facts: PreorderDetailFact[];
  showEyebrow?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      <header>
        {showEyebrow ? (
          <SectionElement el="eyebrow" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-label)]">
            {ordersOpen ? (
              <SectionCopy k="eyebrowOpen" fallback="Pre-order" />
            ) : (
              <SectionCopy k="eyebrowClosed" fallback="Orders closed" />
            )}{" "}
            · {standName}
          </SectionElement>
        ) : null}
        <h1
          data-section-heading
          className="mt-2 font-[family-name:var(--font-display)] text-[28px] font-medium leading-[1.12] tracking-tight sm:text-[34px]"
        >
          <SectionElement el="title" as="span">
            {title}
          </SectionElement>
        </h1>
        {intro ? (
          <SectionElement el="intro" className="mt-3 text-[15px] leading-relaxed text-[var(--muted)] sm:text-base">
            {intro}
          </SectionElement>
        ) : null}
      </header>
      <PreOrderPageFacts facts={facts} />
    </div>
  );
}
