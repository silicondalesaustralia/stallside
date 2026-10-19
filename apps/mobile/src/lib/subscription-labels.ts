import type { MobileOffer, MobileSubscriber } from "@contracts/mobile/subscriptions";
import { formatCents } from "@/lib/format";

/** "Weekly · $30.00 · 4 products · 3 / 10 members", like the web list. */
export function offerMeta(offer: MobileOffer): string {
  const what =
    offer.kind === "MEMBERSHIP"
      ? "membership"
      : `${offer.productCount} product${offer.productCount === 1 ? "" : "s"}`;
  const members = offer.maxMembers != null ? `${offer.members} / ${offer.maxMembers} members` : `${offer.members} members`;
  return [offer.cadence, formatCents(offer.priceCents, offer.currency), what, members].join(" · ");
}

/** Short warnings shown next to the title. */
export function offerFlags(offer: MobileOffer): string[] {
  return [
    offer.isActive ? null : "Off",
    offer.full ? "Full" : null,
    offer.needsSync ? "Needs Stripe sync" : null,
  ].filter((flag): flag is string => flag != null);
}

export const SUBSCRIBER_STATUS_LABEL: Record<MobileSubscriber["status"], string> = {
  INCOMPLETE: "Checkout not finished",
  ACTIVE: "Active",
  PAST_DUE: "Payment overdue",
  PAUSED: "Paused",
  CANCELLED: "Cancelled",
};
