import type { NextRequest } from "next/server";
import type { RecipeMessage } from "@/contracts/mobile/recipes";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { removeOwnerRecipeLine } from "@/lib/production/recipe-lines";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Removes a line from a recipe. */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/mobile/v1/recipes/[recipeId]/lines/[lineId]">,
) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { lineId } = await ctx.params;
    const result = await removeOwnerRecipeLine(guard.value.owner.id, lineId);
    if ("error" in result) return mobileError(404, result.error);
    return mobileJson<RecipeMessage>({ message: "Line removed." });
  } catch (error) {
    return mobileServerError("Mobile remove recipe line failed", error);
  }
}
