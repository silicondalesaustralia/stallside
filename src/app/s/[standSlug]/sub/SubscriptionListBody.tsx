import type { SubscriptionListData } from "@/lib/storefront/views/offer-list-types";
import ChannelInterestForm from "../ChannelInterestForm";
import SectionCopy from "@/components/studio/SectionCopy";
import MembershipCategoryView from "./MembershipCategoryView";

/** The membership and subscription cards, or a note and interest form when none are live. */
export default function SubscriptionListBody({ data }: { data: SubscriptionListData }) {
  if (data.offers.length === 0) {
    return (
      <div className="mx-auto mt-4 w-full max-w-lg px-4 pb-10">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <SectionCopy k="emptyHeading" fallback="No memberships available" as="p" className="font-medium" />
          <SectionCopy
            k="emptyText"
            fallback="A membership is a fixed-term share billed by card. Nothing is listed here right now."
            as="p"
            className="mt-2 text-sm leading-relaxed text-[var(--muted)]"
            multiline
          />
          <ChannelInterestForm standSlug={data.standSlug} kind="SUBSCRIPTION" />
        </div>
      </div>
    );
  }
  return (
    <MembershipCategoryView
      standSlug={data.standSlug}
      standName={data.standName}
      accentColor={data.accentColor}
      offers={data.offers}
      offerHrefBase={data.offerHrefBase ?? undefined}
    />
  );
}
