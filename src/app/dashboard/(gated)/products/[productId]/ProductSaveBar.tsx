export type SaveNotice = { tone: "ok" | "error"; text: string };

/** Sticky bar at the bottom of the product form: one Save for every field on the page. */
export default function ProductSaveBar({
  dirty,
  pending,
  notice,
  onDiscard,
}: {
  dirty: boolean;
  pending: boolean;
  notice: SaveNotice | null;
  onDiscard: () => void;
}) {
  const status = pending
    ? "Saving…"
    : notice?.tone === "error"
      ? notice.text
      : dirty
        ? "Unsaved changes"
        : (notice?.text ?? "All changes saved");
  const loud = dirty || pending || notice?.tone === "error";

  return (
    <>
      {/* Keeps the last form fields clear of the fixed bar (and the mobile tab bar). */}
      <div className="h-24 shrink-0 max-md:h-36" aria-hidden />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 print:hidden">
        <div className="mx-auto max-w-[86rem] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 max-md:pb-24 md:px-6">
          <div
            className={`pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-lg transition-colors ${
              loud ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white/95 text-[var(--muted)] backdrop-blur"
            }`}
          >
            <p role="status" aria-live="polite" className={`text-sm font-medium ${notice?.tone === "error" && !pending ? "text-red-200" : ""}`}>
              {dirty && !pending ? <span className="mr-2 inline-block size-2 rounded-full bg-amber-400 align-middle" aria-hidden /> : null}
              {status}
            </p>
            <div className="flex items-center gap-2">
              {dirty ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={onDiscard}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Discard
                </button>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                title="Save (Ctrl/⌘+S)"
                className={`rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-60 ${
                  loud ? "bg-white text-[var(--ink)] hover:bg-[var(--wash)]" : "bg-[var(--wash)] text-[var(--ink)] hover:bg-[var(--line)]"
                }`}
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
