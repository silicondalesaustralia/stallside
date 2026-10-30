import { useState } from "react";
import type {
  ProductionResponse,
  RecordBatchBody,
} from "@contracts/mobile/production";
import { expectedUnits, parseCount } from "@/lib/batch-math";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Form state for "Record a batch"; units made follow the recipe until the owner edits them. */
export function useBatchForm(
  data: ProductionResponse,
  initialRecipeId?: string,
) {
  const first =
    data.recipes.find((r) => r.id === initialRecipeId) ?? data.recipes[0];
  const [recipeId, setRecipeIdState] = useState(first?.id ?? "");
  const [count, setCount] = useState("1");
  const [productId, setProductId] = useState<string | null>(
    first?.productId ?? null,
  );
  const [unitsOverride, setUnitsOverride] = useState<string | null>(null);
  const [madeOn, setMadeOn] = useState(data.today);
  const [bestBefore, setBestBefore] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [notes, setNotes] = useState("");
  const [updateCost, setUpdateCost] = useState(true);

  const recipe = data.recipes.find((r) => r.id === recipeId);
  const batchCount = parseCount(count);
  const autoUnits = expectedUnits(recipe, batchCount, productId);
  const units = unitsOverride ?? String(autoUnits);
  const costCents = recipe ? Math.round(recipe.batchCostCents * batchCount) : 0;

  function setRecipeId(id: string) {
    setRecipeIdState(id);
    const linked = data.recipes.find((r) => r.id === id)?.productId;
    if (linked) setProductId(linked);
    setUnitsOverride(null);
  }

  function chooseProduct(id: string | null) {
    setProductId(id);
    setUnitsOverride(null);
  }

  function problem(): string | null {
    if (!recipe) return "Choose a recipe.";
    if (!(batchCount > 0)) return "Enter how many batches you made.";
    if (productId && !/^\d+$/.test(units.trim()))
      return "Enter the number of sellable units made.";
    if (madeOn && !DAY.test(madeOn)) return "Made on must be YYYY-MM-DD.";
    if (bestBefore && !DAY.test(bestBefore))
      return "Best before must be YYYY-MM-DD.";
    return null;
  }

  function body(standId: string): RecordBatchBody {
    return {
      standId,
      recipeId,
      batchCount,
      productId,
      unitsMade: productId ? Number(units.trim()) : 0,
      batchCode: batchCode.trim() || null,
      madeOn: madeOn.trim() || null,
      bestBefore: bestBefore.trim() || null,
      notes: notes.trim() || null,
      updateCost,
    };
  }

  return {
    values: {
      recipeId,
      count,
      productId,
      units,
      madeOn,
      bestBefore,
      batchCode,
      notes,
      updateCost,
    },
    set: {
      recipeId: setRecipeId,
      count: (v: string) => {
        setCount(v);
        setUnitsOverride(null);
      },
      productId: chooseProduct,
      units: setUnitsOverride,
      madeOn: setMadeOn,
      bestBefore: setBestBefore,
      batchCode: setBatchCode,
      notes: setNotes,
      updateCost: setUpdateCost,
    },
    recipe,
    costCents,
    problem,
    body,
  };
}

export type BatchForm = ReturnType<typeof useBatchForm>;
