"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function submitCustomOrderRequest(formData: FormData) {
  const formId = String(formData.get("formId") ?? "");
  const form = await prisma.customOrderForm.findFirst({
    where: { id: formId, isPublished: true },
    include: { fields: { orderBy: { sortOrder: "asc" } } },
  });
  if (!form) throw new Error("Form not available");

  // Honeypot
  if (String(formData.get("website") ?? "").trim()) {
    redirect(`/f/${formId}?thanks=1`);
  }

  const customerName = String(formData.get("customerName") ?? "").trim();
  if (customerName.length < 1) throw new Error("Name required");
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;

  const answers: Record<string, string> = {};
  for (const field of form.fields) {
    const raw = String(formData.get(`field_${field.id}`) ?? "").trim();
    if (field.required && !raw) {
      throw new Error(`${field.label} is required`);
    }
    if (raw) answers[field.label] = raw.slice(0, 2000);
  }

  await prisma.customOrderRequest.create({
    data: {
      ownerId: form.ownerId,
      formId: form.id,
      customerName: customerName.slice(0, 120),
      email: email?.slice(0, 200) ?? null,
      phone: phone?.slice(0, 40) ?? null,
      answers,
    },
  });

  revalidatePath(`/dashboard/forms/${form.id}`);
  redirect(`/f/${formId}?thanks=1`);
}
