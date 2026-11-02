import { PRO_BENEFITS } from "./pro-benefits";

export default function ProComparisonTable() {
  return (
    <div className="dash-card overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[var(--wash)]/60 text-xs font-semibold text-[var(--muted)]">
            <th className="px-4 py-2.5 text-left">Feature</th>
            <th className="px-3 py-2.5 text-left">Free</th>
            <th className="px-4 py-2.5 text-left text-[var(--field)]">Pro</th>
          </tr>
        </thead>
        <tbody>
          {PRO_BENEFITS.map((b) => (
            <tr key={b.title} className="border-b border-[var(--line)] last:border-0">
              <td className="px-4 py-2.5 font-medium">{b.title}</td>
              <td className="px-3 py-2.5 text-[var(--muted)]">{b.free}</td>
              <td className="px-4 py-2.5 font-semibold text-[var(--leaf-dark)]">{b.pro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
