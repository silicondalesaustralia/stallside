import { collectionEmailBody, type CollectionEmailResponse } from "@/contracts/mobile/collections";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadCollectionPageGroups } from "@/lib/collections/load-page-groups";
import { emailCollectionCustomers } from "@/lib/collections/customer-email";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Emails the customers on one pick-up group; the server works out which orders that is. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, collectionEmailBody);
  if (!body.ok) return body.response;

  const { owner, user } = guard.value;
  const stand = await requireMobileStand(owner.id, body.data.standId);
  if (!stand.ok) return stand.response;

  try {
    const groups = await loadCollectionPageGroups(owner.id, stand.value.id);
    const group = groups.find((g) => g.key === body.data.groupKey);
    if (!group) return mobileError(404, "That pick-up group is no longer listed.");

    const result = await emailCollectionCustomers(
      { ownerId: owner.id, fallbackReplyTo: user.email ?? null },
      { orderIds: group.orders.map((o) => o.id), subject: body.data.subject, message: body.data.message },
    );
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<CollectionEmailResponse>({ summary: result.summary });
  } catch (error) {
    return mobileServerError("Mobile collection email failed", error);
  }
}
