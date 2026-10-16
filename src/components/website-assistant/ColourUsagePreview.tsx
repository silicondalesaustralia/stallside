const DEFAULT_MAIN = "#2f5d3a";
const DEFAULT_SECOND = "#c9a227";

/** Where each brand colour shows on the site, drawn with the seller's own colours. */
export default function ColourUsagePreview({ main, second }: { main: string | null; second: string | null }) {
  const m = main ?? DEFAULT_MAIN;
  const s = second ?? DEFAULT_SECOND;
  return (
    <div className="grid gap-3 rounded-lg border border-[var(--line)] bg-white p-3 text-xs text-[var(--muted)] sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <p>
          <span className="font-semibold text-[var(--field)]">Main colour</span> — buttons, links and small labels
          above headings.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: m }}>
            Shop now
          </span>
          <span className="font-semibold uppercase tracking-wide" style={{ color: m }}>
            Fresh this week
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p>
          <span className="font-semibold text-[var(--field)]">Second colour</span> — product prices, and an option for
          section backgrounds in the editor.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold" style={{ color: s }}>
            $8.50
          </span>
          <span className="rounded px-2 py-1 text-[var(--field)]" style={{ background: `color-mix(in srgb, ${s} 20%, white)` }}>
            Highlight section
          </span>
        </div>
      </div>
      <p className="sm:col-span-2">Headings and body text stay dark so everything is easy to read. You can change any of this later in the editor.</p>
    </div>
  );
}
