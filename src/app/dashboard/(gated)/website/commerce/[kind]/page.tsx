import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { commerceKindFromParam } from "@/lib/studio/commerce-pages";
import { studioEditorPath } from "@/lib/studio/editor-target";

/** Commerce layouts are edited on the storefront; keep old links working. */
export default async function WebsiteCommerceEditPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { owner } = await requireOwner();
  const { kind: kindParam } = await params;
  const kind = commerceKindFromParam(kindParam);
  if (!kind) notFound();

  const storefront = await ensureStorefront(owner.id, owner.businessName);
  redirect(studioEditorPath(storefront.slug, { kind: "commerce", commerceKind: kind }));
}
