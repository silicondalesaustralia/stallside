import PreOrderPageFacts from "./PreOrderPageFacts";
import type { PreorderDetailFact } from "@/lib/preorder-detail-copy";

export default function PreOrderPageStory({
  standName,
  title,
  intro,
  ordersOpen,
  facts,
}: {
  standName: string;
  title: string;
  intro: string | null;
  ordersOpen: boolean;
  facts: PreorderDetailFact[];
}) {
  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-label)]">
          {ordersOpen ? "Pre-order" : "Orders closed"} · {standName}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[28px] font-medium leading-[1.12] tracking-tight sm:text-[34px]">
          {title}
        </h1>
        {intro ? (
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)] sm:text-base">
            {intro}
          </p>
        ) : null}
      </header>
      <PreOrderPageFacts facts={facts} />
    </div>
  );
}
