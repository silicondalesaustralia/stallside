import type { QrCodesResponse } from "@/contracts/mobile/qr";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { listOwnerQrCodes } from "@/lib/qr/owner-codes";
import { mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Saved page QR codes across all the owner's businesses (main business QRs come from /me). */
export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const codes = await listOwnerQrCodes(guard.value.owner.id);
    return mobileJson<QrCodesResponse>({ codes });
  } catch (error) {
    return mobileServerError("Mobile QR codes failed", error);
  }
}
