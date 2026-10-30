import { prisma } from "@/lib/prisma";
import type { TaxOwner } from "@/lib/tax/config";
import { buildReview } from "./build-review";
import { extractInvoice } from "./extract";
import type { ScanResult } from "./schema";
import { defaultCostBasis, scanTaxRegion } from "./tax-region";
import { INVOICE_MAX_BYTES, INVOICE_TYPES, uploadInvoiceDocument } from "./upload";
import { recordScanUsage, scanLimitReached } from "./usage";

async function findDuplicate(ownerId: string, invoiceNumber: string | null): Promise<string | null> {
  if (!invoiceNumber) return null;
  const existing = await prisma.ingredientPurchase.findFirst({
    where: { invoiceNumber: { equals: invoiceNumber, mode: "insensitive" }, ingredient: { ownerId } },
    select: { receivedAt: true },
  });
  return existing ? existing.receivedAt.toISOString().slice(0, 10) : null;
}

/** Reads an invoice/receipt with AI and returns editable lines matched to the owner's materials. Saves nothing. */
export async function scanOwnerInvoice(
  owner: TaxOwner & { id: string },
  file: File,
  ctx: { currency: string; today: string },
): Promise<ScanResult> {
  if (file.size === 0) return { error: "Choose a photo or PDF." };
  if (!INVOICE_TYPES.has(file.type)) return { error: "Use a JPEG, PNG, WebP photo or a PDF." };
  if (file.size > INVOICE_MAX_BYTES) return { error: "That file is over 5 MB. Try a smaller photo or PDF." };
  if (await scanLimitReached(owner.id)) return { error: "You've hit this month's scan limit. Enter purchases by hand for now." };

  const region = scanTaxRegion(owner, ctx.currency);
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const [extracted, receiptUrl] = await Promise.all([
    extractInvoice({ mimeType: file.type, base64, name: file.name }, { currency: ctx.currency, taxLabel: region.label }),
    uploadInvoiceDocument(owner.id, file),
  ]);
  await recordScanUsage(owner.id, extracted.model, extracted.usage, extracted.ok ? "success" : "failed");
  if (!extracted.ok) return { error: extracted.error };

  const [materials, duplicateOf] = await Promise.all([
    prisma.ingredient.findMany({
      where: { ownerId: owner.id, isActive: true },
      select: { id: true, name: true, supplier: true },
    }),
    findDuplicate(owner.id, extracted.invoice.invoiceNumber),
  ]);
  const invoice = buildReview(extracted.invoice, {
    materials,
    region,
    costBasis: defaultCostBasis(owner, ctx.currency),
    today: ctx.today,
    receiptUrl,
    duplicateOf,
  });
  return { ok: true, invoice };
}
