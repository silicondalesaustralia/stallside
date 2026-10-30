import type { NextRequest } from "next/server";
import type { ProductionMessage } from "@/contracts/mobile/production";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { undoOwnerBatch } from "@/lib/production/undo-batch";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Undoes a batch: materials go back into stock and its units come off the product. */
export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/production/[batchId]">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { batchId } = await ctx.params;
    const result = await undoOwnerBatch(guard.value.owner.id, batchId);
    if ("error" in result) return mobileError(404, result.error);
    return mobileJson<ProductionMessage>({ message: result.message ?? "Batch undone." });
  } catch (error) {
    return mobileServerError("Mobile undo batch failed", error);
  }
}
