"use client";

import { useNowSeconds } from "./useNowSeconds";

const UNITS = [
  ["days", 86400],
  ["hrs", 3600],
  ["mins", 60],
  ["secs", 1],
] as const;

/** Live time left until `endsAt`; shows `fallback` (e.g. "Orders close Fri 5pm") before it starts ticking. */
export default function CountdownClock({ endsAt, fallback }: { endsAt: string; fallback: string }) {
  const now = useNowSeconds();
  const end = Math.floor(new Date(endsAt).getTime() / 1000);
  if (now === null || Number.isNaN(end)) return <p className="text-lg font-semibold text-[var(--field)]">{fallback}</p>;
  const left = end - now;
  if (left <= 0) return <p className="text-lg font-semibold text-[var(--field)]">Orders have closed</p>;
  return (
    <div className="flex gap-2 sf-sm:gap-3" role="timer" aria-label={fallback}>
      {UNITS.map(([label, size], i) => {
        const value = Math.floor((i === 0 ? left : left % UNITS[i - 1][1]) / size);
        return (
          <div key={label} className="min-w-[4rem] rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-center">
            <span className="block text-2xl font-bold tabular-nums text-[var(--field)] sf-sm:text-3xl">
              {String(value).padStart(2, "0")}
            </span>
            <span className="block text-xs uppercase tracking-wide text-[var(--muted)]">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
