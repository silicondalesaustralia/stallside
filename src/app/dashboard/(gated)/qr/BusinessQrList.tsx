import Link from "next/link";
import { standQrTargetUrl } from "@/lib/stand-qr";
import { businessQrHref } from "@/lib/qr/hrefs";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import QrRowActions from "./QrRowActions";

export type BusinessQrRow = {
  id: string;
  name: string;
  slug: string;
  cartMode: "PRODUCT" | "CUSTOMER_CHOICE";
  qrLinkMode: "LEGACY_STAND" | "WEBSITE_HOME" | "WEBSITE_CATEGORY";
  qrCategory: { title: string; slug: string } | null;
};

const COLUMNS: DataColumn[] = [{ label: "Business" }, { label: "Opens" }, { label: "", align: "right" }];

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
      <DataTable columns={COLUMNS}>
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
          const href = businessQrHref(stand.id);
          return (
            <DataTableRow key={stand.id} href={href}>
              <td className={cellClass(COLUMNS[0])}>
                <Link href={href} prefetch={false} className="font-semibold hover:underline">
                  {stand.name}
                </Link>
              </td>
              <td className={`${cellClass(COLUMNS[1])} max-w-[320px]`}>
                <p>{destLabel}</p>
                <p className="truncate font-receipt text-xs text-[var(--muted)]">{target}</p>
              </td>
              <td className={cellClass(COLUMNS[2])}>
                <QrRowActions href={href} />
              </td>
            </DataTableRow>
          );
        })}
      </DataTable>
    </section>
  );
}
