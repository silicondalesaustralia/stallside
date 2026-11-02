import { createRecipeBody, recipesQuery, type RecipeMessage } from "@/contracts/mobile/recipes";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadRecipesResponse } from "@/lib/mobile/recipes-dto";
import { loadStandLocale } from "@/lib/mobile/stand-locale";
import { createOwnerRecipe } from "@/lib/production/recipes";
import { mobileError, mobileJson, mobileServerError, readMobileBody, readMobileQuery } from "@/lib/mobile/http";

/** All the owner's recipes with costs, priced in the selected business's currency. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, recipesQuery);
  if (!query.ok) return query.response;
  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;
  try {
    const { currency } = await loadStandLocale(stand.value);
    return mobileJson(await loadRecipesResponse(owner.id, currency));
  } catch (error) {
    return mobileServerError("Mobile recipes failed", error);
  }
}

/** Creates a recipe, same as "Create recipe" on the web. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, createRecipeBody);
  if (!body.ok) return body.response;
  try {
    const result = await createOwnerRecipe(guard.value.owner.id, body.data);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<RecipeMessage>({ message: "Recipe created.", recipeId: result.recipeId });
  } catch (error) {
    return mobileServerError("Mobile create recipe failed", error);
  }
}
