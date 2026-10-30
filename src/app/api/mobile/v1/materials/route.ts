import { materialsQuery } from "@/contracts/mobile/materials";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadMaterialsResponse } from "@/lib/mobile/materials-dto";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

/** Ingredients, parts and packaging with stock on hand and current cost. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, materialsQuery);
  if (!query.ok) return query.response;
  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;
  try {
    return mobileJson(await loadMaterialsResponse(owner.id, stand.value));
  } catch (error) {
    return mobileServerError("Mobile materials failed", error);
  }
}
