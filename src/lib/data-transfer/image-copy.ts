import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { put } from "@vercel/blob";
import { cleanEnvSecret } from "@/lib/env";
import { shrinkPhoto } from "@/lib/mobile/shrink-photo";

const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;

function privateAddress(ip: string): boolean {
  if (ip === "::1" || ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd")) return true;
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  const [a, b] = v4.split(".").map(Number);
  if (Number.isNaN(a)) return false;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

async function assertPublicHttps(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Image links must start with https://");
  const host = url.hostname;
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address);
  if (addresses.length === 0 || addresses.some(privateAddress)) {
    throw new Error("Image link points to a private address.");
  }
  return url;
}

/**
 * Downloads an image from a public link, resizes it like an app upload and stores it
 * under this business. Links already stored for this business are kept as they are.
 */
export async function copyImageToStand(raw: string, standId: string, folder: string): Promise<string> {
  if (raw.includes(`/stands/${standId}/`)) return raw;
  const token = cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN);
  if (!token) throw new Error("Image storage is not configured.");
  const url = await assertPublicHttps(raw);

  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Image download failed (${response.status}).`);
  const type = response.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) throw new Error("Link is not an image.");
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_SOURCE_BYTES) throw new Error("Image is larger than 15 MB.");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > MAX_SOURCE_BYTES) throw new Error("Image is larger than 15 MB.");

  const baseName = url.pathname.split("/").pop()?.replace(/[^\w.\-]+/g, "_").slice(0, 60) || "image";
  const shrunk = await shrinkPhoto(new File([bytes], baseName, { type }));
  const blob = await put(`stands/${standId}/${folder}/${Date.now()}-${shrunk.name}`, shrunk, {
    access: "public",
    token,
    contentType: shrunk.type,
  });
  return blob.url;
}

/** Copies a list of images, collecting failures as warnings instead of failing the import. */
export async function copyImages(
  urls: string[],
  standId: string,
  folder: string,
  warn: (message: string) => void,
): Promise<string[]> {
  const copied: string[] = [];
  for (const url of urls) {
    try {
      copied.push(await copyImageToStand(url, standId, folder));
    } catch (error) {
      warn(`${url}: ${error instanceof Error ? error.message : "could not copy image"}`);
    }
  }
  return copied;
}
