import { Fragment } from "react";
import type { ProBenefitGroup } from "./pro-benefits";

export default function ProComparisonTable({ groups }: { groups: ProBenefitGroup[] }) {
  return (
    <div className="dash-card overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <caption className="sr-only">Free and Pro plan comparison</caption>
        <thead>
          <tr className="border-b border-[var(--line)] bg-[var(--wash)]/60 text-xs font-semibold text-[var(--muted)]">
            <th scope="col" className="px-4 py-2.5 text-left">Feature</th>
            <th scope="col" className="px-3 py-2.5 text-left">Free</th>
            <th scope="col" className="px-4 py-2.5 text-left text-[var(--field)]">Pro</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[var(--line)]">
            <th scope="row" className="px-4 py-2.5 text-left font-medium">Everything on Free</th>
            <td className="px-3 py-2.5 text-[var(--muted)]">Included</td>
            <td className="px-4 py-2.5 font-semibold text-[var(--leaf-dark)]">Included</td>
          </tr>
          {groups.map((group) => (
            <Fragment key={group.id}>
              <tr className="border-b border-[var(--line)] bg-[var(--wash)]/30">
                <th scope="colgroup" colSpan={3} className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                  {group.heading}
                </th>
              </tr>
              {group.items.map((b) => (
                <tr key={b.title} className="border-b border-[var(--line)] last:border-0">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium">{b.title}</th>
                  <td className="px-3 py-2.5 text-[var(--muted)]">{group.id === "soon" ? "Coming soon" : b.free}</td>
                  <td className="px-4 py-2.5 font-semibold text-[var(--leaf-dark)]">
                    {group.id === "soon" ? "Coming soon" : b.pro}
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
