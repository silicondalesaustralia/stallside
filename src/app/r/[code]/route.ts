import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestIsSecure } from "@/lib/auth-session";
import {
  REF_COOKIE,
  REF_MAX_AGE_SEC,
  normalizeReferralCode,
} from "@/lib/affiliate/constants";
import { findAffiliateByCode } from "@/lib/affiliate/referral-code";

/** Affiliate link: remember the code for 90 days, count the click, send to home. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await params;
  const response = NextResponse.redirect(new URL("/", request.nextUrl), 307);

  const code = normalizeReferralCode(raw);
  if (!code) return response;

  try {
    const affiliate = await findAffiliateByCode(code);
    if (!affiliate || affiliate.deletedAt) return response;

    const repeat = request.cookies.get(REF_COOKIE)?.value === code;
    if (!repeat) {
      await prisma.affiliateClick.create({
        data: { affiliateOwnerId: affiliate.id },
      });
    }

    response.cookies.set(REF_COOKIE, code, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: requestIsSecure(request),
      maxAge: REF_MAX_AGE_SEC,
    });
  } catch (error) {
    console.error("Referral link handling failed", { code, error });
  }
  return response;
}
