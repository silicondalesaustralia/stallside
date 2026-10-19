import type { NextRequest } from "next/server";
import { customerNotesBody, type CustomerDetail } from "@/contracts/mobile/customers";
import type { MobileOk } from "@/contracts/mobile/common";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { getOwnerCustomer, updateOwnerCustomerNotes } from "@/lib/customers/service";
import { toCustomerDetail } from "@/lib/mobile/customer-dto";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/customers/[customerId]">;

export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { customerId } = await ctx.params;
    const { owner } = guard.value;
    const detail = await getOwnerCustomer(owner.id, customerId);
    if (!detail) return mobileError(404, "Customer not found.");
    return mobileJson<CustomerDetail>(toCustomerDetail(detail, owner.billingCurrency ?? "AUD"));
  } catch (error) {
    return mobileServerError("Mobile customer detail failed", error);
  }
}

/** Saves the private notes, same field as the web customer page. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, customerNotesBody);
  if (!body.ok) return body.response;

  try {
    const { customerId } = await ctx.params;
    const saved = await updateOwnerCustomerNotes(guard.value.owner.id, customerId, body.data.notes);
    if (!saved) return mobileError(404, "Customer not found.");
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile customer notes failed", error);
  }
}
