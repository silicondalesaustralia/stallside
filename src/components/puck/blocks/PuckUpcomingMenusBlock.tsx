import Link from "next/link";
import type { PuckSpikeMetadata } from "@/lib/puck/types";
import { shopMenuPath } from "@/lib/storefront/paths";

type UpcomingMenusProps = {
  maxItems: number;
  showClosingDate: boolean;
  cardStyle: "card" | "minimal";
};

export default function PuckUpcomingMenusBlock({
  maxItems,
  showClosingDate,
  cardStyle,
  puck,
}: UpcomingMenusProps & { puck: { metadata: PuckSpikeMetadata } }) {
  const meta = puck.metadata;
  const menus = meta.menus.slice(0, Math.max(1, Math.min(maxItems, 6)));

  if (menus.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Upcoming menus
        </h2>
        <p className="mt-4 text-[var(--muted)]">No upcoming menus right now.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        Upcoming menus
      </h2>
      <ul className="mt-6 flex flex-col gap-3">
        {menus.map((menu) => {
          const cardClass =
            cardStyle === "minimal"
              ? "block py-3"
              : "block rounded-2xl border border-[var(--line)] bg-white p-4";
          return (
            <li key={menu.slug}>
              <Link
                href={shopMenuPath(
                  meta.storefrontSlug,
                  menu.slug,
                  meta.draft,
                  meta.basePath,
                )}
                className={cardClass}
              >
                <p className="font-semibold text-[var(--field)]">{menu.title}</p>
                {menu.description ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {menu.description}
                  </p>
                ) : null}
                {showClosingDate && menu.orderByLabel ? (
                  <p className="mt-2 text-xs font-medium text-[var(--leaf-dark)]">
                    Orders close {menu.orderByLabel}
                  </p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
