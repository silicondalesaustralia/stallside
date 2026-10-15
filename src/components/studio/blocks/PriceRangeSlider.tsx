"use client";

import { formatMoney } from "@/lib/money";

/** Two-thumb price slider in whole currency units; values are cents. */
export default function PriceRangeSlider({
  min,
  max,
  low,
  high,
  currency,
  onChange,
}: {
  min: number;
  max: number;
  low: number;
  high: number;
  currency: string;
  onChange: (low: number, high: number) => void;
}) {
  const span = Math.max(1, max - min);
  const left = ((low - min) / span) * 100;
  const right = ((high - min) / span) * 100;
  return (
    <div>
      <div className="price-slider">
        <div className="price-slider__track">
          <div className="price-slider__fill" style={{ left: `${left}%`, width: `${right - left}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={low}
          aria-label="Lowest price"
          onChange={(e) => onChange(Math.min(Number(e.target.value), high), high)}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={high}
          aria-label="Highest price"
          onChange={(e) => onChange(low, Math.max(Number(e.target.value), low))}
        />
      </div>
      <p className="mt-2 flex justify-between text-sm text-[var(--muted)]">
        <span>{formatMoney(low, currency)}</span>
        <span>{formatMoney(high, currency)}</span>
      </p>
    </div>
  );
}
