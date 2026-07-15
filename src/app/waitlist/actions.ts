"use server";

import { prisma } from "@/lib/prisma";

export type JoinWaitlistResult =
  | { ok: true; alreadyJoined?: boolean }
  | { error: string };

export async function joinCardPaypalWaitlist(
  formData: FormData,
): Promise<JoinWaitlistResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (name.length < 2) {
    return { error: "Enter your name." };
  }
  if (name.length > 120) {
    return { error: "Name is too long." };
  }
  if (!email.includes("@") || email.length > 160) {
    return { error: "Enter a valid email." };
  }

  try {
    const existing = await prisma.waitlistEntry.findUnique({ where: { email } });
    if (existing) {
      await prisma.waitlistEntry.update({
        where: { email },
        data: { name },
      });
      return { ok: true, alreadyJoined: true };
    }

    await prisma.waitlistEntry.create({
      data: {
        name,
        email,
        plan: "card_paypal",
      },
    });
    return { ok: true };
  } catch (error) {
    console.error("Waitlist join failed", error);
    return { error: "Could not join the waitlist. Try again." };
  }
}
