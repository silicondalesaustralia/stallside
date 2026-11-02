"use server";

import { requireProOwnerWrite } from "@/lib/require-pro-owner";
import { undoOwnerBatch } from "@/lib/production/undo-batch";
import { failure, text, type ActionResult } from "@/lib/production/form-parse";

/** Deletes a batch: returns its ingredients to stock and removes its finished units. */
export async function undoBatch(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireProOwnerWrite();
    return await undoOwnerBatch(owner.id, text(formData, "id"));
  } catch (error) {
    return failure("undoBatch failed", error);
  }
}
