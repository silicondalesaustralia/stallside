import { put } from "@vercel/blob";
import { cleanEnvSecret } from "@/lib/env";

export const INVOICE_MAX_BYTES = 5 * 1024 * 1024;
export const INVOICE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

/** Stores the original document so purchases can link back to it. Returns null when Blob isn't configured or fails. */
export async function uploadInvoiceDocument(ownerId: string, file: File): Promise<string | null> {
  const token = cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN);
  if (!token) return null;
  try {
    const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1] ?? "jpg";
    const blob = await put(`owners/${ownerId}/invoices/${Date.now()}.${ext}`, file, {
      access: "public",
      token,
      contentType: file.type,
      addRandomSuffix: true,
    });
    return blob.url;
  } catch (err) {
    console.error("[invoice-scan] receipt upload failed", err instanceof Error ? err.message : err);
    return null;
  }
}
