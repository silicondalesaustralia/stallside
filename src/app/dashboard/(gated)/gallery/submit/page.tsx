import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import GallerySubmitForm from "./GallerySubmitForm";

export default async function GallerySubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const stands = await prisma.stand.findMany({
    where: { ownerId: owner.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (params.submitted === "1") {
    return (
      <main className="mx-auto max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">Thanks</h1>
        <p className="mt-3 text-[var(--muted)]">
          We&apos;ve got your photo. We&apos;ll review it and may feature it in the
          public stand gallery.
        </p>
        <p className="mt-6">
          <Link href="/gallery" className="font-semibold text-[var(--leaf-dark)] underline">
            View gallery
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Share your stand</h1>
      <p className="mt-2 text-[var(--muted)]">
        Upload a photo for the Stallside gallery. Town or region is enough — no
        street address needed. Submissions are reviewed before going live.
      </p>
      <GallerySubmitForm
        stands={stands}
        defaultName={stands[0]?.name || owner.businessName}
      />
    </main>
  );
}
