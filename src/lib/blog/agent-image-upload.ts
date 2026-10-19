import { put } from "@vercel/blob";
import { z } from "zod";
import { cleanEnvSecret } from "@/lib/env";
import { slugifyBlogTitle } from "./slug";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export const agentImageSchema = z.object({
  /** Post slug: images live under blog/{folder}/. */
  folder: z.string().trim().min(1).max(100),
  /** SEO filename without extension, e.g. "home-baked-goods-market-table". */
  filename: z.string().trim().min(3).max(80),
  contentType: z.enum(["image/webp", "image/png", "image/jpeg"]),
  base64: z.string().min(100),
  width: z.number().int().positive().max(4096),
  height: z.number().int().positive().max(4096),
});

const EXTENSIONS: Record<z.infer<typeof agentImageSchema>["contentType"], string> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
};

/** Store an agent-generated image at blog/{post-slug}/{seo-filename}.{ext}. */
export async function uploadAgentImage(input: z.infer<typeof agentImageSchema>) {
  const token = cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN);
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is missing");
  const bytes = Buffer.from(input.base64, "base64");
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) throw new Error("Image must be under 3 MB");

  const folder = slugifyBlogTitle(input.folder) || "post";
  const filename = slugifyBlogTitle(input.filename) || "image";
  const blob = await put(`blog/${folder}/${filename}.${EXTENSIONS[input.contentType]}`, bytes, {
    access: "public",
    token,
    contentType: input.contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return { url: blob.url, width: input.width, height: input.height };
}
