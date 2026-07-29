import type { Metadata } from "next";
import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import MarketingPageShell from "@/components/MarketingPageShell";
import { APP_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { GalleryStatus } from "@/generated/prisma/client";
import { marketingPageGraphSchema } from "@/lib/schema";

const title = "Stand gallery";
const description =
  "Real roadside stands running Stallside — farm eggs, honesty stalls, and more.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const stands = await prisma.galleryStand.findMany({
    where: { status: GalleryStatus.APPROVED },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <MarketingPageShell>
      <JsonLd
        data={marketingPageGraphSchema({
          path: "/gallery",
          name: `${title} · ${APP_NAME}`,
          description,
          type: "WebPage",
        })}
      />
      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Stand gallery
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
          Stands out in the wild using {APP_NAME}. Own a stall? After a few real
          sales we&apos;ll invite you to share a photo.
        </p>
        {stands.length === 0 ? (
          <p className="mt-10 text-sm text-[var(--muted)]">Gallery coming soon.</p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stands.map((stand) => {
              const remote = stand.imageUrl.startsWith("http");
              return (
                <li key={stand.id} className="overflow-hidden">
                  <div className="relative aspect-[3/4] bg-[var(--panel)]">
                    <Image
                      src={stand.imageUrl}
                      alt={stand.displayName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={remote}
                    />
                  </div>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
                    {stand.displayName}
                  </p>
                  <p className="text-sm text-[var(--muted)]">{stand.location}</p>
                  {stand.caption ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">{stand.caption}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </MarketingPageShell>
  );
}
