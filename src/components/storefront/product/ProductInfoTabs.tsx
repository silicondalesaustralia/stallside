import type { ProductTab } from "@/lib/studio/product-detail-settings";

/** Collapsible extra info (Ingredients, Storage, Allergens…), closed by default. */
export default function ProductInfoTabs({ tabs }: { tabs: ProductTab[] }) {
  if (!tabs.length) return null;
  return (
    <div className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {tabs.map((tab) => (
        <details key={tab.id} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-base font-semibold text-[var(--field)] [&::-webkit-details-marker]:hidden">
            {tab.title}
            <span aria-hidden className="text-xl leading-none transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="whitespace-pre-line pb-4 text-sm leading-relaxed text-[var(--muted)]">{tab.body}</p>
        </details>
      ))}
    </div>
  );
}
