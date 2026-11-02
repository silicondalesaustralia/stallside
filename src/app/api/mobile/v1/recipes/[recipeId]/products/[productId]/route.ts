import type { NextRequest } from "next/server";
import type { RecipeMessage } from "@/contracts/mobile/recipes";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { unlinkOwnerProduct } from "@/lib/production/recipe-lines";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Unlinks a product from its recipe. */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/mobile/v1/recipes/[recipeId]/products/[productId]">,
) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { productId } = await ctx.params;
    const result = await unlinkOwnerProduct(guard.value.owner.id, productId);
    if ("error" in result) return mobileError(404, result.error);
    return mobileJson<RecipeMessage>({ message: "Product unlinked." });
  } catch (error) {
    return mobileServerError("Mobile unlink recipe product failed", error);
  }
}
