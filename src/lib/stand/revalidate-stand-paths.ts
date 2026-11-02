import { revalidatePath, revalidateTag } from "next/cache";
import { standCatalogTag } from "@/lib/stand-catalog-tag";

/** Refresh dashboard and storefront pages after a business's details change. */
export function revalidateStandPaths(standId: string, slug: string, previousSlug: string) {
  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${standId}`);
  revalidatePath("/dashboard/payments");
  revalidatePath(`/dashboard/businesses/${standId}/qr`);
  revalidatePath(`/dashboard/qr/business/${standId}`);
  revalidatePath(`/s/${slug}`);
  revalidateTag(standCatalogTag(slug), "max");
  if (slug !== previousSlug) {
    revalidatePath(`/s/${previousSlug}`);
    revalidateTag(standCatalogTag(previousSlug), "max");
  }
}
