import type { NextRequest } from "next/server";
import { linkRecipeProductBody, type RecipeMessage } from "@/contracts/mobile/recipes";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { linkOwnerProduct } from "@/lib/production/recipe-lines";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Links a product made from this recipe, same as "Link product" on the web. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/recipes/[recipeId]/products">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, linkRecipeProductBody);
  if (!body.ok) return body.response;
  try {
    const { recipeId } = await ctx.params;
    const { productId, yieldUnitsPerProduct } = body.data;
    const result = await linkOwnerProduct(guard.value.owner.id, recipeId, productId, yieldUnitsPerProduct);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<RecipeMessage>({ message: result.message ?? "Product linked." });
  } catch (error) {
    return mobileServerError("Mobile link recipe product failed", error);
  }
}
