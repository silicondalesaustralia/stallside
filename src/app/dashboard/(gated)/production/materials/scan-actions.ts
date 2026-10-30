"use server";

import { requireOwnerWrite } from "@/lib/session";
import { scanOwnerInvoice } from "@/lib/production/invoice-scan/scan-owner-invoice";
import type { ScanResult } from "@/lib/production/invoice-scan/schema";
import { loadProductionScope } from "../production-scope";

/** Reads an invoice/receipt with AI and returns editable lines matched to the owner's materials. Saves nothing. */
export async function scanInvoice(formData: FormData): Promise<ScanResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo or PDF." };
    const scope = await loadProductionScope();
    return await scanOwnerInvoice(owner, file, { currency: scope.stand?.currency ?? "AUD", today: scope.today });
  } catch (error) {
    console.error("scanInvoice failed", error);
    return { error: "Scanning failed. Try again, or enter the purchase by hand." };
  }
}
