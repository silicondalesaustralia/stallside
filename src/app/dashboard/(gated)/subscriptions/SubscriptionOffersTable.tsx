import Link from "next/link";
import DataTable, { cellClass, type DataColumn } from "@/components/dashboard/ui/DataTable";
import DataTableRow from "@/components/dashboard/ui/DataTableRow";
import StatusPill, { type PillSpec } from "@/components/dashboard/ui/StatusPill";
import { SubscriptionOfferKind } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import { isOfferAtCapacity } from "@/lib/subscription-capacity";
import { intervalLabel, membershipOfferReady, offerDisplayPriceCents } from "@/lib/subscription-offer";
import type { OwnerOffer } from "@/lib/subscriptions/service";
import SubscriptionLifecycleActions from "./SubscriptionLifecycleActions";

const COLUMNS: DataColumn[] = [
  { label: "Offer" },
  { label: "Status" },
  { label: "Cadence", hideBelow: "sm" },
  { label: "Price", align: "right" },
  { label: "Members", align: "right", hideBelow: "md" },
  { label: "", align: "right", hideBelow: "md" },
];

const muted = "text-[var(--muted)]";

function statusPills(offer: OwnerOffer): PillSpec[] {
  const pills: PillSpec[] = [offer.isActive ? { label: "Active", tone: "success" } : { label: "Paused", tone: "neutral" }];
  if (isOfferAtCapacity(offer.maxMembers, offer.holding)) pills.push({ label: "Full", tone: "attention" });
  if (!membershipOfferReady(offer)) pills.push({ label: "Needs Stripe sync", tone: "warning" });
  return pills;
}

export default function SubscriptionOffersTable({
  offers,
  publicUrl,
}: {
  offers: OwnerOffer[];
  publicUrl: Record<string, string>;
}) {
  return (
    <DataTable columns={COLUMNS} footer={`${offers.length} offer${offers.length === 1 ? "" : "s"}`}>
      {offers.map((offer) => {
        const href = `/dashboard/subscriptions/${offer.id}`;
        const url = publicUrl[offer.id];
        const isMembership = offer.kind === SubscriptionOfferKind.MEMBERSHIP;
        return (
          <DataTableRow key={offer.id} href={href}>
            <td className={`${cellClass(COLUMNS[0])} max-w-[320px]`}>
              <Link href={href} prefetch={false} className="font-semibold hover:underline">
                {offer.title}
              </Link>
              <p className={`truncate text-xs ${muted}`}>
                {isMembership ? "Membership" : `${offer._count.items} products`} · {url}
              </p>
            </td>
            <td className={cellClass(COLUMNS[1])}>
              <div className="flex flex-wrap gap-1">
                {statusPills(offer).map((pill) => (
                  <StatusPill key={pill.label} {...pill} />
                ))}
              </div>
            </td>
            <td className={`${cellClass(COLUMNS[2])} whitespace-nowrap ${muted}`}>
              {isMembership ? `${offer.termWeeks ?? "?"} weeks` : intervalLabel(offer.interval)}
            </td>
            <td className={`${cellClass(COLUMNS[3])} font-receipt whitespace-nowrap`}>
              {formatMoney(offerDisplayPriceCents(offer), offer.currency)}
            </td>
            <td className={`${cellClass(COLUMNS[4])} font-receipt whitespace-nowrap`}>
              {offer.maxMembers != null ? `${offer.holding} / ${offer.maxMembers}` : offer.holding}
            </td>
            <td className={cellClass(COLUMNS[5])}>
              <div className="flex items-start justify-end gap-3">
                <Link href={url} target="_blank" className="text-sm font-semibold text-[var(--leaf-dark)] underline">
                  Open
                </Link>
                <SubscriptionLifecycleActions
                  offerId={offer.id}
                  offerTitle={offer.title}
                  isActive={offer.isActive}
                  compact
                />
              </div>
            </td>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
