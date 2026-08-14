import Image from "next/image";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { GalleryStatus } from "@/generated/prisma/client";
import {
  deleteGalleryStand,
  setGalleryStatus,
} from "./actions";
import AdminGalleryAddForm from "./AdminGalleryAddForm";

export default async function AdminGalleryPage() {
  await requireAdmin();
  const stands = await prisma.galleryStand.findMany({
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    include: { owner: { select: { businessName: true, contactEmail: true } } },
  });

  return (
    <main className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Gallery</h1>
        <p className="mt-1 text-[var(--muted)]">
          Approve owner submissions or add stands manually.
        </p>
      </div>

      <AdminGalleryAddForm />

      <ul className="dash-card divide-y divide-[var(--line)] px-5">
        {stands.map((stand) => (
          <li key={stand.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:gap-4">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-[var(--panel)]">
              <Image
                src={stand.imageUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized={stand.imageUrl.startsWith("http")}
              />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium">
                {stand.displayName}{" "}
                <span className="text-[var(--muted)]">· {stand.status}</span>
              </p>
              <p className="text-[var(--muted)]">{stand.location}</p>
              {stand.caption ? (
                <p className="mt-1 text-[var(--muted)]">{stand.caption}</p>
              ) : null}
              <p className="mt-1 text-xs text-[var(--muted)]">
                {stand.source}
                {stand.owner
                  ? ` · ${stand.owner.businessName} · ${stand.owner.contactEmail}`
                  : null}
                {" · sort "}
                {stand.sortOrder}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {stand.status !== GalleryStatus.APPROVED ? (
                  <form action={setGalleryStatus}>
                    <input type="hidden" name="id" value={stand.id} />
                    <input type="hidden" name="status" value={GalleryStatus.APPROVED} />
                    <button type="submit" className="underline">
                      Approve
                    </button>
                  </form>
                ) : null}
                {stand.status !== GalleryStatus.HIDDEN ? (
                  <form action={setGalleryStatus}>
                    <input type="hidden" name="id" value={stand.id} />
                    <input type="hidden" name="status" value={GalleryStatus.HIDDEN} />
                    <button type="submit" className="underline">
                      Hide
                    </button>
                  </form>
                ) : null}
                <form action={deleteGalleryStand}>
                  <input type="hidden" name="id" value={stand.id} />
                  <button type="submit" className="text-red-700 underline">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
