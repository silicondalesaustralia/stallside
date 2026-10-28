import { copyRemoteImage } from "@/lib/copy-remote-image";

/** Copy a Square CDN image into Vendl blob storage. Returns null when it can't. */
export async function copySquareImage(input: {
  url: string;
  standId: string;
  productId: string;
}): Promise<string | null> {
  return copyRemoteImage({ ...input, label: "Square" });
}
