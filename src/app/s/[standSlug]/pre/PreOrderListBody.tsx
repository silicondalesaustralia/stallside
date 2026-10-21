import type { PreOrderListData } from "@/lib/storefront/views/offer-list-types";
import ChannelInterestForm from "../ChannelInterestForm";
import PreOrderCategoryView from "./PreOrderCategoryView";

/** The pre-order cards, or a note and interest form when nothing is open. */
export default function PreOrderListBody({ data }: { data: PreOrderListData }) {
  if (data.pages.length === 0) {
    return (
      <div className="mx-auto mt-4 w-full max-w-lg px-4 pb-10">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <p className="font-medium">No pre-orders available</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Pre-orders let you pay by card for a collection or delivery day. The stall packs your order; you pick it up
            (or they deliver) on that day. Nothing is listed here right now.
          </p>
          <ChannelInterestForm standSlug={data.standSlug} kind="PREORDER" />
        </div>
      </div>
    );
  }
  return (
    <PreOrderCategoryView
      standSlug={data.standSlug}
      standName={data.standName}
      timezone={data.timezone}
      accentColor={data.accentColor}
      pages={data.pages.map((p) => ({ ...p, collectionAt: new Date(p.collectionAt), orderByAt: new Date(p.orderByAt) }))}
      pageHrefBase={data.pageHrefBase ?? undefined}
    />
  );
}
