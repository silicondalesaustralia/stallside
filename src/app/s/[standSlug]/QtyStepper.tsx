"use client";

export default function QtyStepper({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--line)] bg-white p-1">
      <button
        type="button"
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex size-10 items-center justify-center rounded-[var(--radius-pill)] text-xl disabled:opacity-40"
      >
        −
      </button>
      <span className="w-8 text-center font-receipt text-lg">{value}</span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex size-10 items-center justify-center rounded-[var(--radius-pill)] text-xl disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
