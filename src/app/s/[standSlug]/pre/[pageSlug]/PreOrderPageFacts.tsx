import type { PreorderDetailFact } from "@/lib/preorder-detail-copy";

export default function PreOrderPageFacts({
  facts,
}: {
  facts: PreorderDetailFact[];
}) {
  if (facts.length === 0) return null;
  return (
    <div
      className={`grid border-y border-[var(--line)] ${
        facts.length === 1
          ? "grid-cols-1"
          : facts.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-3"
      }`}
    >
      {facts.map((fact, i) => (
        <div
          key={`${fact.label}-${i}`}
          className={`px-3 py-3 ${
            i > 0 ? "border-t border-[var(--line)] sm:border-l sm:border-t-0" : ""
          }`}
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
            {fact.label}
          </p>
          <p className="mt-1 text-[15px] font-semibold leading-snug">
            {fact.value}
          </p>
        </div>
      ))}
    </div>
  );
}
