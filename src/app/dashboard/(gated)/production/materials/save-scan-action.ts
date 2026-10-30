"use server";

import { requireOwnerWrite } from "@/lib/session";
import { failure, type ActionResult } from "@/lib/production/form-parse";
import type { SaveInvoiceInput } from "@/lib/production/invoice-scan/schema";
import { saveOwnerInvoice } from "@/lib/production/invoice-scan/save-owner-invoice";

/** Records every reviewed invoice line as a purchase, creating new materials where asked. */
export async function saveScannedInvoice(input: SaveInvoiceInput): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    return await saveOwnerInvoice(owner.id, input);
  } catch (error) {
    return failure("saveScannedInvoice failed", error);
  }
}
