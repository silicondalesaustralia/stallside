"use client";

export function PlanPriceRow({
  enabled,
  onToggle,
  enableName,
  priceName,
  label,
  defaultDollars,
}: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  enableName: string;
  priceName: string;
  label: string;
  defaultDollars: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name={enableName}
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="size-4"
        />
        {label}
      </label>
      {enabled ? (
        <label className="flex items-center gap-2">
          $
          <input
            name={priceName}
            type="number"
            min={0.5}
            step={0.01}
            required
            defaultValue={defaultDollars}
            className="w-28 rounded border border-[var(--line)] px-2 py-1"
          />
        </label>
      ) : null}
    </div>
  );
}

export function centsToDollars(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}
