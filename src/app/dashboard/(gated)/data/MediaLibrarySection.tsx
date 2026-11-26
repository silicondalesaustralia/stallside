import { prisma } from "@/lib/prisma";
import MediaLibraryPanel from "./MediaLibraryPanel";

/** Loads the owner's photo library and product list for linking. */
export default async function MediaLibrarySection({ ownerId }: { ownerId: string }) {
  const [assets, products] = await Promise.all([
    prisma.mediaLibraryAsset.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, url: true, fileName: true, createdAt: true },
    }),
    prisma.product.findMany({
      where: { ownerId, isArchived: false },
      orderBy: { name: "asc" },
      take: 500,
      select: { id: true, name: true },
    }),
  ]);

  return (
    <MediaLibraryPanel
      assets={assets.map((a) => ({
        id: a.id,
        url: a.url,
        fileName: a.fileName,
        createdAt: a.createdAt.toISOString(),
      }))}
      products={products}
    />
  );
}
