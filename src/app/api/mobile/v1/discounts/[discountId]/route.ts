import type { NextRequest } from "next/server";
import type { MobileOk } from "@/contracts/mobile/common";
import {
  discountActiveBody,
  updateDiscountBody,
  type DiscountDetail,
  type DiscountSaveResponse,
} from "@/contracts/mobile/discounts";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { saveOwnerDiscount } from "@/lib/discounts/save";
import { deleteOwnerDiscount, getOwnerDiscount, setOwnerDiscountActive } from "@/lib/discounts/manage";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/discounts/[discountId]">;
const notFoundOr400 = (error: string) => mobileError(error === "Discount not found." ? 404 : 400, error);

export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { discountId } = await ctx.params;
    const discount = await getOwnerDiscount(guard.value.owner.id, discountId);
    if (!discount) return mobileError(404, "Discount not found.");
    return mobileJson<DiscountDetail>({ id: discount.id, input: discount.input });
  } catch (error) {
    return mobileServerError("Mobile discount failed", error);
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, updateDiscountBody);
  if (!body.ok) return body.response;
  try {
    const { discountId } = await ctx.params;
    const result = await saveOwnerDiscount(guard.value.owner.id, discountId, body.data.input, null);
    if ("error" in result) return notFoundOr400(result.error);
    return mobileJson<DiscountSaveResponse>({ id: result.id });
  } catch (error) {
    return mobileServerError("Mobile discount update failed", error);
  }
}

/** Turn a code on or off. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, discountActiveBody);
  if (!body.ok) return body.response;
  try {
    const { discountId } = await ctx.params;
    const result = await setOwnerDiscountActive(guard.value.owner.id, discountId, body.data.isActive);
    if ("error" in result) return notFoundOr400(result.error);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile discount toggle failed", error);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { discountId } = await ctx.params;
    const result = await deleteOwnerDiscount(guard.value.owner.id, discountId);
    if ("error" in result) return notFoundOr400(result.error);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile discount delete failed", error);
  }
}
