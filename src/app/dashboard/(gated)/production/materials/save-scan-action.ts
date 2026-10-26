"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { failure, type ActionResult } from "@/lib/production/form-parse";
import { saveInvoiceSchema, type SaveInvoiceInput } from "@/lib/production/invoice-scan/schema";
import { purchaseUnitError, writePurchase } from "@/lib/production/record-purchase";
import { convertQuantity, type Unit } from "@/lib/production/unit-convert";
import { guessMaterialKind } from "@/lib/production/material-kind";

type Material = { id: string; name: string; baseUnit: Unit; supplier: string | null };

/** Records every reviewed invoice line as a purchase, creating new materials where asked. */
export async function saveScannedInvoice(input: SaveInvoiceInput): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const parsed = saveInvoiceSchema.safeParse(input);
    if (!parsed.success) return { error: "Check each line has a material, quantity and cost." };
    const invoice = parsed.data;
    if (invoice.receiptUrl && !new URL(invoice.receiptUrl).hostname.endsWith(".blob.vercel-storage.com")) {
      return { error: "Invalid receipt link." };
    }

    const existingIds = invoice.lines.map((l) => l.materialId).filter((id) => id !== "new");
    const existing = await prisma.ingredient.findMany({
      where: { ownerId: owner.id, id: { in: existingIds } },
      select: { id: true, name: true, baseUnit: true, supplier: true },
    });
    const byId = new Map<string, Material>(existing.map((m) => [m.id, m]));
    for (const line of invoice.lines) {
      if (line.materialId === "new") {
        const base = line.newBaseUnit ?? line.unit;
        if (convertQuantity(1, line.unit, base) == null) return { error: `${line.description}: pick a matching unit.` };
        continue;
      }
      const material = byId.get(line.materialId);
      if (!material) return { error: `${line.description}: material not found.` };
      if (convertQuantity(1, line.unit, material.baseUnit) == null) {
        return { error: purchaseUnitError(material.name, material.baseUnit) };
      }
    }

    const supplier = invoice.supplier || null;
    const receivedAt = new Date(`${invoice.invoiceDate}T12:00:00Z`);
    await prisma.$transaction(async (tx) => {
      for (const line of invoice.lines) {
        const ingredient =
          line.materialId === "new"
            ? await tx.ingredient.create({
                data: {
                  ownerId: owner.id,
                  name: line.description,
                  kind: guessMaterialKind(line.description),
                  baseUnit: line.newBaseUnit ?? line.unit,
                  purchaseQuantity: line.quantity,
                  purchaseUnit: line.unit,
                  purchasePriceCents: line.totalCents,
                  supplier,
                },
                select: { id: true, name: true, baseUnit: true, supplier: true },
              })
            : byId.get(line.materialId);
        if (!ingredient) throw new Error(`${line.description}: material not found.`);
        await writePurchase(tx, {
          ingredient,
          quantity: line.quantity,
          unit: line.unit,
          totalCents: line.totalCents,
          supplier,
          invoiceNumber: invoice.invoiceNumber || null,
          receiptUrl: invoice.receiptUrl,
          receivedAt,
        });
      }
    }, { timeout: 30_000 });

    revalidatePath("/dashboard/production", "layout");
    const count = invoice.lines.length;
    return { ok: true, message: `Recorded ${count} purchase${count === 1 ? "" : "s"}. Recipe costs are updated.` };
  } catch (error) {
    return failure("saveScannedInvoice failed", error);
  }
}
