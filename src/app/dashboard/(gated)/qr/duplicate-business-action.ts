"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { posterFromStand } from "@/lib/qr/poster";
import { legacyLinkFields, validateQrTarget } from "@/lib/qr/validate-target";
import type { QrActionResult } from "./actions";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  targetKind: z.string().min(1),
  targetId: z.string().nullable(),
});

/** New QR code for another page, starting from the business's main poster design. */
export async function duplicateBusinessQr(standId: string, input: z.infer<typeof schema>): Promise<QrActionResult> {
  const { owner } = await requireOwnerWrite();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Give the copy a name and pick a page." };
  const stand = await prisma.stand.findFirst({ where: { id: standId, ownerId: owner.id } });
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
      poster: posterFromStand(stand),
      ...legacyLinkFields(target),
    },
  });
  revalidatePath("/dashboard/qr");
  redirect(`/dashboard/qr/${qr.id}`);
}
