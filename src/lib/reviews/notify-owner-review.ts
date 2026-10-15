import { APP_DOMAIN } from "@/lib/constants";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { sendOwnerEmail } from "@/lib/notify-email";
import { prisma } from "@/lib/prisma";

/** Emails the seller that a review is waiting for approval. Never throws. */
export async function notifyOwnerOfReview(reviewId: string): Promise<void> {
  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        rating: true,
        body: true,
        authorName: true,
        productId: true,
        owner: { select: { contactEmail: true, businessName: true } },
      },
    });
    if (!review?.owner.contactEmail) return;
    const product = review.productId
      ? await prisma.product.findUnique({ where: { id: review.productId }, select: { name: true } })
      : null;
    const about = product ? `about ${product.name}` : `about ${review.owner.businessName}`;
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const link = `https://${APP_DOMAIN}/dashboard/reviews`;
    await sendOwnerEmail(
      review.owner.contactEmail,
      `New ${review.rating}-star review ${about}`,
      `<p>${escapeHtml(review.authorName ?? "A customer")} left a review ${escapeHtml(about)}:</p>
       <p style="font-size:18px">${stars}</p>
       <blockquote style="margin:0;padding-left:12px;border-left:3px solid #ddd">${escapeHtml(review.body)}</blockquote>
       <p>It won't show on your website until you approve it.</p>
       <p><a href="${link}">Review it in your dashboard</a></p>`,
      { kind: "review-new" },
    );
  } catch (error) {
    console.error("[notifyOwnerOfReview]", error);
  }
}
