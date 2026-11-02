import type { NextRequest } from "next/server";
import { recipeActiveBody, type RecipeMessage } from "@/contracts/mobile/recipes";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { setOwnerRecipeActive } from "@/lib/production/recipes";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Archives or restores a recipe. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/recipes/[recipeId]/active">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, recipeActiveBody);
  if (!body.ok) return body.response;
  try {
    const { recipeId } = await ctx.params;
    const result = await setOwnerRecipeActive(guard.value.owner.id, recipeId, body.data.isActive);
    if ("error" in result) return mobileError(404, result.error);
    return mobileJson<RecipeMessage>({ message: result.message ?? "Saved." });
  } catch (error) {
    return mobileServerError("Mobile recipe archive failed", error);
  }
}
