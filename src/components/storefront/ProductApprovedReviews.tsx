import { prisma } from "@/lib/prisma";
import ReviewCard from "@/components/storefront/reviews/ReviewCard";
import ReviewForm from "@/components/storefront/reviews/ReviewForm";
import SectionCopy from "@/components/studio/SectionCopy";
import { PRODUCT_REVIEWS_ANCHOR } from "@/components/storefront/product/ProductRatingLink";

/** Approved reviews only — never show PENDING/REJECTED publicly. Optional "Leave a review" form below. */
export async function ProductApprovedReviews({
  ownerId,
  productId,
  storefrontSlug,
  showForm = false,
  className = "mt-10",
}: {
  ownerId: string;
  productId: string;
  storefrontSlug?: string;
  showForm?: boolean;
  /** Space above the divider line. */
  className?: string;
}) {
  const reviews = await prisma.review.findMany({
    where: {
      ownerId,
      productId,
      status: "APPROVED",
      rating: { gte: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      authorName: true,
      verified: true,
      sellerReply: true,
      customer: { select: { name: true } },
    },
  });

  const form = showForm && storefrontSlug ? <ReviewForm storefrontSlug={storefrontSlug} productId={productId} /> : null;
  if (reviews.length === 0 && !form) return null;

  return (
    <section id={PRODUCT_REVIEWS_ANCHOR} className={`scroll-mt-24 border-t border-[var(--line)] pt-8 ${className}`.trim()}>
      <h2 className="studio-heading text-xl">
        <SectionCopy k="reviewsHeading" fallback="Customer reviews" />
      </h2>
      {reviews.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-4">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={{
                id: r.id,
                rating: r.rating,
                title: r.title,
                body: r.body,
                customerName: r.authorName?.trim() || r.customer?.name?.trim() || "Customer",
                verified: r.verified,
                reply: r.sellerReply,
              }}
            />
          ))}
        </ul>
      ) : null}
      {form ? <div className="mt-6">{form}</div> : null}
    </section>
  );
}
