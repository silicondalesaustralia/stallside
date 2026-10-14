"use client";

import { useState } from "react";
import DashFormSection from "@/components/DashFormSection";
import { MAX_OPTION_GROUPS, type OptionGroupInput } from "@/lib/product-options";
import ProductOptionGroupFields, { type DraftGroup } from "./ProductOptionGroupFields";

export type SavedOptionGroup = { name: string; choices: { name: string; priceDeltaCents: number }[] };

function emptyGroup(): DraftGroup {
  return { name: "", choices: [{ name: "", priceDollars: "0" }] };
}

function toPayload(groups: DraftGroup[]): OptionGroupInput[] {
  return groups.map((g) => ({
    name: g.name.trim(),
    choices: g.choices.map((c) => {
      const dollars = Number.parseFloat(c.priceDollars || "0");
      const cents = Number.isFinite(dollars) ? Math.round(dollars * 100) : 0;
      return { name: c.name.trim(), priceDeltaCents: Math.max(0, cents) };
    }),
  }));
}

/** The saved groups in the same shape the editor submits, to tell whether options changed. */
export function savedOptionsJson(groups: SavedOptionGroup[]): string {
  return JSON.stringify(groups.map((g) => ({ name: g.name, choices: g.choices.map((c) => ({ name: c.name, priceDeltaCents: c.priceDeltaCents })) })));
}

/** Option groups (Size, Flavour…). Submitted with the product form as `optionsJson`. */
export default function ProductOptionsEditor({ initial, disabled }: { initial: SavedOptionGroup[]; disabled?: boolean }) {
  const [groups, setGroups] = useState<DraftGroup[]>(() =>
    initial.map((g) => ({
      name: g.name,
      choices: g.choices.map((c) => ({ name: c.name, priceDollars: (c.priceDeltaCents / 100).toFixed(2) })),
    })),
  );

  return (
    <DashFormSection
      title="Options"
      hint={
        disabled
          ? "Clear volume prices on this product before adding options."
          : "Sizes, flavours and so on, sharing this product's stock. With one option, each choice price is the full price (0 = use the product price). With several, choice prices are added on top."
      }
    >
      <fieldset disabled={disabled} className="flex flex-col gap-3 disabled:opacity-60">
        <input type="hidden" name="optionsJson" value={JSON.stringify(toPayload(groups))} />
        {groups.map((group, gi) => (
          <ProductOptionGroupFields
            key={gi}
            group={group}
            onChange={(next) => setGroups(groups.map((g, i) => (i === gi ? next : g)))}
            onRemove={() => setGroups(groups.filter((_, i) => i !== gi))}
          />
        ))}
        {groups.length < MAX_OPTION_GROUPS ? (
          <button
            type="button"
            className="w-fit rounded-lg border border-dashed border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--leaf-dark)] hover:bg-[var(--wash)]"
            onClick={() => setGroups([...groups, emptyGroup()])}
          >
            + Add an option like size or flavour
          </button>
        ) : null}
      </fieldset>
    </DashFormSection>
  );
}
