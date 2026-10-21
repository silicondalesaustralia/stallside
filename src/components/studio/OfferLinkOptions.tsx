"use client";

import type { OfferLinkTarget, PreOrderLinkTarget } from "@/lib/studio/load-link-targets";

/** Link picker options for subscription, membership and pre-order pages. */
export default function OfferLinkOptions({
  offers = [],
  preOrders = [],
}: {
  offers?: OfferLinkTarget[];
  preOrders?: PreOrderLinkTarget[];
}) {
  const memberships = offers.filter((o) => o.kind === "MEMBERSHIP");
  const boxes = offers.filter((o) => o.kind === "BOX");
  return (
    <>
      <optgroup label="Subscriptions & memberships">
        <option value="page:subscriptions">All subscriptions &amp; memberships</option>
        {boxes.map((o) => (
          <option key={o.slug} value={`offer:${o.slug}`}>{o.title} (subscription)</option>
        ))}
        {memberships.map((o) => (
          <option key={o.slug} value={`offer:${o.slug}`}>{o.title} (membership)</option>
        ))}
      </optgroup>
      {preOrders.length ? (
        <optgroup label="Pre-order pages">
          <option value="page:preorders">All pre-orders</option>
          {preOrders
            .filter((p, i) => preOrders.findIndex((q) => q.slug === p.slug) === i)
            .map((p) => (
              <option key={p.slug} value={`preorder:${p.slug}`}>{p.title}</option>
            ))}
        </optgroup>
      ) : null}
    </>
  );
}
