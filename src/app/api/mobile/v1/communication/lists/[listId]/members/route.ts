import type { NextRequest } from "next/server";
import type { ListMembersResponse } from "@/contracts/mobile/communication";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { listOwnerListMembers } from "@/lib/communication/audience";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/communication/lists/[listId]/members">;

/** Emails on a saved list (unsubscribed left out), for ticking who gets a message. */
export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { listId } = await ctx.params;
    const emails = await listOwnerListMembers(guard.value.owner.id, listId);
    if (!emails) return mobileError(404, "List not found.");
    return mobileJson<ListMembersResponse>({ emails });
  } catch (error) {
    return mobileServerError("Mobile list members failed", error);
  }
}
