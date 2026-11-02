import type { NextRequest } from "next/server";
import { recipeSettings, recipesQuery, type RecipeMessage } from "@/contracts/mobile/recipes";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadRecipeDetail } from "@/lib/mobile/recipe-detail-dto";
import { loadStandLocale } from "@/lib/mobile/stand-locale";
import { saveOwnerRecipe } from "@/lib/production/recipes";
import { mobileError, mobileJson, mobileServerError, readMobileBody, readMobileQuery } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/recipes/[recipeId]">;

/** One recipe: lines, batch cost and linked products for the selected business. */
export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, recipesQuery);
  if (!query.ok) return query.response;
  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;
  try {
    const { recipeId } = await ctx.params;
    const { currency } = await loadStandLocale(stand.value);
    const detail = await loadRecipeDetail(owner.id, { id: stand.value.id, currency }, recipeId);
    if (!detail) return mobileError(404, "Recipe not found.");
    return mobileJson(detail);
  } catch (error) {
    return mobileServerError("Mobile recipe detail failed", error);
  }
}

/** Saves Recipe settings, same as "Save recipe" on the web. */
export async function PUT(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, recipeSettings);
  if (!body.ok) return body.response;
  try {
    const { recipeId } = await ctx.params;
    const result = await saveOwnerRecipe(guard.value.owner.id, recipeId, body.data);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<RecipeMessage>({ message: result.message ?? "Saved." });
  } catch (error) {
    return mobileServerError("Mobile save recipe failed", error);
  }
}
