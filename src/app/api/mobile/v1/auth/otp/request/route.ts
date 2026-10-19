import { otpRequestBody } from "@/contracts/mobile/auth";
import type { MobileOk } from "@/contracts/mobile/common";
import { issueLoginOtp, RateLimitError } from "@/lib/login-otp";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Emails the same 6-digit sign-in code the web login uses. */
export async function POST(request: Request) {
  const body = await readMobileBody(request, otpRequestBody);
  if (!body.ok) return body.response;

  try {
    await issueLoginOtp(body.data.email);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    if (error instanceof RateLimitError) return mobileError(429, error.message);
    return mobileServerError("Mobile OTP request failed", error);
  }
}
