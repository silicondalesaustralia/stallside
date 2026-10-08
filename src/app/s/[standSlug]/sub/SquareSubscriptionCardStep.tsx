"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import PoweredByRail from "@/components/PoweredByRail";
import { formatMoney } from "@/lib/money";
import type { SquareSubscriptionSession } from "@/lib/square-subscriptions/enrol-start";
import { completeSquareSubscriptionAction } from "./square-enrol-actions";
import { useSquareCard } from "./use-square-card";

const CONTAINER_ID = "square-subscription-card";

export default function SquareSubscriptionCardStep({
  session,
}: {
  session: SquareSubscriptionSession;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const onError = useCallback((m: string) => setMessage(m), []);
  const card = useSquareCard({
    applicationId: session.applicationId,
    locationId: session.locationId,
    containerId: CONTAINER_ID,
    onError,
  });
  const amount = formatMoney(session.amountCents, session.currency);

  if (done) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <p className="text-base font-semibold">You&apos;re subscribed!</p>
        <p className="mt-1 text-[var(--muted)]">
          We&apos;ve emailed {session.customerEmail} a link to manage your subscription.
        </p>
        <Link href={session.managePath} className="mt-3 inline-block font-semibold underline">
          Manage subscription
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <p className="text-base font-semibold">Pay {amount} now</p>
      <div id={CONTAINER_ID} className="min-h-[56px]" />
      {message ? <p className="text-[var(--warn)]">{message}</p> : null}
      <button
        type="button"
        disabled={pending || !card}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 font-semibold text-white disabled:opacity-60"
        onClick={() => {
          if (!card) return;
          setMessage(null);
          start(async () => {
            try {
              const result = await card.tokenize({
                intent: "CHARGE_AND_STORE",
                amount: (session.amountCents / 100).toFixed(2),
                currencyCode: session.currency.toUpperCase(),
                customerInitiated: true,
                sellerKeyedIn: false,
                billingContact: {
                  givenName: session.customerName,
                  email: session.customerEmail,
                },
              });
              if (result.status !== "OK" || !result.token) {
                setMessage("Card was not accepted. Check the details and try again.");
                return;
              }
              const res = await completeSquareSubscriptionAction({
                manageToken: session.manageToken,
                sourceId: result.token,
              });
              if ("error" in res) {
                setMessage(res.error);
                return;
              }
              setDone(true);
            } catch (error) {
              console.error("Square subscription payment failed", error);
              setMessage("Card payment failed. Try again.");
            }
          });
        }}
      >
        {pending ? "Processing…" : `Subscribe and pay ${amount}`}
      </button>
      <p className="text-xs text-[var(--muted)]">
        Your card is saved securely with Square and charged automatically each period
        until you cancel. Skip, pause or cancel anytime from the link we email you.
      </p>
      <PoweredByRail rail="square" />
    </div>
  );
}
