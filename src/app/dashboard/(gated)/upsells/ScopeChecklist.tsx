"use client";

import { useMemo, useState } from "react";

export type ScopeOption = { id: string; label: string };

const SHOWN = 60;

export default function ScopeChecklist({
  label,
  options,
  selected,
  onChange,
  emptyText,
}: {
  label: string;
  options: ScopeOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  emptyText: string;
}) {
  const [query, setQuery] = useState("");
  const chosen = useMemo(() => new Set(selected), [selected]);
  const q = query.trim().toLowerCase();
  const matches = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const visible = matches.slice(0, SHOWN);

  function toggle(id: string) {
    onChange(chosen.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium">
        {label} {selected.length ? <span className="text-[var(--muted)]">({selected.length} chosen)</span> : null}
      </span>
      {options.length === 0 ? (
        <p className="text-[var(--muted)]">{emptyText}</p>
      ) : (
        <>
          {options.length > 8 ? (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              aria-label={`Search ${label.toLowerCase()}`}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            />
          ) : null}
          <ul className="max-h-56 overflow-y-auto rounded-lg border border-[var(--line)] bg-white">
            {visible.map((o) => (
              <li key={o.id}>
                <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-black/5">
                  <input type="checkbox" checked={chosen.has(o.id)} onChange={() => toggle(o.id)} className="size-4" />
                  <span className="truncate">{o.label}</span>
                </label>
              </li>
            ))}
            {matches.length > SHOWN ? (
              <li className="px-3 py-1.5 text-xs text-[var(--muted)]">{matches.length - SHOWN} more — search to narrow down.</li>
            ) : null}
            {matches.length === 0 ? <li className="px-3 py-1.5 text-[var(--muted)]">No matches.</li> : null}
          </ul>
        </>
      )}
    </div>
  );
}
