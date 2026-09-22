"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureCustomer } from "@/lib/catalogue/customers";
import { parseCustomerCsv } from "@/lib/crm/parse-customer-csv";
import { isStandingListPreset } from "@/lib/crm/segment-rules";
import { rulesToJson, type SegmentRules } from "@/lib/crm/segments";

export async function createListFromRules(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  if (!name) return { error: "Name is required." };

  const productIds = formData
    .getAll("productId")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const preOrderOnly = formData.get("preOrderOnly") === "on";
  const marketingConsentOnly = formData.get("marketingConsentOnly") === "on";
  const daysRaw = String(formData.get("purchasedWithinDays") ?? "").trim();
  const purchasedWithinDays = daysRaw
    ? Number.parseInt(daysRaw, 10)
    : undefined;

  if (!productIds.length && !preOrderOnly) {
    return { error: "Choose products and/or pre-order customers." };
  }

  const owned =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { ownerId: owner.id, id: { in: productIds } },
          select: { id: true },
        })
      : [];
  if (productIds.length > 0 && owned.length === 0) {
    return { error: "Product not found." };
  }

  const rules: SegmentRules = {
    ...(owned.length ? { productIds: owned.map((p) => p.id) } : {}),
    ...(preOrderOnly ? { preOrderOnly: true } : {}),
    ...(marketingConsentOnly ? { marketingConsentOnly: true } : {}),
    ...(purchasedWithinDays && Number.isFinite(purchasedWithinDays)
      ? { purchasedWithinDays }
      : {}),
    requireEmail: true,
  };

  await prisma.customerSegment.create({
    data: {
      ownerId: owner.id,
      name,
      description:
        String(formData.get("description") ?? "").trim().slice(0, 400) || null,
      presetKey: "rule",
      rules: rulesToJson(rules),
    },
  });

  revalidatePath("/dashboard/customers/lists");
  redirect("/dashboard/customers/lists");
}

export async function createListFromCsv(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  if (!name) return { error: "Name is required." };

  const csvText = String(formData.get("csv") ?? "");
  const parsed = parseCustomerCsv(csvText);
  if (parsed.error) return { error: parsed.error };

  const ids: string[] = [];
  for (const row of parsed.rows) {
    const customer = await ensureCustomer({
      ownerId: owner.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      source: "csv_list",
    });
    if (customer) ids.push(customer.id);
  }
  if (ids.length === 0) return { error: "Could not import any contacts." };

  const rules: SegmentRules = {
    staticCustomerIds: ids,
    requireEmail: true,
  };

  await prisma.customerSegment.create({
    data: {
      ownerId: owner.id,
      name,
      description: `Imported ${ids.length} contacts from CSV`,
      presetKey: "csv",
      rules: rulesToJson(rules),
    },
  });

  revalidatePath("/dashboard/customers/lists");
  redirect("/dashboard/customers/lists");
}

export async function archiveList(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.customerSegment.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true, presetKey: true },
  });
  if (!existing) redirect("/dashboard/customers/lists");
  if (isStandingListPreset(existing.presetKey)) {
    redirect("/dashboard/communication");
  }

  await prisma.customerSegment.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/dashboard/customers/lists");
  redirect("/dashboard/customers/lists");
}
