"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

function isValidAbn(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return false;
  const sum = digits
    .split("")
    .map(Number)
    .reduce((acc, d, i) => acc + (i === 0 ? d - 1 : d) * ABN_WEIGHTS[i], 0);
  return sum % 89 === 0;
}

export async function updateGstSettings(formData: FormData) {
  try {
    const { owner } = await requireOwnerWrite();
    const gstRegistered = formData.get("gstRegistered") === "on";
    const abn = String(formData.get("abn") ?? "").replace(/\s/g, "");
    if (abn && !isValidAbn(abn)) {
      return { error: "That ABN doesn't look right - check the 11 digits." };
    }
    if (gstRegistered && !abn) {
      return { error: "Add your ABN to turn on GST." };
    }
    await prisma.owner.update({
      where: { id: owner.id },
      data: { gstRegistered, abn: abn || null },
    });
    revalidatePath("/dashboard/settings");
    return { ok: true as const };
  } catch (error) {
    console.error("updateGstSettings failed", error);
    return { error: "Could not save GST settings." };
  }
}
