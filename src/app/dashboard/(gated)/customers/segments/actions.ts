"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  rulesToJson,
  SEGMENT_PRESETS,
  type SegmentRules,
} from "@/lib/grow/segments";

function parseOptionalInt(raw: FormDataEntryValue | null): number | undefined {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

export async function createSegmentFromPreset(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const key = String(formData.get("presetKey") ?? "").trim();
  const preset = SEGMENT_PRESETS[key];
  if (!preset) throw new Error("Unknown preset");

  await prisma.customerSegment.create({
    data: {
      ownerId: owner.id,
      name: preset.name,
      description: preset.description,
      presetKey: key,
      rules: rulesToJson(preset.rules),
    },
  });

  revalidatePath("/dashboard/customers/segments");
  redirect("/dashboard/customers/segments");
}

export async function createCustomSegment(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 1) throw new Error("Name required");

  const rules: SegmentRules = {};
  const minOrders = parseOptionalInt(formData.get("minOrders"));
  if (minOrders != null) rules.minOrders = minOrders;
  const daysSince = parseOptionalInt(formData.get("daysSinceLastOrderMin"));
  if (daysSince != null) rules.daysSinceLastOrderMin = daysSince;
  if (formData.get("marketingConsent") === "on") {
    rules.marketingConsent = true;
  }

  await prisma.customerSegment.create({
    data: {
      ownerId: owner.id,
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      presetKey: "custom",
      rules: rulesToJson(rules),
    },
  });

  revalidatePath("/dashboard/customers/segments");
  redirect("/dashboard/customers/segments");
}

export async function archiveSegment(formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.customerSegment.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });
  if (!existing) throw new Error("Segment not found");

  await prisma.customerSegment.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/dashboard/customers/segments");
  redirect("/dashboard/customers/segments");
}
