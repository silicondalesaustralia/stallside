"use client";

import { useEffect } from "react";

/** Optional auto-print trigger for print routes. */
export default function PrintAuto() {
  useEffect(() => {
    // Leave manual — sellers choose when to print from the dialog.
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold hover:border-[var(--leaf)]"
    >
      Print
    </button>
  );
}
