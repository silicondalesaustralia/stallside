import { prisma } from "@/lib/prisma";
import { GREEN_VALLEY_DEMO_EMAIL } from "@/lib/demo/green-valley/constants";
import { GREEN_VALLEY_REVIEWS } from "@/lib/demo/green-valley/catalogue";

export type StorefrontReviewView = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  customerName: string;
};

/** Approved owner-level reviews for homepage trust sections */
export async function loadStorefrontReviews(
  ownerId: string,
  limit = 6,
): Promise<StorefrontReviewView[]> {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    select: { contactEmail: true },
  });
  if (owner?.contactEmail === GREEN_VALLEY_DEMO_EMAIL) {
    return GREEN_VALLEY_REVIEWS.slice(0, limit).map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      customerName: r.customerName,
    }));
  }

  const reviews = await prisma.review.findMany({
    where: {
      ownerId,
      status: "APPROVED",
      rating: { gte: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      customer: { select: { name: true } },
    },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    customerName: r.customer?.name?.trim() || "Customer",
  }));
}
