import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import { shopMenuPath } from "@/lib/storefront/paths";
import SectionCopy from "@/components/studio/SectionCopy";
import NextDropThumb from "./NextDropThumb";

type Props = {
  menu: StudioMetadata["menus"][number];
  meta: StudioMetadata;
  showClosingDate: boolean;
  showPickupDate: boolean;
};

/** Large card for the first upcoming drop (Featured layout). */
export default function NextDropFeaturedCard({ menu, meta, showClosingDate, showPickupDate }: Props) {
  return (
    <Link
      href={shopMenuPath(meta.storefrontSlug, menu.slug, meta.draft, meta.basePath, menu.isPreOrderDrop)}
      data-section-card
      className="mt-8 flex flex-col gap-6 overflow-hidden rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white p-6 sf-sm:flex-row sf-sm:items-center sf-sm:p-8"
    >
      {menu.imageUrl ? (
        <NextDropThumb
          src={menu.imageUrl}
          alt={menu.title}
          className="aspect-square w-full sf-sm:w-56"
          sizes="(max-width:768px) 100vw, 224px"
        />
      ) : null}
      <div className="min-w-0">
        <SectionCopy k="eyebrow" fallback="Order window open" as="p" className="studio-eyebrow text-[var(--leaf-dark)]" />
        <h3 className="studio-heading mt-2 text-2xl sf-sm:text-3xl">{menu.title}</h3>
        {menu.description ? <p className="mt-3 max-w-2xl text-[var(--muted)]">{menu.description}</p> : null}
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {showClosingDate && menu.orderByLabel ? (
            <div>
              <dt className="font-semibold text-[var(--field)]">
                <SectionCopy k="closesLabel" fallback="Orders close" />
              </dt>
              <dd className="text-[var(--muted)]">{menu.orderByLabel}</dd>
            </div>
          ) : null}
          {showPickupDate && menu.collectionLabel ? (
            <div>
              <dt className="font-semibold text-[var(--field)]">
                <SectionCopy k="pickupLabel" fallback="Pick up" />
              </dt>
              <dd className="text-[var(--muted)]">{menu.collectionLabel}</dd>
            </div>
          ) : null}
        </dl>
        <span className="studio-btn studio-btn--primary mt-6 inline-flex">
          <SectionCopy k="viewMenu" fallback="View menu" />
        </span>
      </div>
    </Link>
  );
}
