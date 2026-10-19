"use client";

import { useState } from "react";

/** datetime-local is browser-local; send an ISO string so the server gets the right instant. */
export default function BlogScheduleField({ name }: { name: string }) {
  const [iso, setIso] = useState("");

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">Schedule for (your local time)</span>
      <input
        type="datetime-local"
        onChange={(e) => {
          const date = new Date(e.target.value);
          setIso(Number.isNaN(date.getTime()) ? "" : date.toISOString());
        }}
        className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--leaf)] focus:ring-2"
      />
      <input type="hidden" name={name} value={iso} />
    </label>
  );
}
