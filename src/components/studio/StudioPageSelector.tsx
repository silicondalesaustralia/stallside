"use client";

import { useRouter } from "next/navigation";
import { useStudioEditorChrome } from "./StudioEditorContext";

/** Switches the editor to another page; pending edits are flushed by autosave on unmount. */
export default function StudioPageSelector() {
  const router = useRouter();
  const { pageOptions, currentPage } = useStudioEditorChrome();
  if (!pageOptions?.length) return null;

  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--field)]">
      <span className="sr-only">Page</span>
      <select
        value={currentPage}
        onChange={(e) => {
          const next = pageOptions.find((o) => o.value === e.target.value);
          if (next) router.push(next.href);
        }}
        className="max-w-[12rem] rounded-lg border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold"
      >
        {pageOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
