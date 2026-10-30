import { saveInvoiceBody } from "@/contracts/mobile/invoice-scan";
import type { MaterialsMessage } from "@/contracts/mobile/materials";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { saveOwnerInvoice } from "@/lib/production/invoice-scan/save-owner-invoice";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Records the reviewed invoice lines as purchases, creating new materials where asked. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, saveInvoiceBody);
  if (!body.ok) return body.response;
  try {
    const result = await saveOwnerInvoice(guard.value.owner.id, body.data);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<MaterialsMessage>({ message: result.message ?? "Invoice recorded." });
  } catch (error) {
    return mobileServerError("Mobile save invoice failed", error);
  }
}
