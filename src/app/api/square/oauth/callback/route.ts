import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/session";
import { isSquareConnectEnabled } from "@/lib/square/config";
import { completeSquareOAuth } from "@/lib/square/connection";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!isSquareConnectEnabled()) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/square?error=disabled", url.origin),
    );
  }

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/square?error=${encodeURIComponent(error)}`,
        url.origin,
      ),
    );
  }

  const jar = await cookies();
  const expected = jar.get("square_oauth_state")?.value;
  jar.delete("square_oauth_state");

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/square?error=invalid_state", url.origin),
    );
  }

  try {
    const { owner } = await requireOwner();
    if (!squareEligibleBillingCurrency(owner.billingCurrency)) {
      return NextResponse.redirect(
        new URL("/dashboard/settings/square?error=region", url.origin),
      );
    }
    await completeSquareOAuth({ ownerId: owner.id, code });
    return NextResponse.redirect(
      new URL("/dashboard/settings/square?connected=1", url.origin),
    );
  } catch (err) {
    console.error("Square OAuth callback failed", err);
    return NextResponse.redirect(
      new URL("/dashboard/settings/square?error=oauth_failed", url.origin),
    );
  }
}
