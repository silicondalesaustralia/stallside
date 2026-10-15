"use server";

import { prisma } from "@/lib/prisma";
import { assertRateLimit, clientIpFromHeaders, RateLimitError } from "@/lib/rate-limit";
import { reviewSubmissionError, reviewSubmissionSchema, type ReviewSubmitResult } from "./review-fields";
import { notifyOwnerOfReview } from "./notify-owner-review";

/** A shopper's review from the website form; held as PENDING until the seller approves it. */
export async function submitReview(input: unknown): Promise<ReviewSubmitResult> {
  const parsed = reviewSubmissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: reviewSubmissionError(input) ?? "Check your review and try again." };
  const data = parsed.data;
  if (data.website) return { ok: true };

  try {
    const ip = await clientIpFromHeaders();
    await assertRateLimit({ bucket: `review:${data.storefrontSlug}:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });

    const storefront = await prisma.storefront.findUnique({
      where: { slug: data.storefrontSlug.toLowerCase() },
      select: { ownerId: true },
    });
    if (!storefront) return { ok: false, error: "This shop couldn't be found." };
    const ownerId = storefront.ownerId;

    let productId: string | null = null;
    if (data.productId) {
      const product = await prisma.product.findFirst({
        where: { id: data.productId, ownerId },
        select: { id: true },
      });
      if (!product) return { ok: false, error: "This product couldn't be found." };
      productId = product.id;
    }

    const customer = await prisma.customer.findFirst({
      where: { ownerId, email: data.email },
      select: { id: true, _count: { select: { orders: true } } },
    });

    const review = await prisma.review.create({
      data: {
        ownerId,
        productId,
        customerId: customer?.id ?? null,
        rating: data.rating,
        title: data.title || null,
        body: data.body,
        authorName: data.name,
        authorEmail: data.email,
        verified: (customer?._count.orders ?? 0) > 0,
      },
      select: { id: true },
    });
    await notifyOwnerOfReview(review.id);
    return { ok: true };
  } catch (error) {
    if (error instanceof RateLimitError) return { ok: false, error: error.message };
    console.error("[submitReview]", error);
    return { ok: false, error: "Couldn't send your review. Please try again." };
  }
}
