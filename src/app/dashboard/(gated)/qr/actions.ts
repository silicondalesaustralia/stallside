"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { legacyLinkFields, validateQrTarget } from "@/lib/qr/validate-target";

export type QrActionResult = { error: string } | { ok: true };

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  standId: z.string().min(1),
  targetKind: z.string().min(1),
  targetId: z.string().nullable(),
  atStall: z.boolean(),
});

export type CreateQrInput = z.infer<typeof createSchema>;

export async function createQrCode(input: CreateQrInput): Promise<QrActionResult> {
  const { owner } = await requireOwnerWrite();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { error: "Give the QR code a name and pick a page." };
  const stand = await prisma.stand.findFirst({ where: { id: parsed.data.standId, ownerId: owner.id }, select: { id: true } });
  if (!stand) return { error: "Business not found." };
  const target = await validateQrTarget(owner.id, parsed.data.targetKind, parsed.data.targetId);
  if (!target) return { error: "That page isn't available any more. Pick another." };

  const qr = await prisma.qrCode.create({
    data: {
      ownerId: owner.id,
      standId: stand.id,
      name: parsed.data.name,
      targetKind: target.kind,
      targetId: target.id,
      atStall: parsed.data.atStall,
      ...legacyLinkFields(target),
    },
  });
  revalidatePath("/dashboard/qr");
  redirect(`/dashboard/qr/${qr.id}`);
}

const duplicateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  targetKind: z.string().min(1),
  targetId: z.string().nullable(),
});

/** New QR code with its own address, copying the poster set-up but opening another page. */
export async function duplicateQrCode(sourceId: string, input: z.infer<typeof duplicateSchema>): Promise<QrActionResult> {
  const { owner } = await requireOwnerWrite();
  const parsed = duplicateSchema.safeParse(input);
  if (!parsed.success) return { error: "Give the copy a name and pick a page." };
  const source = await prisma.qrCode.findFirst({
    where: { id: sourceId, ownerId: owner.id },
    select: { standId: true, poster: true, atStall: true },
  });
  if (!source) return { error: "QR not found." };
  const target = await validateQrTarget(owner.id, parsed.data.targetKind, parsed.data.targetId);
  if (!target) return { error: "That page isn't available any more. Pick another." };

  const qr = await prisma.qrCode.create({
    data: {
      ownerId: owner.id,
      standId: source.standId,
      name: parsed.data.name,
      targetKind: target.kind,
      targetId: target.id,
      atStall: source.atStall,
      poster: (source.poster ?? undefined) as Prisma.InputJsonValue | undefined,
      ...legacyLinkFields(target),
    },
  });
  revalidatePath("/dashboard/qr");
  redirect(`/dashboard/qr/${qr.id}`);
}

export async function updateQrCode(qrId: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const qr = await prisma.qrCode.findFirst({ where: { id: qrId, ownerId: owner.id }, select: { id: true } });
  if (!qr) return { error: "QR not found." };
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 1 || name.length > 80) return { error: "Name is required." };
  await prisma.qrCode.update({ where: { id: qr.id }, data: { name } });
  revalidatePath(`/dashboard/qr/${qr.id}`);
  revalidatePath("/dashboard/qr");
  return { ok: true as const };
}

export async function deleteQrCode(qrId: string) {
  const { owner } = await requireOwnerWrite();
  const qr = await prisma.qrCode.findFirst({
    where: { id: qrId, ownerId: owner.id },
    select: { id: true },
  });
  if (!qr) return { error: "QR not found." };

  await prisma.qrCode.delete({ where: { id: qr.id } });
  revalidatePath("/dashboard/qr");
  redirect("/dashboard/qr");
}
