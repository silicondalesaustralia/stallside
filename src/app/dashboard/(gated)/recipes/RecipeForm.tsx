"use client";

import { useState } from "react";
import { MEASURE_UNITS, unitLabel } from "@/lib/production/units";
import { dashCtaClass } from "@/components/DashPrimaryCta";

type IngredientOpt = { id: string; name: string; baseUnit: string };
type RecipeOpt = { id: string; name: string; yieldLabel: string };

type LineState =
  | { kind: "ingredient"; ingredientId: string; quantity: string; unit: string }
  | { kind: "component"; componentRecipeId: string; quantity: string };

export default function RecipeForm({
  action,
  ingredients,
  recipes,
  defaults,
  excludeRecipeId,
}: {
  action: (formData: FormData) => Promise<void>;
  ingredients: IngredientOpt[];
  recipes: RecipeOpt[];
  excludeRecipeId?: string;
  defaults?: {
    id?: string;
    name: string;
    yieldQuantity: string;
    yieldLabel: string;
    instructions: string | null;
    isActive?: boolean;
    lines: LineState[];
  };
}) {
  const [lines, setLines] = useState<LineState[]>(
    defaults?.lines?.length
      ? defaults.lines
      : [{ kind: "ingredient", ingredientId: "", quantity: "", unit: "G" }],
  );

  const componentOptions = recipes.filter((r) => r.id !== excludeRecipeId);

  return (
    <form action={action} className="flex flex-col gap-4">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Recipe name</span>
        <input
          name="name"
          required
          defaultValue={defaults?.name ?? ""}
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">This recipe makes</span>
          <input
            name="yieldQuantity"
            required
            inputMode="decimal"
            defaultValue={defaults?.yieldQuantity ?? "1"}
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Units (e.g. buns)</span>
          <input
            name="yieldLabel"
            defaultValue={defaults?.yieldLabel ?? "units"}
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Ingredients</p>
        {lines.map((line, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-lg border border-[var(--line)] p-3 sm:grid-cols-4"
          >
            <input type="hidden" name="lineKind" value={line.kind} />
            <select
              className="rounded border border-[var(--line)] px-2 py-2 text-sm sm:col-span-4"
              value={line.kind}
              onChange={(e) => {
                const kind = e.target.value as "ingredient" | "component";
                setLines((prev) =>
                  prev.map((l, i) =>
                    i !== index
                      ? l
                      : kind === "ingredient"
                        ? {
                            kind: "ingredient",
                            ingredientId: "",
                            quantity: l.quantity,
                            unit: "G",
                          }
                        : {
                            kind: "component",
                            componentRecipeId: "",
                            quantity: l.quantity,
                          },
                  ),
                );
              }}
            >
              <option value="ingredient">Ingredient</option>
              <option value="component">Sub-recipe</option>
            </select>
            {line.kind === "ingredient" ? (
              <>
                <select
                  name="lineIngredientId"
                  required
                  value={line.ingredientId}
                  onChange={(e) =>
                    setLines((prev) =>
                      prev.map((l, i) =>
                        i === index && l.kind === "ingredient"
                          ? { ...l, ingredientId: e.target.value }
                          : l,
                      ),
                    )
                  }
                  className="rounded border border-[var(--line)] px-2 py-2 text-sm sm:col-span-2"
                >
                  <option value="">Select…</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="lineComponentId" value="" />
                <input
                  name="lineQuantity"
                  required
                  inputMode="decimal"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) =>
                    setLines((prev) =>
                      prev.map((l, i) =>
                        i === index ? { ...l, quantity: e.target.value } : l,
                      ),
                    )
                  }
                  className="rounded border border-[var(--line)] px-2 py-2 text-sm"
                />
                <select
                  name="lineUnit"
                  value={line.unit}
                  onChange={(e) =>
                    setLines((prev) =>
                      prev.map((l, i) =>
                        i === index && l.kind === "ingredient"
                          ? { ...l, unit: e.target.value }
                          : l,
                      ),
                    )
                  }
                  className="rounded border border-[var(--line)] px-2 py-2 text-sm"
                >
                  {MEASURE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {unitLabel(u)}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <input type="hidden" name="lineIngredientId" value="" />
                <select
                  name="lineComponentId"
                  required
                  value={line.componentRecipeId}
                  onChange={(e) =>
                    setLines((prev) =>
                      prev.map((l, i) =>
                        i === index && l.kind === "component"
                          ? { ...l, componentRecipeId: e.target.value }
                          : l,
                      ),
                    )
                  }
                  className="rounded border border-[var(--line)] px-2 py-2 text-sm sm:col-span-2"
                >
                  <option value="">Select sub-recipe…</option>
                  {componentOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <input
                  name="lineQuantity"
                  required
                  inputMode="decimal"
                  placeholder="Yield units"
                  value={line.quantity}
                  onChange={(e) =>
                    setLines((prev) =>
                      prev.map((l, i) =>
                        i === index ? { ...l, quantity: e.target.value } : l,
                      ),
                    )
                  }
                  className="rounded border border-[var(--line)] px-2 py-2 text-sm sm:col-span-2"
                />
                <input type="hidden" name="lineUnit" value="" />
              </>
            )}
            <button
              type="button"
              className="text-left text-xs text-[var(--muted)] underline sm:col-span-4"
              onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
            >
              Remove line
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-semibold text-[var(--leaf-dark)] underline"
          onClick={() =>
            setLines((prev) => [
              ...prev,
              { kind: "ingredient", ingredientId: "", quantity: "", unit: "G" },
            ])
          }
        >
          + Add line
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Instructions (optional)</span>
        <textarea
          name="instructions"
          rows={3}
          defaultValue={defaults?.instructions ?? ""}
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      {defaults?.id ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={defaults.isActive !== false}
          />
          Active
        </label>
      ) : null}
      <button type="submit" className={dashCtaClass}>
        Save recipe
      </button>
    </form>
  );
}
