import type { NextRequest } from "next/server";
import { materialsQuery } from "@/contracts/mobile/materials";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadMaterialDetail } from "@/lib/mobile/materials-dto";
import { mobileError, mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

/** One material with its purchase history and the recipes that use it. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/materials/[ingredientId]">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, materialsQuery);
  if (!query.ok) return query.response;
  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;
  try {
    const { ingredientId } = await ctx.params;
    const detail = await loadMaterialDetail(owner.id, stand.value, ingredientId);
    if (!detail) return mobileError(404, "Material not found.");
    return mobileJson(detail);
  } catch (error) {
    return mobileServerError("Mobile material detail failed", error);
  }
}
