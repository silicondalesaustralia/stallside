import { cookies } from "next/headers";
import { REF_COOKIE, normalizeReferralCode } from "@/lib/affiliate/constants";

/** SignupIntent fields for the affiliate code in the visitor's vendl_ref cookie. */
export async function referralIntentData(): Promise<{ referralCode?: string }> {
  const store = await cookies();
  const code = normalizeReferralCode(store.get(REF_COOKIE)?.value);
  return code ? { referralCode: code } : {};
}
