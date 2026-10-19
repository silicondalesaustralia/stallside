import type { NextRequest } from "next/server";
import type { MobileOk } from "@/contracts/mobile/common";
import {
  updateUpsellBody,
  upsellActiveBody,
  type UpsellDetail,
  type UpsellSaveResponse,
} from "@/contracts/mobile/upsells";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { getOwnerUpsell } from "@/lib/upsells/load";
import { deleteOwnerUpsell, saveOwnerUpsell, setOwnerUpsellActive } from "@/lib/upsells/save";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/upsells/[upsellId]">;
const notFoundOr400 = (error: string) => mobileError(error === "Upsell not found." ? 404 : 400, error);

export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { upsellId } = await ctx.params;
    const upsell = await getOwnerUpsell(guard.value.owner.id, upsellId);
    if (!upsell) return mobileError(404, "Upsell not found.");
    return mobileJson<UpsellDetail>({ id: upsell.id, standId: upsell.standId, input: upsell.input });
  } catch (error) {
    return mobileServerError("Mobile upsell failed", error);
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, updateUpsellBody);
  if (!body.ok) return body.response;
  try {
    const { upsellId } = await ctx.params;
    const result = await saveOwnerUpsell(guard.value.owner.id, upsellId, body.data.input, null);
    if ("error" in result) return notFoundOr400(result.error);
    return mobileJson<UpsellSaveResponse>({ id: result.id });
  } catch (error) {
    return mobileServerError("Mobile upsell update failed", error);
  }
}

/** Turn an upsell on or off. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, upsellActiveBody);
  if (!body.ok) return body.response;
  try {
    const { upsellId } = await ctx.params;
    const result = await setOwnerUpsellActive(guard.value.owner.id, upsellId, body.data.isActive);
    if ("error" in result) return notFoundOr400(result.error);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile upsell toggle failed", error);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { upsellId } = await ctx.params;
    const result = await deleteOwnerUpsell(guard.value.owner.id, upsellId);
    if ("error" in result) return notFoundOr400(result.error);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile upsell delete failed", error);
  }
}
