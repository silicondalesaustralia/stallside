import { materialsQuery } from "@/contracts/mobile/materials";
import {
  INVOICE_PHOTO_MAX_BYTES,
  INVOICE_UPLOAD_MAX_BYTES,
  type InvoiceScanResponse,
} from "@/contracts/mobile/invoice-scan";
import { requireMobileOwner, requireMobileStand } from "@/lib/mobile/require-owner";
import { loadScanMaterials } from "@/lib/mobile/materials-dto";
import { loadStandLocale } from "@/lib/mobile/stand-locale";
import { shrinkPhoto } from "@/lib/mobile/shrink-photo";
import { scanOwnerInvoice } from "@/lib/production/invoice-scan/scan-owner-invoice";
import { mobileError, mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

/** Reads an invoice photo (multipart field "file") with AI and returns lines to review. Saves nothing. */
export async function POST(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const query = readMobileQuery(request, materialsQuery);
  if (!query.ok) return query.response;
  const { owner } = guard.value;
  const stand = await requireMobileStand(owner.id, query.data.standId);
  if (!stand.ok) return stand.response;

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return mobileError(400, "Send the invoice as a form upload.");
  }
  if (!(file instanceof File) || file.size === 0) return mobileError(400, "Choose a photo of the invoice.");
  const isImage = file.type.startsWith("image/");
  if (file.size > (isImage ? INVOICE_PHOTO_MAX_BYTES : INVOICE_UPLOAD_MAX_BYTES)) {
    return mobileError(413, "That file is too large. Try another photo.");
  }

  try {
    const locale = await loadStandLocale(stand.value);
    const upload = isImage ? await shrinkPhoto(file) : file;
    const result = await scanOwnerInvoice(owner, upload, locale);
    if ("error" in result) return mobileError(422, result.error);
    const materials = await loadScanMaterials(owner.id);
    return mobileJson<InvoiceScanResponse>({ invoice: result.invoice, materials, currency: locale.currency });
  } catch (error) {
    return mobileServerError("Mobile invoice scan failed", error);
  }
}
