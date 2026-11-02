import { PRO_BENEFITS } from "./pro-benefits";

export default function ProBenefitCards() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {PRO_BENEFITS.map((b) => (
        <li key={b.title} className="dash-card flex flex-col gap-2 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-[var(--field)]">{b.title}</h2>
            <span className="whitespace-nowrap rounded-full bg-[var(--marigold)]/25 px-2 py-0.5 text-xs font-bold text-[var(--field)]">
              PRO
            </span>
          </div>
          <p className="text-sm text-[var(--muted)]">{b.body}</p>
        </li>
      ))}
    </ul>
  );
}
