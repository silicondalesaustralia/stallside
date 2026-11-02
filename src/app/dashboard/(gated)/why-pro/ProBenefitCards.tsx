import { PRO_BENEFIT_GROUPS } from "./pro-benefits";

export default function ProBenefitCards() {
  return (
    <div className="flex flex-col gap-6">
      {PRO_BENEFIT_GROUPS.map((group) => (
        <section key={group.heading} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{group.heading}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {group.items.map((b) => (
              <li key={b.title} className="dash-card flex flex-col gap-2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-[var(--field)]">{b.title}</h3>
                  <span className="whitespace-nowrap rounded-full bg-[var(--marigold)]/25 px-2 py-0.5 text-xs font-bold text-[var(--field)]">
                    PRO
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)]">{b.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
