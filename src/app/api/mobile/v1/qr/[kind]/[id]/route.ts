import type { NextRequest } from "next/server";
import { qrKind, type QrImageResponse } from "@/contracts/mobile/qr";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { getOwnerBusinessQr, getOwnerQrCode } from "@/lib/qr/owner-codes";
import { businessQrHref } from "@/lib/qr/hrefs";
import { standQrDataUrl } from "@/lib/stand-qr";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/qr/[kind]/[id]">;

export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const params = await ctx.params;
  const kind = qrKind.safeParse(params.kind);
  if (!kind.success) return mobileError(404, "QR code not found.");

  try {
    const ownerId = guard.value.owner.id;
    const qr =
      kind.data === "business" ? await getOwnerBusinessQr(ownerId, params.id) : await getOwnerQrCode(ownerId, params.id);
    if (!qr) return mobileError(404, "QR code not found.");
    const webPath = kind.data === "business" ? businessQrHref(qr.id) : `/dashboard/qr/${encodeURIComponent(qr.id)}`;
    return mobileJson<QrImageResponse>({
      kind: kind.data,
      id: qr.id,
      name: qr.name,
      url: qr.url,
      image: await standQrDataUrl(qr.url, 720),
      webPath,
    });
  } catch (error) {
    return mobileServerError("Mobile QR image failed", error);
  }
}
