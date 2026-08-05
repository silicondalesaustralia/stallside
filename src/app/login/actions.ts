"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueLoginOtp } from "@/lib/login-otp";
import { safeCallbackUrl } from "@/lib/login-callback";
import {
  getOpenLifetimeInvite,
} from "@/lib/lifetime-invite";
import { attributionFromFormData } from "@/lib/ad-attribution";
import type { Prisma } from "@/generated/prisma/client";

function normalizeEmail(raw: FormDataEntryValue | null) {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

function otpSendError(error: unknown): Error {
  console.error("Login OTP send failed", error);
  return new Error("Could not send sign-in code. Try again in a moment.");
}

export async function requestLoginCode(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  let callbackUrl = safeCallbackUrl(String(formData.get("callbackUrl") ?? ""));

  // First-time sign-in via /login still needs the thank-you page for pixels.
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!existing && (callbackUrl === "/dashboard" || !callbackUrl)) {
    callbackUrl = "/signup-complete";
  }

  // Capture fbclid even when first contact is /login, not /signup.
  if (!existing) {
    const adAttribution = attributionFromFormData(formData);
    const name = email.split("@")[0] || "My stand";
    await prisma.signupIntent.upsert({
      where: { email },
      create: {
        email,
        name,
        ...(adAttribution
          ? { adAttribution: adAttribution as Prisma.InputJsonValue }
          : {}),
      },
      update: adAttribution
        ? { adAttribution: adAttribution as Prisma.InputJsonValue }
        : {},
    });
  }

  try {
    await issueLoginOtp(email);
  } catch (error) {
    throw otpSendError(error);
  }

  const codeQs = new URLSearchParams({ email });
  if (callbackUrl !== "/dashboard") {
    codeQs.set("callbackUrl", callbackUrl);
  }
  redirect(`/login/code?${codeQs.toString()}`);
}

export async function verifyLoginCode(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const code = String(formData.get("code") ?? "").trim();
  const callbackUrl = safeCallbackUrl(String(formData.get("callbackUrl") ?? ""));
  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }
  if (!/^\d{6}$/.test(code.replace(/\s+/g, ""))) {
    return { error: "Enter the 6-digit code from your email." };
  }

  try {
    await signIn("otp", {
      email,
      code: code.replace(/\s+/g, ""),
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    if (error instanceof AuthError) {
      return { error: "That code is wrong or expired. Request a new one." };
    }
    console.error("Login OTP verify failed", error);
    return { error: "Could not sign in. Try again." };
  }

  return { error: "Could not sign in. Try again." };
}

/** Signup: name + email → Free account intent, then email code. */
export async function requestSignup(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const name = String(formData.get("name") ?? "").trim();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  if (name.length < 2) {
    throw new Error("Enter your name.");
  }

  const adAttribution = attributionFromFormData(formData);

  await prisma.signupIntent.upsert({
    where: { email },
    create: {
      email,
      name,
      ...(adAttribution
        ? { adAttribution: adAttribution as Prisma.InputJsonValue }
        : {}),
    },
    update: {
      name,
      inviteToken: null,
      ...(adAttribution
        ? { adAttribution: adAttribution as Prisma.InputJsonValue }
        : {}),
    },
  });

  try {
    await issueLoginOtp(email);
  } catch (error) {
    throw otpSendError(error);
  }

  redirect(
    `/login/code?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent("/signup-complete")}`,
  );
}

/** Free for Life invite: name + email → claim invite, then email code. */
export async function requestLifetimeSignup(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const name = String(formData.get("name") ?? "").trim();
  const token = String(formData.get("inviteToken") ?? "").trim();
  if (!token) {
    throw new Error("This invite link is invalid.");
  }
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  if (name.length < 2) {
    throw new Error("Enter your name.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("That email already has an account. Sign in instead.");
  }

  const invite = await getOpenLifetimeInvite(token);
  if (!invite) {
    throw new Error(
      "This invite link is full or invalid. Ask for a new link if you still need access.",
    );
  }

  const adAttribution = attributionFromFormData(formData);

  await prisma.signupIntent.upsert({
    where: { email },
    create: {
      email,
      name,
      inviteToken: token,
      ...(adAttribution
        ? { adAttribution: adAttribution as Prisma.InputJsonValue }
        : {}),
    },
    update: {
      name,
      inviteToken: token,
      ...(adAttribution
        ? { adAttribution: adAttribution as Prisma.InputJsonValue }
        : {}),
    },
  });

  try {
    await issueLoginOtp(email);
  } catch (error) {
    throw otpSendError(error);
  }

  redirect(
    `/login/code?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent("/signup-complete")}`,
  );
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
