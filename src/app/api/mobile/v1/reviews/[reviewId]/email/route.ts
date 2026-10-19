import type { NextRequest } from "next/server";
import type { MobileOk } from "@/contracts/mobile/common";
import { reviewEmailBody } from "@/contracts/mobile/reviews";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { emailOwnerReviewer } from "@/lib/reviews/service";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

const ERRORS = {
  "not-found": [404, "Review not found."],
  missing: [400, "This reviewer didn't leave an email."],
  failed: [502, "Couldn't send that email. Try again."],
} as const;

/** Private email to the reviewer; replies go to the owner's contact email. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/reviews/[reviewId]/email">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, reviewEmailBody);
  if (!body.ok) return body.response;

  try {
    const { reviewId } = await ctx.params;
    const result = await emailOwnerReviewer(guard.value.owner, reviewId, body.data);
    if (result !== "sent") {
      const [status, message] = ERRORS[result];
      return mobileError(status, message);
    }
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile review email failed", error);
  }
}
