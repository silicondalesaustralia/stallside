"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

async function sendMagicLink(email: string) {
  try {
    await signIn("resend", {
      email,
      redirectTo: "/dashboard",
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
      console.error("Magic link AuthError", error);
      throw new Error(
        "Could not send sign-in link. Verify stallside.app at resend.com/domains, or remove RESEND_API_KEY to print the link in the server logs.",
      );
    }
    console.error("Magic link failed", error);
    throw error;
  }
}

export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  await sendMagicLink(email);
}

/** Frictionless signup: name + email → 30-day trial (no card), magic link. */
export async function requestSignup(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
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

  await sendMagicLink(email);
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
