import Link from "next/link";
import {
  isPageRenderable,
  jurisdictionPathFor,
  loadAllAuJurisdictionRecords,
  loadAllUsJurisdictionRecords,
} from "@/lib/jurisdictions";

const linkClass = "hover:text-[var(--ink-on-dark)]";
const summaryClass =
  "cursor-pointer list-none font-medium text-[var(--ink-on-dark)]/90 marker:content-none [&::-webkit-details-marker]:hidden";

function RegionDetails({
  label,
  hubHref,
  items,
}: {
  label: string;
  hubHref: string;
  items: { href: string; name: string }[];
}) {
  return (
    <details className="group">
      <summary className={summaryClass}>
        <span className="inline-flex items-center gap-1">
          {label}
          <span
            aria-hidden
            className="text-[var(--ink-on-dark)]/50 transition group-open:rotate-45"
          >
            +
          </span>
        </span>
      </summary>
      <ul className="mt-2 space-y-1.5 border-l border-[var(--ink-on-dark)]/20 pl-3 text-[var(--ink-on-dark)]/70">
        <li>
          <Link href={hubHref} className={linkClass}>
            All {label} guides
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={linkClass}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Footer News cluster: news index + selling-food region dropdowns. */
export default function FooterNewsNav() {
  const au = loadAllAuJurisdictionRecords()
    .filter(isPageRenderable)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((r) => ({ href: jurisdictionPathFor(r), name: r.name }));
  const us = loadAllUsJurisdictionRecords()
    .filter(isPageRenderable)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((r) => ({ href: jurisdictionPathFor(r), name: r.name }));

  return (
    <details className="group relative">
      <summary className={`${summaryClass} inline-flex items-center gap-1`}>
        News
        <span
          aria-hidden
          className="text-[var(--ink-on-dark)]/50 transition group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-2 space-y-3 border-l border-[var(--ink-on-dark)]/20 pl-3 text-[var(--ink-on-dark)]/75">
        <Link href="/farms-stand-news" className={linkClass}>
          Farm Stand News
        </Link>
        <details className="group/region">
          <summary className={summaryClass}>
            <span className="inline-flex items-center gap-1">
              Selling Food In Your Region
              <span
                aria-hidden
                className="text-[var(--ink-on-dark)]/50 transition group-open/region:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <div className="mt-2 space-y-3 border-l border-[var(--ink-on-dark)]/20 pl-3">
            <RegionDetails
              label="Australia"
              hubHref="/sell-food-from-home"
              items={au}
            />
            <RegionDetails
              label="USA"
              hubHref="/cottage-food-laws"
              items={us}
            />
          </div>
        </details>
      </div>
    </details>
  );
}
