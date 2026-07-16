"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueLoginOtp } from "@/lib/login-otp";
import { safeCallbackUrl } from "@/lib/login-callback";

function normalizeEmail(raw: FormDataEntryValue | null) {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

export async function requestLoginCode(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  const callbackUrl = safeCallbackUrl(String(formData.get("callbackUrl") ?? ""));

  try {
    await issueLoginOtp(email);
  } catch (error) {
    console.error("Login OTP send failed", error);
    throw new Error("Could not send sign-in code. Try again in a moment.");
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

/** Signup: name + email → trial intent, then email code. */
export async function requestSignup(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const name = String(formData.get("name") ?? "").trim();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  if (name.length < 2) {
    throw new Error("Enter your name.");
  }

  await prisma.signupIntent.upsert({
    where: { email },
    create: { email, name },
    update: { name },
  });

  try {
    await issueLoginOtp(email);
  } catch (error) {
    console.error("Signup OTP send failed", error);
    throw new Error("Could not send sign-in code. Try again in a moment.");
  }

  redirect(`/login/code?email=${encodeURIComponent(email)}`);
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
