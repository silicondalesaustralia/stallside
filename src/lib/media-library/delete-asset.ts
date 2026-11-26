import { prisma } from "@/lib/prisma";

/** Removes a library row. Product photos that already use the URL stay as they are. */
export async function deleteMediaLibraryAsset(
  ownerId: string,
  assetId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const asset = await prisma.mediaLibraryAsset.findFirst({
    where: { id: assetId, ownerId },
    select: { id: true },
  });
  if (!asset) return { ok: false, error: "Photo not found in your library." };
  await prisma.mediaLibraryAsset.delete({ where: { id: asset.id } });
  return { ok: true };
}
