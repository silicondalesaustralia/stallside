"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sanitizeSignHtml } from "@/lib/sanitize-sign-html";
import { qrPosterSchema } from "@/lib/qr/poster";
import { legacyLinkFields, validateQrTarget } from "@/lib/qr/validate-target";
import type { QrActionResult } from "../actions";

async function ownedQr(qrId: string) {
  const { owner } = await requireOwnerWrite();
  const qr = await prisma.qrCode.findFirst({ where: { id: qrId, ownerId: owner.id }, select: { id: true } });
  return { owner, qr };
}

function refresh(qrId: string) {
  revalidatePath(`/dashboard/qr/${qrId}`);
  revalidatePath("/dashboard/qr");
}

/** Points an existing QR (and every poster already printed with it) at another page. */
export async function setQrTarget(qrId: string, targetKind: string, targetId: string | null): Promise<QrActionResult> {
  try {
    const { owner, qr } = await ownedQr(qrId);
    if (!qr) return { error: "QR not found." };
    const target = await validateQrTarget(owner.id, targetKind, targetId);
    if (!target) return { error: "That page isn't available any more. Pick another." };
    await prisma.qrCode.update({
      where: { id: qr.id },
      data: { targetKind: target.kind, targetId: target.id, ...legacyLinkFields(target) },
    });
    refresh(qr.id);
    return { ok: true };
  } catch (err) {
    console.error("[qr] set target failed", err instanceof Error ? err.message : err);
    return { error: "Could not change the page. Please try again." };
  }
}

const saveSchema = z.object({
  name: z.string().trim().min(1).max(80),
  atStall: z.boolean(),
  poster: qrPosterSchema,
});

export async function saveQrDesign(qrId: string, input: z.infer<typeof saveSchema>): Promise<QrActionResult> {
  try {
    const { qr } = await ownedQr(qrId);
    if (!qr) return { error: "QR not found." };
    const parsed = saveSchema.safeParse(input);
    if (!parsed.success) return { error: "Check the poster details and try again." };
    const p = parsed.data.poster;
    const poster = {
      ...p,
      qrCallout: p.qrCallout ? sanitizeSignHtml(p.qrCallout, true) : "",
      qrSignMessage: p.qrSignMessage ? sanitizeSignHtml(p.qrSignMessage, true) : "",
      description: p.description ? sanitizeSignHtml(p.description, true) : "",
    };
    await prisma.qrCode.update({
      where: { id: qr.id },
      data: { name: parsed.data.name, atStall: parsed.data.atStall, poster },
    });
    refresh(qr.id);
    return { ok: true };
  } catch (err) {
    console.error("[qr] save design failed", err instanceof Error ? err.message : err);
    return { error: "Could not save. Please try again." };
  }
}
