"use server";

import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { recordBatchStock } from "@/lib/production/batch-stock";
import { failure, text, type ActionResult } from "@/lib/production/form-parse";
import { afterProductionChange } from "./after-production-change";

/** Deletes a batch: returns its ingredients to stock and removes its finished units. */
export async function undoBatch(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const batch = await prisma.productionBatch.findFirst({
      where: { id: text(formData, "id"), ownerId: owner.id },
      include: { lines: true },
    });
    if (!batch) return { error: "Batch not found." };

    await prisma.$transaction(async (tx) => {
      for (const line of batch.lines) {
        if (!line.ingredientId) continue;
        await tx.ingredient.update({
          where: { id: line.ingredientId },
          data: { onHandQuantity: { increment: line.quantity } },
        });
      }
      if (batch.productId && batch.unitsMade > 0) {
        await recordBatchStock(tx, {
          productId: batch.productId,
          ownerId: owner.id,
          standId: batch.standId,
          change: -batch.unitsMade,
          reason: `Undo production batch ${batch.batchCode}`,
        });
      }
      await tx.productionBatch.delete({ where: { id: batch.id } });
    });

    await afterProductionChange(owner.id, batch.unitsMade > 0 ? batch.productId : null);
    return { ok: true, message: `Batch ${batch.batchCode} undone.` };
  } catch (error) {
    return failure("undoBatch failed", error);
  }
}
