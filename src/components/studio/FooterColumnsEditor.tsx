"use client";

import { FOOTER_MAX_COLUMNS, type FooterColumn, type FooterSettings } from "@/lib/studio/footer-settings";
import { autoFooterColumns } from "@/lib/studio/footer-columns";
import { newMenuId } from "@/lib/studio/header-menu";
import { useStudioMetadata } from "./StudioEditorContext";
import FooterColumnRow from "./FooterColumnRow";

/** The footer's link columns: automatic (from page settings) or the seller's own. */
export default function FooterColumnsEditor({
  footer,
  update,
}: {
  footer: FooterSettings;
  update: (patch: Partial<FooterSettings>) => void;
}) {
  const metadata = useStudioMetadata();
  const columns = footer.columns;

  function customise(withContact = false) {
    const seeded = autoFooterColumns({
      enabledPages: metadata.enabledPages,
      footerPages: metadata.customFooterPages,
      aboutLabel: metadata.templateId === "farmhouse" ? "Our farm" : "About",
    });
    const contactColumn: FooterColumn = { id: newMenuId(), heading: "Visit us", links: [], contact: {} };
    update({ columns: withContact ? [...seeded, contactColumn].slice(-FOOTER_MAX_COLUMNS) : seeded });
  }

  if (!columns) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--muted)]">
          Columns are filled in automatically from pages marked &ldquo;Show in footer&rdquo;. Customise them to
          rename, reorder or add your own links, or add a contact / address block to any column.
        </p>
        <button
          type="button"
          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--field)]"
          onClick={() => customise()}
        >
          Customise columns
        </button>
        <button
          type="button"
          className="block text-sm font-semibold text-[var(--field)] underline"
          onClick={() => customise(true)}
        >
          Add a contact / address column
        </button>
      </div>
    );
  }

  function setColumns(next: FooterColumn[]) {
    update({ columns: next });
  }

  function move(index: number, delta: -1 | 1) {
    const next = [...columns!];
    const [col] = next.splice(index, 1);
    if (col) next.splice(index + delta, 0, col);
    setColumns(next);
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {columns.map((col, i) => (
          <FooterColumnRow
            key={col.id}
            column={col}
            index={i}
            count={columns.length}
            onChange={(next) => setColumns(columns.map((c) => (c.id === col.id ? next : c)))}
            onMove={(delta) => move(i, delta)}
            onRemove={() => setColumns(columns.filter((c) => c.id !== col.id))}
          />
        ))}
      </ul>
      {columns.length < FOOTER_MAX_COLUMNS ? (
        <button
          type="button"
          className="text-sm font-semibold text-[var(--field)] underline"
          onClick={() => setColumns([...columns, { id: newMenuId(), heading: "New column", links: [] }])}
        >
          Add a column
        </button>
      ) : null}
      <button
        type="button"
        className="block text-xs font-semibold text-[var(--muted)] underline"
        onClick={() => update({ columns: undefined })}
      >
        Go back to automatic columns
      </button>
    </div>
  );
}
