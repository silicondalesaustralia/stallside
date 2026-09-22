"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function updateCustomerNotes(
  customerId: string,
  formData: FormData,
) {
  const { owner } = await requireOwnerWrite();
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, ownerId: owner.id },
    select: { id: true },
  });
  if (!customer) redirect("/dashboard/customers");

  const notes =
    String(formData.get("notes") ?? "").trim().slice(0, 4000) || null;
  await prisma.customer.update({
    where: { id: customer.id },
    data: { notes },
  });

  revalidatePath(`/dashboard/customers/${customerId}`);
  revalidatePath("/dashboard/customers");
  redirect(`/dashboard/customers/${customerId}?saved=1`);
}
