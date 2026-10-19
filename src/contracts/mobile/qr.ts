import { z } from "zod";

export const mobileQrCode = z.object({
  id: z.string(),
  name: z.string(),
  standName: z.string(),
  destination: z.object({ label: z.string(), path: z.string() }).nullable(),
  atStall: z.boolean(),
  url: z.string(),
});
export type MobileQrCode = z.infer<typeof mobileQrCode>;

export const qrCodesResponse = z.object({ codes: z.array(mobileQrCode) });
export type QrCodesResponse = z.infer<typeof qrCodesResponse>;

export const QR_KINDS = ["business", "code"] as const;
export const qrKind = z.enum(QR_KINDS);
export type QrKind = z.infer<typeof qrKind>;

/** A single QR ready to show full screen: "business" is a business's main QR, "code" a saved page QR. */
export const qrImageResponse = z.object({
  kind: qrKind,
  id: z.string(),
  name: z.string(),
  url: z.string(),
  /** PNG as a data: URL. */
  image: z.string(),
  /** Dashboard page with the poster designer. */
  webPath: z.string(),
});
export type QrImageResponse = z.infer<typeof qrImageResponse>;
