"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PromotionType } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dollarsToCents } from "@/lib/money";

function parsePromoType(raw: FormDataEntryValue | null): PromotionType {
  const v = String(raw ?? "").toUpperCase();
  if (v === "FIXED_OFF") return PromotionType.FIXED_OFF;
  return PromotionType.PERCENT_OFF;
}

function parseOptionalDate(raw: FormDataEntryValue | null): Date | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseOptionalInt(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function promoFields(formData: FormData) {
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  if (!code) throw new Error("Code required");
  const name = String(formData.get("name") ?? "").trim() || code;
  const type = parsePromoType(formData.get("type"));
  const percentOff =
    type === PromotionType.PERCENT_OFF
      ? Math.min(100, Math.max(1, parseOptionalInt(formData.get("percentOff")) ?? 10))
      : null;
  const amountRaw = String(formData.get("amountOff") ?? "").trim();
  const amountOffCents =
    type === PromotionType.FIXED_OFF
      ? dollarsToCents(amountRaw || "0")
      : null;
  const minOrderRaw = String(formData.get("minOrder") ?? "").trim();
  const minOrderCents = minOrderRaw ? dollarsToCents(minOrderRaw) : 0;

  return {
    code,
    name,
    type,
    percentOff,
    amountOffCents,
    minOrderCents,
    startsAt: parseOptionalDate(formData.get("startsAt")),
    endsAt: parseOptionalDate(formData.get("endsAt")),
    usageLimit: parseOptionalInt(formData.get("usageLimit")),
    firstOrderOnly: formData.get("firstOrderOnly") === "on",
  };
}

export async function createPromotion(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const data = promoFields(formData);
  await prisma.promotion.create({
    data: { ownerId: owner.id, ...data },
  });
  revalidatePath("/dashboard/coupons");
  redirect("/dashboard/coupons");
}

export async function updatePromotion(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.promotion.findFirst({
    where: { id, ownerId: owner.id },
  });
  if (!existing) throw new Error("Promotion not found");

  const data = promoFields(formData);
  await prisma.promotion.update({
    where: { id },
    data,
  });
  revalidatePath("/dashboard/coupons");
  redirect("/dashboard/coupons");
}

export async function archivePromotion(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.promotion.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Promotion not found");

  await prisma.promotion.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/dashboard/coupons");
  redirect("/dashboard/coupons");
}
