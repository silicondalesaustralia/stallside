import type { GuidesResponse } from "@/contracts/mobile/guides";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { toGuidesResponse } from "@/lib/mobile/guide-dto";
import { mobileJson, mobileServerError } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    return mobileJson<GuidesResponse>(toGuidesResponse());
  } catch (error) {
    return mobileServerError("Mobile guides failed", error);
  }
}
