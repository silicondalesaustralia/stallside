import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { tagItemStatus, tagItemValue, type TagItem } from "@/lib/website/tracking/catalog";
import type { TrackingSecretsStatus } from "@/lib/website/tracking/secrets";
import type { StorefrontTracking } from "@/lib/website/tracking/types";
import { tagStatusPill } from "./tags-data";
import { TAGS_PATH } from "./tags-state";

const SERVER_SECRET = { meta: "metaCapiToken", tiktok: "tiktokAccessToken", ga4: "ga4ApiSecret" } as const;

const muted = "text-[var(--muted)]";

export default function TagsTable({
  title,
  items,
  draft,
  live,
  sitePublished,
  secrets,
}: {
  title: string;
  items: TagItem[];
  draft: StorefrontTracking;
  live: StorefrontTracking;
  sitePublished: boolean;
  secrets: TrackingSecretsStatus;
}) {
  const columns: DataColumn[] = [
    { label: title },
    { label: "ID", hideBelow: "sm" },
    { label: "Status", align: "right" },
  ];
  return (
    <DataTable columns={columns}>
      {items.map((item) => {
        const href = `${TAGS_PATH}/${item.slug}`;
        const value = tagItemValue(item, draft);
        const server = item.server && secrets.saved[SERVER_SECRET[item.server]];
        return (
          <DataTableRow key={item.slug} href={href}>
            <td className={`${cellClass(columns[0])} max-w-[320px]`}>
              <Link href={href} prefetch={false} className="block truncate font-semibold hover:underline">
                {item.label}
              </Link>
              <p className={`truncate text-xs ${muted}`}>{item.summary}</p>
            </td>
            <td className={`${cellClass(columns[1])} max-w-[220px] truncate font-mono text-xs`}>
              {value ?? <span className={muted}>—</span>}
              {server ? <span className="ml-2 font-sans font-semibold text-[var(--ok)]">+ server-side</span> : null}
            </td>
            <td className={`${cellClass(columns[2])} whitespace-nowrap`}>
              <StatusPill {...tagStatusPill(tagItemStatus(item, draft, live), sitePublished)} />
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
