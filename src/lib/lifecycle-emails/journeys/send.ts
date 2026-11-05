import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOwnerEmail } from "@/lib/notify-email";
import { recipient } from "@/lib/lifecycle-emails/cron-helpers";
import { JONO_REPLY_TO, jonoFrom } from "@/lib/lifecycle-emails/html";
import { doneForYouLive } from "./config";
import { renderJourneyEmail } from "./render";
import type { Adoption, JourneyEmail } from "./types";

export const JOURNEY_OWNER_SELECT = {
  id: true,
  businessName: true,
  contactEmail: true,
  country: true,
  createdAt: true,
  user: { select: { email: true, name: true } },
  stands: { select: { currency: true }, orderBy: { createdAt: "asc" }, take: 1 },
} satisfies Prisma.OwnerSelect;

export type JourneyOwner = Prisma.OwnerGetPayload<{ select: typeof JOURNEY_OWNER_SELECT }>;
export type DeliveryResult = "sent" | "skipped" | "failed" | "duplicate";

function ownerCurrency(owner: JourneyOwner): string {
  return owner.stands[0]?.currency ?? (owner.country === "AU" ? "AUD" : "USD");
}

function skipReason(email: JourneyEmail, adoption: Adoption | null): string | null {
  if (email.requiresDfy && !doneForYouLive()) return "dfy_off";
  if (email.skipWhen && adoption?.[email.skipWhen]) return email.skipWhen;
  return null;
}

async function claim(ownerId: string, emailKey: string, status: "sent" | "skipped"): Promise<boolean> {
  try {
    await prisma.lifecycleEmailSend.create({ data: { ownerId, emailKey, status } });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return false;
    throw error;
  }
}

/**
 * Sends one journey email, or records it as skipped when the owner already uses the tool
 * (or Done-For-You is off). The row is claimed first so a stage is never sent twice.
 */
export async function deliverJourneyEmail(
  owner: JourneyOwner,
  email: JourneyEmail,
  adoption: Adoption | null,
): Promise<DeliveryResult> {
  const to = recipient(owner);
  const reason = to ? skipReason(email, adoption) : "no_email";
  if (reason || !to) {
    return (await claim(owner.id, email.key, "skipped")) ? "skipped" : "duplicate";
  }
  if (!(await claim(owner.id, email.key, "sent"))) return "duplicate";

  try {
    const html = renderJourneyEmail(email, {
      name: to.name,
      currency: ownerCurrency(owner),
      dfyLive: doneForYouLive(),
    });
    await sendOwnerEmail(to.to, email.subject, html, {
      from: jonoFrom(),
      replyTo: JONO_REPLY_TO,
      kind: `journey_${email.key}`,
    });
    return "sent";
  } catch (error) {
    console.error("[lifecycle] journey email failed", owner.id, email.key, error);
    await prisma.lifecycleEmailSend
      .delete({ where: { ownerId_emailKey: { ownerId: owner.id, emailKey: email.key } } })
      .catch((cleanupError: unknown) => console.error("[lifecycle] journey claim cleanup failed", cleanupError));
    return "failed";
  }
}
