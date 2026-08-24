import Link from "next/link";
import {
  US_HUB_PATH,
  isPageRenderable,
  jurisdictionPathFor,
  loadAllAuJurisdictionRecords,
} from "@/lib/jurisdictions";

const linkClass = "hover:text-[var(--ink-on-dark)]";
const summaryClass =
  "cursor-pointer list-none font-medium text-[var(--ink-on-dark)]/90 marker:content-none [&::-webkit-details-marker]:hidden";

/** Footer: Selling Food In Your Region → each AU state + USA hub. */
export default function FooterSellingFoodNav() {
  const au = loadAllAuJurisdictionRecords()
    .filter(isPageRenderable)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((r) => ({ href: jurisdictionPathFor(r), name: r.name }));

  return (
    <details className="group relative">
      <summary className={`${summaryClass} inline-flex items-center gap-1`}>
        Selling Food In Your Region
        <span
          aria-hidden
          className="text-[var(--ink-on-dark)]/50 transition group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-2 space-y-3 border-l border-[var(--ink-on-dark)]/20 pl-3 text-[var(--ink-on-dark)]/75">
        <details className="group/au">
          <summary className={summaryClass}>
            <span className="inline-flex items-center gap-1">
              Australia
              <span
                aria-hidden
                className="text-[var(--ink-on-dark)]/50 transition group-open/au:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <ul className="mt-2 space-y-1.5 border-l border-[var(--ink-on-dark)]/20 pl-3 text-[var(--ink-on-dark)]/70">
            {au.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>
        <details className="group/us">
          <summary className={summaryClass}>
            <span className="inline-flex items-center gap-1">
              USA
              <span
                aria-hidden
                className="text-[var(--ink-on-dark)]/50 transition group-open/us:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <ul className="mt-2 space-y-1.5 border-l border-[var(--ink-on-dark)]/20 pl-3 text-[var(--ink-on-dark)]/70">
            <li>
              <Link href={US_HUB_PATH} className={linkClass}>
                Cottage food laws
              </Link>
            </li>
          </ul>
        </details>
      </div>
    </details>
  );
}
