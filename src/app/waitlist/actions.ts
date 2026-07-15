"use server";

import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
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

    try {
      await sendWaitlistThanks(email, name);
    } catch (error) {
      console.error("Waitlist confirmation email failed", error);
    }

    return { ok: true };
  } catch (error) {
    console.error("Waitlist join failed", error);
    return { error: "Could not join the waitlist. Try again." };
  }
}

async function sendWaitlistThanks(to: string, name: string) {
  const safeName = escapeHtml(name);
  await sendOwnerEmail(
    to,
    `Thanks for joining the Tap & Go waitlist for ${APP_NAME}`,
    `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#182C1B">
        <p style="font-size:18px;font-weight:600">You're on the Tap &amp; Go waitlist</p>
        <p>Hi ${safeName},</p>
        <p>
          Thanks for joining the Tap &amp; Go waitlist for ${APP_NAME}.
          You&apos;ll be the first to know once it&apos;s launched.
        </p>
        <p style="font-size:12px;color:#56684F">From the ${APP_NAME} team</p>
      </div>
    `,
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
