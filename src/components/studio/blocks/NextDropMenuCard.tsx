import Link from "next/link";
import type { StudioMetadata } from "@/lib/studio/types";
import type { NextDropPreset } from "@/lib/studio/preset-registry";
import { shopMenuPath } from "@/lib/storefront/paths";
import SectionCopy from "@/components/studio/SectionCopy";
import NextDropThumb from "./NextDropThumb";

type Props = {
  menu: StudioMetadata["menus"][number];
  meta: StudioMetadata;
  preset: NextDropPreset;
  showClosingDate: boolean;
  showPickupDate: boolean;
};

/** One upcoming drop in the list or timeline layout. */
export default function NextDropMenuCard({ menu, meta, preset, showClosingDate, showPickupDate }: Props) {
  const compact = preset === "timeline";
  return (
    <Link
      href={shopMenuPath(meta.storefrontSlug, menu.slug, meta.draft, meta.basePath, menu.isPreOrderDrop)}
      data-section-card={compact ? undefined : ""}
      className={`flex items-center gap-4 ${compact ? "border-l-2 border-[var(--leaf-dark)] pl-4 py-2" : "rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white p-4 sf-sm:p-5"}`}
    >
      {menu.imageUrl ? (
        <NextDropThumb
          src={menu.imageUrl}
          alt={menu.title}
          className={compact ? "h-12 w-12" : "h-20 w-20 sf-sm:h-24 sf-sm:w-24"}
          sizes={compact ? "48px" : "96px"}
        />
      ) : null}
      <div className="min-w-0">
        <h3 className="font-semibold text-[var(--field)]">{menu.title}</h3>
        {menu.description && !compact ? <p className="mt-2 text-sm text-[var(--muted)]">{menu.description}</p> : null}
        <p className="mt-2 text-sm text-[var(--leaf-dark)]">
          {showClosingDate && menu.orderByLabel ? (
            <SectionCopy k="closesLine" fallback="Orders close {date}" vars={{ date: menu.orderByLabel }} />
          ) : null}
          {showClosingDate && menu.orderByLabel && showPickupDate && menu.collectionLabel ? " · " : null}
          {showPickupDate && menu.collectionLabel ? (
            <SectionCopy k="pickupLine" fallback="Pick up {date}" vars={{ date: menu.collectionLabel }} />
          ) : null}
        </p>
      </div>
    </Link>
  );
}
