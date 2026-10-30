import { collectionsQuery, type CollectionsResponse } from "@/contracts/mobile/collections";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadCollectionPageGroups } from "@/lib/collections/load-page-groups";
import { toCollectionDays } from "@/lib/mobile/collections-dto";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

/** Paid pre-orders and subscription cycles by pre-order page: upcoming plus the last 14 days. */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, collectionsQuery);
  if (!query.ok) return query.response;

  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const groups = await loadCollectionPageGroups(owner.id, stand.value.id);
    return mobileJson<CollectionsResponse>({ days: toCollectionDays(groups) });
  } catch (error) {
    return mobileServerError("Mobile collections failed", error);
  }
}
