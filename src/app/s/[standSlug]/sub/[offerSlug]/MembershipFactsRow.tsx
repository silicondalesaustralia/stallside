import type { MembershipFact } from "@/lib/membership-offer-display";

export default function MembershipFactsRow({
  facts,
}: {
  facts: MembershipFact[];
}) {
  if (facts.length === 0) return null;

  return (
    <div className="membership-facts grid grid-cols-3 border-y border-[var(--m-divider)]">
      {facts.map((fact, i) => (
        <div
          key={`${fact.main}-${i}`}
          className={`px-2 py-3 text-center ${
            i > 0 ? "border-l border-[var(--m-divider)]" : ""
          }`}
        >
          <p className="text-[21px] font-semibold leading-tight text-[var(--m-ink)]">
            {fact.main}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-[var(--m-muted)]">
            {fact.label}
          </p>
        </div>
      ))}
    </div>
  );
}
