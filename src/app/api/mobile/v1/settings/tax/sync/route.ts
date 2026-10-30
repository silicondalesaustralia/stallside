import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { syncOwnerPastOrderTax } from "@/lib/tax/owner-tax-settings";
import { mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Recalculates tax on past orders, like "Sync" on the web Tax page. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    return mobileJson({ message: await syncOwnerPastOrderTax(guard.value.owner.id) });
  } catch (error) {
    return mobileServerError("Mobile past order tax sync failed", error);
  }
}
