import MakersLpEditorCanvas from "@/components/lp/makers/MakersLpEditorCanvas";
import MakersLpEditorPanel from "@/components/lp/makers/MakersLpEditorPanel";

const PILL = "rounded-[var(--radius-pill)] border border-[var(--line)] bg-white px-2 py-0.5";

/** Code-built preview of the Vendl website editor. */
export default function MakersLpEditorShot() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--wash)] shadow-[0_8px_25px_#17361f16]"
    >
      <div className="flex items-center gap-1.5 border-b border-[var(--line)] bg-[var(--panel)] px-2.5 py-2 text-[9px] font-semibold text-[var(--field)]">
        <span className="rounded-[var(--radius-pill)] bg-[var(--field)] px-2 py-0.5 text-white">EDITING DRAFT</span>
        <span className={PILL}>Home ▾</span>
        <span className={`${PILL} hidden sm:inline`}>Site wide edits</span>
        <span className="ml-auto hidden gap-1 sm:flex">
          <span className="rounded bg-[var(--field)] px-1.5 py-0.5 text-white">Desktop</span>
          <span className="px-1.5 py-0.5 text-[var(--muted)]">Tablet</span>
          <span className="px-1.5 py-0.5 text-[var(--muted)]">Mobile</span>
        </span>
        <span className="ml-auto rounded-[var(--radius-pill)] bg-[#fdf0c4] px-2 py-0.5 text-[#8a5a00] sm:ml-2">NOT PUBLISHED</span>
        <span className="rounded bg-[var(--field)] px-2 py-0.5 text-white">Publish</span>
      </div>
      <div className="flex">
        <MakersLpEditorCanvas />
        <MakersLpEditorPanel />
      </div>
    </div>
  );
}
