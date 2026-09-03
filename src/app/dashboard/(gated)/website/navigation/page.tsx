import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { prisma } from "@/lib/prisma";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import { ensureBlogSettings } from "@/lib/studio/blog";
import { buildNavEditorItems } from "@/lib/studio/navigation";
import { syncBuiltinCustomPages } from "../pages/actions";
import NavigationEditor from "./NavigationEditor";

export default async function WebsiteNavigationPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  await syncBuiltinCustomPages();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  const blogSettings = ensureBlogSettings(storefront.draftConfig);
  const items = buildNavEditorItems(pages, blogSettings);
  const params = await searchParams;

  const menuCount = await prisma.menu.count({
    where: { ownerId: owner.id, isActive: true },
  });
  const hasMenus = menuCount > 0;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 pb-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Navigation
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Choose which pages appear in your site header and footer, rename menu labels, and set
          their order. Publish the site when you are ready for changes to go live.
        </p>
      </div>

      {params.saved ? (
        <p className="text-sm font-medium text-[var(--ok)]">Navigation saved.</p>
      ) : null}
      {params.error ? (
        <p className="text-sm font-medium text-[var(--gone)]">Could not save navigation.</p>
      ) : null}

      <NavigationEditor initialItems={items} hasMenus={hasMenus} />
    </main>
  );
}
