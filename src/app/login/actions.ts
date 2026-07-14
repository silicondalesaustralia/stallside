"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  try {
    await signIn("resend", {
      email,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // NextAuth uses NEXT_REDIRECT for successful verifyRequest redirects — rethrow those.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    if (error instanceof AuthError) {
      console.error("Magic link AuthError", error);
      throw new Error(
        "Could not send sign-in link. Verify stallside.app at resend.com/domains, or remove RESEND_API_KEY to print the link in the server logs.",
      );
    }
    console.error("Magic link failed", error);
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
