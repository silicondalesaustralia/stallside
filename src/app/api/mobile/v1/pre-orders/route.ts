import { preOrdersQuery, type PreOrdersResponse } from "@/contracts/mobile/preorders";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { listOwnerPreOrderPages } from "@/lib/pre-order-pages/service";
import { toMobilePreOrderPage } from "@/lib/mobile/preorder-dto";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, preOrdersQuery);
  if (!query.ok) return query.response;

  const ownerId = guard.value.owner.id;
  const stand = await requireMobileStand(ownerId, query.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const pages = await listOwnerPreOrderPages(ownerId, stand.value.id);
    return mobileJson<PreOrdersResponse>({ pages: pages.map(toMobilePreOrderPage) });
  } catch (error) {
    return mobileServerError("Mobile pre-order pages failed", error);
  }
}
