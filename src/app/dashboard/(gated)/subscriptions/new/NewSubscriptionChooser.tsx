"use client";

import { useState } from "react";
import Link from "next/link";
import SubscriptionOfferForm from "../SubscriptionOfferForm";
import MembershipOfferForm from "../MembershipOfferForm";

type ProductOpt = { id: string; name: string; priceCents: number };

export default function NewSubscriptionChooser({
  products,
  stripeConnected,
  currency,
}: {
  products: ProductOpt[];
  stripeConnected: boolean;
  currency: string;
}) {
  const [kind, setKind] = useState<"BOX" | "MEMBERSHIP" | null>(null);

  if (!kind) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setKind("BOX")}
          className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 text-left hover:border-[var(--leaf)]"
        >
          <p className="font-semibold">Recurring box</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Pick catalog products, one billing cadence, renews until cancelled.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setKind("MEMBERSHIP")}
          className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 text-left hover:border-[var(--leaf)]"
        >
          <p className="font-semibold">Membership</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Typed prices, fixed term. Customers choose weekly, monthly, or pay
            in full. Collection stays weekly.
          </p>
        </button>
        <p className="text-sm text-[var(--muted)] sm:col-span-2">
          <Link href="/dashboard/subscriptions" className="underline">
            Cancel
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setKind(null)}
        className="self-start text-sm underline"
      >
        Change type
      </button>
      {kind === "BOX" ? (
        <SubscriptionOfferForm
          products={products}
          stripeConnected={stripeConnected}
          currency={currency}
        />
      ) : (
        <MembershipOfferForm
          stripeConnected={stripeConnected}
          currency={currency}
        />
      )}
    </div>
  );
}
