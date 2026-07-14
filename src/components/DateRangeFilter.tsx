import Link from "next/link";
import { RANGE_PRESETS, type RangeKey } from "@/lib/date-range";

export default function DateRangeFilter({
  pathname,
  activeKey,
  from,
  to,
}: {
  pathname: string;
  activeKey: RangeKey;
  from: string;
  to: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {RANGE_PRESETS.map((preset) => {
          const href =
            preset.key === "custom"
              ? `${pathname}?range=custom&from=${from}&to=${to}`
              : `${pathname}?range=${preset.key}`;
          const active = activeKey === preset.key;
          return (
            <Link
              key={preset.key}
              href={href}
              className={`rounded-[var(--radius-pill)] px-3 py-1.5 text-sm font-semibold transition ${
                active
                  ? "bg-[var(--leaf)] text-white"
                  : "border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:border-[var(--leaf)]"
              }`}
            >
              {preset.label}
            </Link>
          );
        })}
      </div>
      {activeKey === "custom" ? (
        <form method="get" className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="range" value="custom" />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">From</span>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">To</span>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Apply
          </button>
        </form>
      ) : null}
    </div>
  );
}
