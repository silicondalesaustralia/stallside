import { formatProMoney } from "./why-pro-copy";

const ROWS = [
  { label: "Ingredients & materials", detail: "Flour, butter, sugar, chocolate", cents: 420 },
  { label: "Packaging", detail: "Box, label, ribbon", cents: 80 },
  { label: "Other production costs", detail: "Power, baking paper", cents: 100 },
] as const;

const TOTAL = ROWS.reduce((sum, row) => sum + row.cents, 0);

/** Illustrative costing worksheet (example amounts, not account data). */
export default function ProDemoCosting({ currency }: { currency: string }) {
  return (
    <article aria-labelledby="demo-costing" className="dash-card flex flex-col gap-4 p-5">
      <div>
        <h3 id="demo-costing" className="text-lg font-semibold text-[var(--field)]">
          Know what your products really cost
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Track materials, packaging and recipe costs, then use those numbers to inform your selling price.
        </p>
      </div>
      <figure className="rounded-xl border border-[var(--line)] bg-white">
        <figcaption className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5 text-sm">
          <span className="font-semibold text-[var(--field)]">Choc chip cookies · box of 6</span>
          <span className="text-xs text-[var(--muted)]">Example</span>
        </figcaption>
        <table className="w-full text-sm">
          <caption className="sr-only">Example production cost for one box of cookies</caption>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-[var(--line)]">
                <th scope="row" className="px-4 py-2.5 text-left font-medium">
                  {row.label}
                  <span className="block text-xs font-normal text-[var(--muted)]">{row.detail}</span>
                </th>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatProMoney(row.cents, currency)}</td>
              </tr>
            ))}
            <tr className="bg-[var(--wash)]/60">
              <th scope="row" className="px-4 py-2.5 text-left font-semibold text-[var(--field)]">
                Cost to make
              </th>
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[var(--field)]">
                {formatProMoney(TOTAL, currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </figure>
      <p className="text-sm text-[var(--muted)]">
        Better visibility into what goes into making each product, so pricing decisions aren&apos;t based on guesswork
        alone. Amounts shown are examples.
      </p>
    </article>
  );
}
