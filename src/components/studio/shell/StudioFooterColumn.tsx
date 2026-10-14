import Link from "next/link";
import type { FooterMobileLayout } from "@/lib/studio/footer-settings";
import type { ResolvedFooterColumn } from "@/lib/studio/footer-columns";
import StudioFooterContact from "./StudioFooterContact";

const HEADING = "text-xs font-bold uppercase tracking-wide opacity-60";

function ColumnBody({ col }: { col: ResolvedFooterColumn }) {
  return (
    <>
      {col.contact ? <StudioFooterContact contact={col.contact} /> : null}
      {col.links.length ? (
        <ul className="mt-3 space-y-2">
          {col.links.map((l) => (
            <li key={l.id}>
              <Link href={l.href} className="text-sm font-medium hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

/** One footer link column. "accordion" collapses it behind its heading on phones; wider screens always show it open. */
export default function StudioFooterColumn({ col, mobileLayout }: { col: ResolvedFooterColumn; mobileLayout: FooterMobileLayout }) {
  const heading = col.heading.trim();
  const open = (
    <div className={mobileLayout === "accordion" && heading ? "hidden sf-sm:block" : undefined}>
      {heading ? <p className={HEADING}>{heading}</p> : null}
      <ColumnBody col={col} />
    </div>
  );
  if (mobileLayout !== "accordion" || !heading) return open;
  return (
    <>
      <details className="studio-footer__fold group border-t border-current/15 py-3 last-of-type:border-b sf-sm:hidden">
        <summary className={`flex cursor-pointer list-none items-center justify-between ${HEADING} [&::-webkit-details-marker]:hidden`}>
          {heading}
          <span aria-hidden className="text-base leading-none transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="pb-1">
          <ColumnBody col={col} />
        </div>
      </details>
      {open}
    </>
  );
}
