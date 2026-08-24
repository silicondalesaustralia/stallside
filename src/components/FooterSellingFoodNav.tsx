import Link from "next/link";
import {
  US_HUB_PATH,
  isPageRenderable,
  jurisdictionPathFor,
  loadAllAuJurisdictionRecords,
} from "@/lib/jurisdictions";

const linkClass =
  "text-sm text-[var(--ink-on-dark)]/75 transition hover:text-[var(--ink-on-dark)]";

/** Compact AU + USA guide links for the footer Guides column. */
export default function FooterSellingFoodNav() {
  const au = loadAllAuJurisdictionRecords()
    .filter(isPageRenderable)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-wide text-[var(--ink-on-dark)]/55 uppercase">
          Australia
        </p>
        <ul className="mt-2 space-y-1.5">
          {au.map((r) => (
            <li key={r.code}>
              <Link href={jurisdictionPathFor(r)} className={linkClass}>
                {r.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold tracking-wide text-[var(--ink-on-dark)]/55 uppercase">
          USA
        </p>
        <ul className="mt-2 space-y-1.5">
          <li>
            <Link href={US_HUB_PATH} className={linkClass}>
              Cottage food laws
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
