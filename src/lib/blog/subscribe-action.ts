"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type BlogSubscribeResult = { ok: true } | { error: string };

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  sourceSlug: z.string().trim().max(120).optional(),
});

export async function subscribeToBlog(formData: FormData): Promise<BlogSubscribeResult> {
  if (String(formData.get("website") ?? "").trim()) return { ok: true };

  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    sourceSlug: formData.get("sourceSlug") || undefined,
  });
  if (!parsed.success) return { error: "Enter a valid email." };

  const { email, sourceSlug } = parsed.data;
  try {
    await prisma.blogSubscriber.upsert({
      where: { email },
      create: { email, sourceSlug },
      update: { unsubscribedAt: null },
    });
    return { ok: true };
  } catch (error) {
    console.error("[blog] subscribe failed", error);
    return { error: "Could not sign you up. Try again." };
  }
}
