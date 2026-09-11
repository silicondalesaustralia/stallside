import { put } from "@vercel/blob";
import { cleanEnvSecret } from "@/lib/env";
import { openaiApiKey, openaiApiKeyLooksInvalid } from "./config";
import type { WebsiteBusinessContext } from "./types";

export type DecorativeImageAssets = {
  heroUrl: string;
  storyUrl: string;
  heroAlt: string;
  storyAlt: string;
};

function imageModel(): string {
  return process.env.WEBSITE_AI_IMAGE_MODEL?.trim() || "dall-e-3";
}

function moodPrompt(
  kind: "hero" | "story",
  ctx: WebsiteBusinessContext,
): { prompt: string; alt: string } {
  const place = ctx.regionLabel ? `inspired by ${ctx.regionLabel} countryside` : "countryside mood";
  const mode =
    ctx.businessMode === "FOOD_BUSINESS"
      ? "artisan bakery and fresh food"
      : "farm produce and farm stand";
  if (kind === "hero") {
    return {
      prompt: `Wide photographic website hero mood image for a small ${mode} business, ${place}. Soft natural morning light, shallow depth of field, warm tones, empty wooden surface with seasonal produce suggestion only as soft shapes. No people, no faces, no hands, no readable text, no logos, no watermarks, no identifiable landmarks or real farm names.`,
      alt: "Soft morning light across a wooden surface",
    };
  }
  return {
    prompt: `Square photographic website story image for a small ${mode} business, ${place}. Quiet workshop or garden atmosphere, natural materials, gentle light. No people, no faces, no hands, no readable text, no logos, no watermarks, no identifiable landmarks.`,
    alt: "Quiet natural light in a working space",
  };
}

async function generateOneImage(
  key: string,
  prompt: string,
): Promise<{ bytes: Buffer; contentType: string }> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: imageModel(),
      prompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
      response_format: "b64_json",
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Image API HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const b64 = data.data?.[0]?.b64_json;
  if (b64) {
    return { bytes: Buffer.from(b64, "base64"), contentType: "image/png" };
  }
  const url = data.data?.[0]?.url;
  if (!url) throw new Error("Image API returned no image");
  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`Failed to download generated image (${imgRes.status})`);
  const bytes = Buffer.from(await imgRes.arrayBuffer());
  return { bytes, contentType: imgRes.headers.get("content-type") || "image/png" };
}

async function uploadBytes(
  ownerId: string,
  kind: string,
  bytes: Buffer,
  contentType: string,
): Promise<string> {
  const token = cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN);
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  const ext = contentType.includes("jpeg") ? "jpg" : "png";
  const blob = await put(
    `storefronts/${ownerId}/ai-decorative/${kind}-${Date.now()}.${ext}`,
    bytes,
    { access: "public", token, contentType },
  );
  return blob.url;
}

/** Generate hero + story decorative placeholders. Fails soft — caller may continue without. */
export async function generateDecorativePlaceholders(
  ctx: WebsiteBusinessContext,
): Promise<DecorativeImageAssets | null> {
  const key = openaiApiKey();
  if (!key || openaiApiKeyLooksInvalid(key)) return null;
  if (!cleanEnvSecret(process.env.BLOB_READ_WRITE_TOKEN)) return null;

  const heroSpec = moodPrompt("hero", ctx);
  const storySpec = moodPrompt("story", ctx);

  try {
    const [heroImg, storyImg] = await Promise.all([
      generateOneImage(key, heroSpec.prompt),
      generateOneImage(key, storySpec.prompt),
    ]);
    const [heroUrl, storyUrl] = await Promise.all([
      uploadBytes(ctx.ownerId, "hero", heroImg.bytes, heroImg.contentType),
      uploadBytes(ctx.ownerId, "story", storyImg.bytes, storyImg.contentType),
    ]);
    return {
      heroUrl,
      storyUrl,
      heroAlt: heroSpec.alt,
      storyAlt: storySpec.alt,
    };
  } catch (err) {
    console.error(
      "[website-ai] decorative image generation failed",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
