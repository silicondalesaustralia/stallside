import { otpVerifyBody, type OtpVerifyResponse } from "@/contracts/mobile/auth";
import { authorizeEmailOtp } from "@/lib/auth-otp-user";
import { createMobileSession } from "@/lib/mobile/session-token";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Same code check (and first-sign-in account creation) as the web login, but returns a bearer token. */
export async function POST(request: Request) {
  const body = await readMobileBody(request, otpVerifyBody);
  if (!body.ok) return body.response;

  try {
    const user = await authorizeEmailOtp(body.data.email, body.data.code);
    if (!user) {
      return mobileError(401, "That code didn't work. Check it or request a new one.");
    }

    const { token, expiresAt } = await createMobileSession({
      userId: user.id,
      platform: body.data.platform,
      deviceName: body.data.deviceName,
      appVersion: body.data.appVersion,
    });
    return mobileJson<OtpVerifyResponse>({ token, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    return mobileServerError("Mobile OTP verify failed", error);
  }
}
