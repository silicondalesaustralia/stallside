import type { NextRequest } from "next/server";
import { addRecipeLineBody, type RecipeMessage } from "@/contracts/mobile/recipes";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { addOwnerRecipeLine } from "@/lib/production/recipe-lines";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Adds a material or sub-recipe line, same as "Add line" on the web. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/recipes/[recipeId]/lines">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, addRecipeLineBody);
  if (!body.ok) return body.response;
  try {
    const { recipeId } = await ctx.params;
    const { kind, sourceId, quantity, unit } = body.data;
    const source = kind === "material" ? { kind: "ing" as const, id: sourceId, unit } : { kind: "rec" as const, id: sourceId };
    const result = await addOwnerRecipeLine(guard.value.owner.id, recipeId, source, quantity);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<RecipeMessage>({ message: "Line added." });
  } catch (error) {
    return mobileServerError("Mobile add recipe line failed", error);
  }
}
