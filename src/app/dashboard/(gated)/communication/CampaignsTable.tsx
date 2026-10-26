import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill, { type PillSpec } from "@/components/dashboard/ui/StatusPill";
import type { CampaignStatus } from "@/generated/prisma/client";

export type CampaignRow = {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  audienceType: string;
  sentCount: number;
  recipientCount: number;
  createdAt: Date;
  sentAt: Date | null;
};

const COLUMNS: DataColumn[] = [
  { label: "Message" },
  { label: "Status" },
  { label: "Audience", hideBelow: "md" },
  { label: "Date", hideBelow: "sm" },
  { label: "Sent", align: "right" },
];

const STATUS: Record<CampaignStatus, PillSpec> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  SENDING: { label: "Sending", tone: "info" },
  SENT: { label: "Sent", tone: "success" },
  FAILED: { label: "Failed", tone: "critical" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

const muted = "text-[var(--muted)]";

export default function CampaignsTable({ campaigns, footer }: { campaigns: CampaignRow[]; footer: string }) {
  return (
    <DataTable columns={COLUMNS} footer={footer}>
      {campaigns.map((c) => {
        const href = `/dashboard/communication/${c.id}`;
        return (
          <DataTableRow key={c.id} href={href}>
            <td className={`${cellClass(COLUMNS[0])} max-w-[300px]`}>
              <Link href={href} prefetch={false} className="block truncate font-semibold hover:underline">
                {c.name}
              </Link>
              <p className={`truncate text-xs ${muted}`}>{c.subject}</p>
            </td>
            <td className={cellClass(COLUMNS[1])}>
              <StatusPill {...STATUS[c.status]} />
            </td>
            <td className={`${cellClass(COLUMNS[2])} whitespace-nowrap capitalize ${muted}`}>
              {c.audienceType.replaceAll("_", " ")}
            </td>
            <td className={`${cellClass(COLUMNS[3])} whitespace-nowrap ${muted}`}>
              {(c.sentAt ?? c.createdAt).toLocaleDateString()}
            </td>
            <td className={`${cellClass(COLUMNS[4])} font-receipt whitespace-nowrap`}>
              {c.sentCount}/{c.recipientCount}
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
