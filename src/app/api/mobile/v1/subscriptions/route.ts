import { subscriptionsQuery, type OffersResponse } from "@/contracts/mobile/subscriptions";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { listOwnerOffers } from "@/lib/subscriptions/service";
import { toMobileOffer } from "@/lib/mobile/subscription-dto";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, subscriptionsQuery);
  if (!query.ok) return query.response;

  const ownerId = guard.value.owner.id;
  const stand = await requireMobileStand(ownerId, query.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const offers = await listOwnerOffers(ownerId, stand.value.id);
    return mobileJson<OffersResponse>({ offers: offers.map(toMobileOffer) });
  } catch (error) {
    return mobileServerError("Mobile subscriptions failed", error);
  }
}
