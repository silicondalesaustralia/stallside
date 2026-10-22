import crypto from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BETA_APP_ACCESS, betaAppUrl, shouldHandOffToBeta } from "@/lib/beta-handoff-rules";
import { prisma } from "@/lib/prisma";

const HANDOFF_TTL_MS = 60_000;

/**
 * Single-use, 60-second sign-in token the beta app redeems at
 * /api/mobile/v1/auth/web-handoff (same format as its mobile web hand-off).
 */
async function createBetaHandoffToken(userId: string): Promise<string> {
  const token = `vwh_${crypto.randomBytes(32).toString("base64url")}`;
  await prisma.verificationToken.create({
    data: {
      identifier: `mobile-web:${userId}`,
      token: crypto.createHash("sha256").update(token).digest("hex"),
      expires: new Date(Date.now() + HANDOFF_TTL_MS),
    },
  });
  return token;
}

/**
 * Sends beta owners to the beta app, signed in, on the same dashboard page.
 * No-op unless BETA_APP_URL is set; on any error the owner stays here.
 */
export async function redirectBetaOwnerToBetaApp(input: {
  userId: string;
  betaFeatures: string[];
  impersonated: boolean;
}): Promise<void> {
  if (!betaAppUrl() || !input.betaFeatures.includes(BETA_APP_ACCESS)) return;
  const h = await headers();
  const pathname = h.get("x-stallside-pathname") ?? "/dashboard";
  if (!shouldHandOffToBeta({ ...input, pathname })) return;

  let target: string;
  try {
    const token = await createBetaHandoffToken(input.userId);
    const next = `${pathname}${h.get("x-stallside-search") ?? ""}`;
    const params = new URLSearchParams({ token, next });
    target = `${betaAppUrl()}/api/mobile/v1/auth/web-handoff?${params.toString()}`;
  } catch (error) {
    console.error("Beta app hand-off failed; staying on main", error);
    return;
  }
  redirect(target);
}
