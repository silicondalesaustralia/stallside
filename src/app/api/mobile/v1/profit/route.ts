import { profitQuery } from "@/contracts/mobile/profit";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadProfitResponse } from "@/lib/mobile/profit-dto";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

/** Sales, cost of goods, fees and gross profit for one business over a range. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, profitQuery);
  if (!query.ok) return query.response;
  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;
  try {
    return mobileJson(await loadProfitResponse(owner, stand.value, query.data.range));
  } catch (error) {
    return mobileServerError("Mobile profit failed", error);
  }
}
