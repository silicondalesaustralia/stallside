"use client";

import { MAX_CHOICES_PER_GROUP } from "@/lib/product-options";

export type DraftChoice = { name: string; priceDollars: string };
export type DraftGroup = { name: string; choices: DraftChoice[] };

const INPUT = "rounded-lg border border-[var(--line)] bg-white px-3 py-2";

/** One option group (e.g. Size) and its choices. */
export default function ProductOptionGroupFields({
  group,
  onChange,
  onRemove,
}: {
  group: DraftGroup;
  onChange: (next: DraftGroup) => void;
  onRemove: () => void;
}) {
  function setChoice(ci: number, patch: Partial<DraftChoice>) {
    onChange({ ...group, choices: group.choices.map((c, i) => (i === ci ? { ...c, ...patch } : c)) });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3">
      <div className="flex items-end justify-between gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">Option name</span>
          <input
            value={group.name}
            onChange={(e) => onChange({ ...group, name: e.target.value })}
            placeholder="Size"
            maxLength={40}
            className={INPUT}
          />
        </label>
        <button type="button" className="pb-2 text-sm text-[var(--gone)] underline" onClick={onRemove}>
          Remove
        </button>
      </div>
      {group.choices.map((choice, ci) => (
        <div key={ci} className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-[8rem] flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Choice</span>
            <input
              value={choice.name}
              onChange={(e) => setChoice(ci, { name: e.target.value })}
              placeholder="Dozen"
              maxLength={40}
              className={INPUT}
            />
          </label>
          <label className="flex w-28 flex-col gap-1 text-sm">
            <span className="font-medium">Price</span>
            <input
              value={choice.priceDollars}
              onChange={(e) => setChoice(ci, { priceDollars: e.target.value })}
              inputMode="decimal"
              className={INPUT}
            />
          </label>
          <button
            type="button"
            aria-label="Remove choice"
            className="pb-2 text-sm underline disabled:opacity-40"
            disabled={group.choices.length <= 1}
            onClick={() => onChange({ ...group, choices: group.choices.filter((_, i) => i !== ci) })}
          >
            ×
          </button>
        </div>
      ))}
      {group.choices.length < MAX_CHOICES_PER_GROUP ? (
        <button
          type="button"
          className="text-left text-sm text-[var(--leaf-dark)] underline"
          onClick={() => onChange({ ...group, choices: [...group.choices, { name: "", priceDollars: "0" }] })}
        >
          Add choice
        </button>
      ) : null}
    </div>
  );
}
