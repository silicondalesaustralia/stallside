import { prisma } from "@/lib/prisma";
import { recordBatchStock } from "./batch-stock";
import { afterProductionChange } from "./after-production-change";
import type { ActionResult } from "./form-parse";

/** Deletes a batch: returns its ingredients to stock and removes its finished units. */
export async function undoOwnerBatch(ownerId: string, batchId: string): Promise<ActionResult> {
  const batch = await prisma.productionBatch.findFirst({
    where: { id: batchId, ownerId },
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
        ownerId,
        standId: batch.standId,
        change: -batch.unitsMade,
        reason: `Undo production batch ${batch.batchCode}`,
      });
    }
    await tx.productionBatch.delete({ where: { id: batch.id } });
  });

  await afterProductionChange(ownerId, batch.unitsMade > 0 ? batch.productId : null);
  return { ok: true, message: `Batch ${batch.batchCode} undone.` };
}
