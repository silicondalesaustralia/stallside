import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import MarketingDashboardSection from "@/components/MarketingDashboardSection";
import MarketingPageShell from "@/components/MarketingPageShell";
import FeaturedStandCard from "@/components/gallery/FeaturedStandCard";
import StandsCollage from "@/components/gallery/StandsCollage";
import { APP_NAME } from "@/lib/constants";
import { featuredStands } from "@/lib/featured-stands";
import { prisma } from "@/lib/prisma";
import { GalleryStatus } from "@/generated/prisma/client";
import { marketingPageGraphSchema } from "@/lib/schema";
import { testimonials } from "@/lib/testimonials";

const title = "Testimonials & gallery";
const description = `Real roadside stands running ${APP_NAME}, and what their owners say about setting up and selling.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/testimonials-and-gallery" },
};

export default async function TestimonialsAndGalleryPage() {
  const photos = await prisma.galleryStand.findMany({
    where: { status: GalleryStatus.APPROVED },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, imageUrl: true, displayName: true, location: true, caption: true },
  });

  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: "/testimonials-and-gallery",
          name: `${title} · ${APP_NAME}`,
          description,
          type: "WebPage",
        })}
      />
      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <header className="max-w-2xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
            Stands out in the wild using {APP_NAME}, and real notes from the people
            running them.
          </p>
        </header>

        {featuredStands.length > 0 ? (
          <section aria-label="Featured stands" className="mt-10 flex flex-col gap-8">
            {featuredStands.map((stand, i) => (
              <FeaturedStandCard key={stand.id} stand={stand} reverse={i % 2 === 1} />
            ))}
          </section>
        ) : null}

        <section aria-label="Gallery and testimonials" className="mt-12">
          <StandsCollage photos={photos} quotes={testimonials} />
        </section>

        <div className="mt-14 flex flex-col gap-4 rounded-[var(--radius-card)] bg-[var(--wash)] p-6 ring-1 ring-[var(--line)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
              Running a stand?
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Share a photo or your story and we may feature it here.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/gallery/submit"
              className="inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
            >
              Add your stand photo
            </Link>
            <Link
              href="/contact?subject=feedback"
              className="inline-flex rounded-[var(--radius-pill)] border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--leaf-dark)] hover:border-[var(--leaf)]"
            >
              Share your story
            </Link>
          </div>
        </div>
      </main>
      <MarketingDashboardSection />
    </MarketingPageShell>
  );
}
