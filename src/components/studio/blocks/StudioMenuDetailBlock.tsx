import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import { shopMenusPath } from "@/lib/storefront/paths";
import MenuOrder from "@/components/menu/MenuOrder";

export default function StudioMenuDetailBlock({
  metadata: meta,
  isEditing,
}: {
  metadata: StudioMetadata;
  isEditing?: boolean;
}) {
  const menu = meta.commerceContext?.menu;
  if (!menu) {
    if (!isEditing) return null;
    return (
      <section className="studio-section">
        <div className="studio-section__inner storefront-page-content--narrow">
          <p className="text-[var(--muted)]">
            Create a menu to preview the menu page layout.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="storefront-page-content storefront-page-content--narrow">
      <Link
        href={shopMenusPath(meta.storefrontSlug, meta.draft, meta.basePath)}
        className="text-sm font-semibold text-[var(--leaf-dark)] underline"
      >
        ← Menus
      </Link>
      <h1 className="studio-display mt-4 text-3xl font-bold text-[var(--field)]">
        {menu.title}
      </h1>
      {menu.scheduleLabel ? (
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--leaf-dark)]">
          {menu.isPreOrderDrop ? "Pre-order drop" : "Menu"} · {menu.scheduleLabel}
        </p>
      ) : null}
      {menu.description ? (
        <p className="mt-3 text-lg text-[var(--muted)]">{menu.description}</p>
      ) : null}
      {menu.products.length > 0 ? (
        <MenuOrder
          standSlug={meta.standSlug}
          currency={meta.currency}
          products={menu.products}
          catalogProducts={menu.products}
          isPreOrderDrop={menu.isPreOrderDrop}
        />
      ) : isEditing ? (
        <p className="mt-6 text-[var(--muted)]">Add products to this menu to show them here.</p>
      ) : null}
    </div>
  );
}
