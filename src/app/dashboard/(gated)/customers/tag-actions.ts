"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function addCustomerTag(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const customerId = String(formData.get("customerId") ?? "");
  const name = String(formData.get("tag") ?? "").trim().slice(0, 40);
  if (!name) throw new Error("Tag required");

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, ownerId: owner.id },
    select: { id: true },
  });
  if (!customer) redirect("/dashboard/customers");

  const tag = await prisma.customerTag.upsert({
    where: { ownerId_name: { ownerId: owner.id, name } },
    create: { ownerId: owner.id, name },
    update: {},
  });

  await prisma.customerTagLink.upsert({
    where: {
      customerId_tagId: { customerId, tagId: tag.id },
    },
    create: { customerId, tagId: tag.id },
    update: {},
  });

  revalidatePath(`/dashboard/customers/${customerId}`);
  redirect(`/dashboard/customers/${customerId}`);
}

export async function removeCustomerTag(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const customerId = String(formData.get("customerId") ?? "");
  const tagId = String(formData.get("tagId") ?? "");

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, ownerId: owner.id },
    select: { id: true },
  });
  if (!customer) redirect("/dashboard/customers");

  const tag = await prisma.customerTag.findFirst({
    where: { id: tagId, ownerId: owner.id },
    select: { id: true },
  });
  if (!tag) redirect(`/dashboard/customers/${customerId}`);

  await prisma.customerTagLink.deleteMany({
    where: { customerId, tagId },
  });

  revalidatePath(`/dashboard/customers/${customerId}`);
  redirect(`/dashboard/customers/${customerId}`);
}
