import type { InfoRow, InfoRowIcon } from "@/lib/studio/product-detail-settings";
import SectionElement from "@/components/studio/SectionElement";

const PATHS: Record<InfoRowIcon, string> = {
  pickup: "M3 10l9-6 9 6v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  delivery: "M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  secure: "M6 11V8a6 6 0 1 1 12 0v3M5 11h14v10H5z",
  fresh: "M12 21c-4-3-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-3 8-7 11zM12 7v7",
  local: "M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01",
};

/** Short reassurance lines under Add to cart (pickup, delivery, secure checkout…). */
export default function ProductInfoRows({ rows }: { rows: InfoRow[] }) {
  if (!rows.length) return null;
  return (
    <SectionElement el="bullets" as="ul" className="mt-6 space-y-2.5 border-t border-[var(--line)] pt-5 text-sm text-[var(--ink)]">
      {rows.map((row) => (
        <li key={row.id} className="flex items-start gap-3">
          <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 size-5 shrink-0 fill-none stroke-[var(--field)] stroke-[1.75] [stroke-linecap:round] [stroke-linejoin:round]">
            <path d={PATHS[row.icon]} />
          </svg>
          <span>{row.text}</span>
        </li>
      ))}
    </SectionElement>
  );
}
