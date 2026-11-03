const SWATCHES = ["#000000", "#17361f", "#f2efe6", "#ffffff", "#f7941d"] as const;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2.5">
      <p className="text-[9px] font-semibold text-[var(--field)]">{label}</p>
      <p className="mt-1 rounded border border-[var(--line)] bg-white px-2 py-1 text-[10px] text-[var(--ink)]">{value} ▾</p>
    </div>
  );
}

/** Site-wide settings column of the website editor. */
export default function HomeEditorPanel() {
  return (
    <div className="hidden w-[190px] shrink-0 border-l border-[var(--line)] bg-[var(--panel)] p-3 sm:block">
      <p className="text-[11px] font-bold text-[var(--field)]">Site Wide Edits</p>
      <p className="mt-1 text-[9px] leading-snug text-[var(--muted)]">
        These apply to every page. Click the header, footer or a section to edit just that part.
      </p>
      <p className="mt-2 text-[9px] font-semibold text-[var(--leaf)] underline">Edit header, menu & announcement bar</p>
      <p className="mt-3 border-t border-[var(--line)] pt-2 text-[9px] font-bold tracking-wide text-[var(--muted)]">
        FONTS & TEXT
      </p>
      <Field label="Heading font" value="Source Sans 3" />
      <Field label="Text font" value="Nunito" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Heading size" value="Default" />
        <Field label="Text size" value="Default" />
      </div>
      <p className="mt-2.5 text-[9px] font-semibold text-[var(--field)]">Heading colour</p>
      <div className="mt-1 flex gap-1.5">
        {SWATCHES.map((color) => (
          <span key={color} className="size-4 rounded-full border border-[var(--line)]" style={{ background: color }} />
        ))}
      </div>
    </div>
  );
}
