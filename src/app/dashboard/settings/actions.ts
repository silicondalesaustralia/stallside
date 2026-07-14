"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function parseAlertEmails(raw: string): string[] | { error: string } {
  const parts = raw
    .split(/[\n,;]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const unique = [...new Set(parts)];
  if (unique.length > 8) {
    return { error: "Add at most 8 extra alert emails." };
  }
  for (const email of unique) {
    if (!email.includes("@") || email.length > 160) {
      return { error: `Invalid email: ${email}` };
    }
  }
  return unique;
}

export async function updateAlertSettings(formData: FormData) {
  const { owner } = await requireOwner();
  const emailAlertsEnabled = formData.get("emailAlertsEnabled") === "on";
  const pushAlertsEnabled = formData.get("pushAlertsEnabled") === "on";
  const parsed = parseAlertEmails(String(formData.get("alertEmails") ?? ""));
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const primary = owner.contactEmail.trim().toLowerCase();
  const alertEmails = parsed.filter((email) => email !== primary);

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      emailAlertsEnabled,
      pushAlertsEnabled,
      alertEmails,
    },
  });

  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}
