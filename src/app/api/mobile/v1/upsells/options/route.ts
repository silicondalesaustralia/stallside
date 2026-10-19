import { upsellsQuery, type UpsellFormOptions } from "@/contracts/mobile/upsells";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { loadUpsellFormOptions } from "@/lib/upsells/load";
import { mobileError, mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

/** What the upsell form can pick from for one business. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, upsellsQuery);
  if (!query.ok) return query.response;

  try {
    const options = await loadUpsellFormOptions(guard.value.owner.id, query.data.standId);
    if (!options) return mobileError(404, "Business not found.");
    return mobileJson<UpsellFormOptions>(options);
  } catch (error) {
    return mobileServerError("Mobile upsell options failed", error);
  }
}
