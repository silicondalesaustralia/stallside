"use client";

export default function CollectionsPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold hover:border-[var(--leaf)] print:hidden"
    >
      Print list
    </button>
  );
}
