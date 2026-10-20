import type { AccountResponse } from "@/contracts/mobile/account";
import { updateAccountBody } from "@/contracts/mobile/account";
import type { MobileOk } from "@/contracts/mobile/common";
import { requireMobileOwner, type MobileOwnerContext } from "@/lib/mobile/require-owner";
import { revokeMobileSession } from "@/lib/mobile/session-token";
import { updateOwnerBusinessName } from "@/lib/account/service";
import { wipeOwnerAccount } from "@/lib/wipe-owner-account";
import { billingRegionDisplay } from "@/lib/saas-pricing";
import { stallsideSubscriptionSummary } from "@/lib/stallside-subscription-summary";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

function accountResponse({ user, owner }: MobileOwnerContext, businessName = owner.businessName) {
  return mobileJson<AccountResponse>({
    email: user.email,
    businessName,
    subscription: stallsideSubscriptionSummary(owner, {
      email: user.email,
      role: user.role,
      lifetimeAccess: owner.lifetimeAccess,
    }),
    billingRegion: billingRegionDisplay(owner.billingCurrency),
  });
}

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    return accountResponse(guard.value);
  } catch (error) {
    return mobileServerError("Mobile account failed", error);
  }
}

export async function PATCH(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, updateAccountBody);
  if (!body.ok) return body.response;
  try {
    const result = await updateOwnerBusinessName(guard.value.owner.id, body.data.businessName);
    if ("error" in result) return mobileError(400, result.error);
    return accountResponse(guard.value, body.data.businessName.trim());
  } catch (error) {
    return mobileServerError("Mobile account update failed", error);
  }
}

/** Closes the account (same as Delete account on the web) and signs this phone out. */
export async function DELETE(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const result = await wipeOwnerAccount(guard.value.owner.id);
    if ("error" in result) return mobileError(400, result.error);
    await revokeMobileSession(guard.value.sessionId);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile account delete failed", error);
  }
}
