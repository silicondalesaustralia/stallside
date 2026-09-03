"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CustomOrderFieldType,
  CustomOrderRequestStatus,
} from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const FIELD_TYPES = new Set<string>(Object.values(CustomOrderFieldType));

async function uniqueFormSlug(ownerId: string, base: string, excludeId?: string) {
  let root = slugify(base) || "request";
  const taken = async (slug: string) => {
    const hit = await prisma.customOrderForm.findFirst({
      where: {
        ownerId,
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(hit);
  };
  if (!(await taken(root))) return root;
  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${root}-${i}`;
    if (!(await taken(candidate))) return candidate;
  }
  throw new Error("Could not allocate a slug");
}

function parseFields(formData: FormData) {
  const fields: {
    label: string;
    fieldType: CustomOrderFieldType;
    required: boolean;
    sortOrder: number;
  }[] = [];
  for (let i = 0; i < 5; i += 1) {
    const label = String(formData.get(`fieldLabel${i}`) ?? "").trim();
    if (!label) continue;
    const typeRaw = String(formData.get(`fieldType${i}`) ?? "TEXT").toUpperCase();
    const fieldType = FIELD_TYPES.has(typeRaw)
      ? (typeRaw as CustomOrderFieldType)
      : CustomOrderFieldType.TEXT;
    fields.push({
      label: label.slice(0, 120),
      fieldType,
      required: formData.get(`fieldRequired${i}`) === "on",
      sortOrder: fields.length,
    });
  }
  if (fields.length < 2) throw new Error("Add at least 2 custom fields");
  return fields.slice(0, 5);
}

export async function createCustomOrderForm(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 1) throw new Error("Title required");
  const slug = await uniqueFormSlug(
    owner.id,
    String(formData.get("slug") ?? "").trim() || title,
  );
  const fields = parseFields(formData);

  const created = await prisma.customOrderForm.create({
    data: {
      ownerId: owner.id,
      title,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
      thankYouNote: String(formData.get("thankYouNote") ?? "").trim() || null,
      fields: { create: fields },
    },
  });
  revalidatePath("/dashboard/forms");
  redirect(`/dashboard/forms/${created.id}`);
}

export async function updateCustomOrderForm(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.customOrderForm.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Form not found");

  await prisma.customOrderForm.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? "").trim() || "Custom order",
      description: String(formData.get("description") ?? "").trim() || null,
      thankYouNote: String(formData.get("thankYouNote") ?? "").trim() || null,
      isPublished: formData.get("isPublished") === "on",
    },
  });
  revalidatePath("/dashboard/forms");
  revalidatePath(`/dashboard/forms/${id}`);
  redirect(`/dashboard/forms/${id}`);
}

export async function setRequestStatus(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "").toUpperCase();
  const allowed: CustomOrderRequestStatus[] = [
    CustomOrderRequestStatus.REVIEWING,
    CustomOrderRequestStatus.ACCEPTED,
    CustomOrderRequestStatus.DECLINED,
    CustomOrderRequestStatus.CANCELLED,
  ];
  if (!allowed.includes(statusRaw as CustomOrderRequestStatus)) {
    throw new Error("Invalid status");
  }
  const req = await prisma.customOrderRequest.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true, status: true },
  });
  if (!req) throw new Error("Request not found");
  if (req.status === CustomOrderRequestStatus.CONVERTED) {
    throw new Error("Already converted");
  }

  await prisma.customOrderRequest.update({
    where: { id },
    data: {
      status: statusRaw as CustomOrderRequestStatus,
      sellerNotes: String(formData.get("sellerNotes") ?? "").trim() || undefined,
    },
  });
  revalidatePath(`/dashboard/forms/requests/${id}`);
  redirect(`/dashboard/forms/requests/${id}`);
}
