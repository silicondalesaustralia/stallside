"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { sendOwnerEmail } from "@/lib/notify-email";
import { appBaseUrl } from "@/lib/app-url";
import { APP_NAME } from "@/lib/constants";

export async function inviteSupplier(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!name || name.length > 80) return { error: "Enter their name." };
  if (!email.includes("@") || email.length > 200) {
    return { error: "Enter their email." };
  }

  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) return { error: "Choose a stand first." };

  const token = randomBytes(24).toString("hex");
  try {
    const existing = await prisma.standMember.findUnique({
      where: { standId_email: { standId: selected.id, email } },
    });
    if (existing?.status === "ACTIVE") {
      return { error: "They already have access to this stand." };
    }
    if (existing) {
      await prisma.standMember.update({
        where: { id: existing.id },
        data: { name, status: "INVITED", inviteToken: token },
      });
    } else {
      await prisma.standMember.create({
        data: {
          standId: selected.id,
          ownerId: owner.id,
          email,
          name,
          inviteToken: token,
        },
      });
    }

    const link = `${appBaseUrl()}/supply/invite/${token}`;
    await sendOwnerEmail(
      email,
      `[${APP_NAME}] Add your products to ${selected.name}`,
      `<p>${name}, ${owner.businessName} invited you to add products and update stock for ${selected.name}.</p><p><a href="${link}">Accept invite</a></p>`,
      { kind: "supplier_invite" },
    );
  } catch (error) {
    console.error("Supplier invite failed", error);
    return { error: "Could not send the invite." };
  }

  revalidatePath("/dashboard/suppliers");
  return { ok: true as const };
}
