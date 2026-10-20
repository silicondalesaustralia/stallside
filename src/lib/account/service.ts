import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type Result = { ok: true } | { error: string };

/** The account-wide name shown across the dashboard (each business keeps its own name). */
export async function updateOwnerBusinessName(ownerId: string, raw: string): Promise<Result> {
  const businessName = raw.trim();
  if (businessName.length < 2) return { error: "Enter a business name (at least 2 characters)." };
  if (businessName.length > 120) return { error: "Business name is too long." };

  await prisma.owner.update({ where: { id: ownerId }, data: { businessName } });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
