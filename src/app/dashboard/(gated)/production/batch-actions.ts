"use server";

import { requireOwnerWrite } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { recordOwnerBatch } from "@/lib/production/record-batch";
import {
  dateOnly,
  decimal,
  failure,
  optionalText,
  text,
  wholeNumber,
  type ActionResult,
} from "@/lib/production/form-parse";

export async function createBatch(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const { selected } = await resolveSelectedBusiness(owner.id);
    if (!selected) return { error: "Create a business first." };
    const batchCount = decimal(formData, "batchCount", true);
    const productId = text(formData, "productId") || null;
    const unitsMade = productId ? wholeNumber(formData, "unitsMade") : 0;
    if (batchCount == null) return { error: "Enter how many batches you made." };
    if (unitsMade == null) return { error: "Enter the number of sellable units made." };

    return await recordOwnerBatch(owner.id, selected.id, {
      recipeId: text(formData, "recipeId"),
      batchCount,
      productId,
      unitsMade,
      batchCode: optionalText(formData, "batchCode"),
      madeAt: dateOnly(formData, "madeAt"),
      bestBefore: dateOnly(formData, "bestBefore"),
      notes: optionalText(formData, "notes"),
      updateCost: formData.get("updateCost") === "on",
    });
  } catch (error) {
    return failure("createBatch failed", error);
  }
}
