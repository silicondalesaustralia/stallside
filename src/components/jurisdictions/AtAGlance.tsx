import type { JurisdictionRecord } from "@/lib/jurisdictions/types";
import {
  approvedListValue,
  feeValue,
  gateLabel,
  licenceValue,
  multiplePremisesValue,
  salesCapValue,
  whenValue,
  whoYouNotify,
} from "@/components/jurisdictions/at-a-glance-values";

/** SA yardstick rows from content/jurisdictions/au/sa/page.md. */
export default function AtAGlance({ record }: { record: JurisdictionRecord }) {
  const rows: [string, string][] = [
    ["Gate", gateLabel(record)],
    ["Who you notify", whoYouNotify(record)],
    ["Notification fee", feeValue(record)],
    ["When", whenValue(record)],
    ["General food-business licence", licenceValue(record)],
    ["Sales cap", salesCapValue(record)],
    ["Approved food list", approvedListValue(record)],
    ["Multiple premises", multiplePremisesValue(record)],
  ];

  return (
    <section className="mt-8">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        At a glance
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm sm:text-base">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-t border-[var(--line)]">
                <th
                  scope="row"
                  className="w-[40%] py-3 pr-4 align-top font-semibold text-[var(--field)]"
                >
                  {label}
                </th>
                <td className="py-3 align-top text-[var(--field)] leading-relaxed">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
