import Link from "next/link";
import { standQrTargetUrl } from "@/lib/stand-qr";
import { businessQrHref } from "@/lib/qr/hrefs";

export type BusinessQrRow = {
  id: string;
  name: string;
  slug: string;
  cartMode: "PRODUCT" | "CUSTOMER_CHOICE";
  qrLinkMode: "LEGACY_STAND" | "WEBSITE_HOME" | "WEBSITE_CATEGORY";
  qrCategory: { title: string; slug: string } | null;
};

export default function BusinessQrList({
  stands,
  storefrontSlug,
  primaryCustomHostname,
}: {
  stands: BusinessQrRow[];
  storefrontSlug: string | null;
  primaryCustomHostname: string | null;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Main business QR</h2>
      <ul className="flex flex-col gap-3">
        {stands.map((stand) => {
          const effectiveMode =
            stand.cartMode === "CUSTOMER_CHOICE"
              ? "LEGACY_STAND"
              : stand.qrLinkMode === "WEBSITE_CATEGORY"
                ? "WEBSITE_CATEGORY"
                : storefrontSlug
                  ? "WEBSITE_HOME"
                  : stand.qrLinkMode;
          const target = standQrTargetUrl({
            linkMode: effectiveMode,
            standSlug: stand.slug,
            cartMode: stand.cartMode,
            storefrontSlug: storefrontSlug ?? undefined,
            categorySlug: stand.qrCategory?.slug,
            primaryCustomHostname,
          });
          const destLabel =
            effectiveMode === "WEBSITE_CATEGORY" && stand.qrCategory
              ? `Category · ${stand.qrCategory.title}`
              : effectiveMode === "WEBSITE_HOME"
                ? primaryCustomHostname
                  ? `Website · ${primaryCustomHostname}`
                  : "Website home"
                : "Shop checkout";
          return (
            <li key={stand.id} className="dash-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--ink)]">{stand.name}</p>
                <p className="text-sm text-[var(--muted)]">{destLabel}</p>
                <p className="mt-1 truncate font-receipt text-xs text-[var(--muted)]">{target}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href={`${businessQrHref(stand.id)}/duplicate`} className="underline">
                  Duplicate
                </Link>
                <Link href={businessQrHref(stand.id)} className="font-semibold text-[var(--leaf-dark)] underline">
                  Edit &amp; print
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
