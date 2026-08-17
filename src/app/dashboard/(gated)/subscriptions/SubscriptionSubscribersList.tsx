"use client";

import ShowCustomerBadge from "@/components/ShowCustomerBadge";
import { subscriptionManageUrl } from "@/lib/subscription-offer";

type SubRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  status: string;
  nextCollectionAt: Date | string | null;
  manageToken: string;
};

export default function SubscriptionSubscribersList({
  standSlug,
  subscriptions,
}: {
  standSlug: string;
  subscriptions: SubRow[];
}) {
  return (
    <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
      {subscriptions.map((sub) => (
        <li
          key={sub.id}
          className="flex flex-wrap items-center justify-between gap-2 py-3"
        >
          <div>
            <p className="text-[var(--muted)]">
              {sub.status.toLowerCase()}
              {sub.nextCollectionAt
                ? ` · next ${new Date(sub.nextCollectionAt).toLocaleDateString()}`
                : ""}
            </p>
            <ShowCustomerBadge
              customerName={sub.customerName}
              customerPhone={sub.customerPhone}
              email={sub.customerEmail}
            />
          </div>
          <a
            href={subscriptionManageUrl(standSlug, sub.manageToken)}
            className="text-[var(--leaf-dark)] underline"
            target="_blank"
            rel="noreferrer"
          >
            Manage link
          </a>
        </li>
      ))}
    </ul>
  );
}
