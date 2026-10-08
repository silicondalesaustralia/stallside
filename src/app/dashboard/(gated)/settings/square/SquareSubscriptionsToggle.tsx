"use client";

import { useState, useTransition } from "react";
import { startSquareConnect } from "./actions";
import ActionStatusText from "./ActionStatusText";
import { setSquareSubscriptionsEnabled } from "./subscription-actions";
import { useActionStatus } from "./use-action-status";

export default function SquareSubscriptionsToggle({
  enabled,
  hasScopes,
  checkoutOnSquare,
}: {
  enabled: boolean;
  hasScopes: boolean;
  checkoutOnSquare: boolean;
}) {
  const [on, setOn] = useState(enabled);
  const [pending, start] = useTransition();
  const { status, report, fail } = useActionStatus();

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          className="mt-1"
          checked={on}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.checked;
            setOn(next);
            start(async () => {
              try {
                const res = await setSquareSubscriptionsEnabled(next);
                if ("error" in res) setOn(!next);
                report(res, next ? "Square subscriptions on." : "Square subscriptions off.");
              } catch (error) {
                setOn(!next);
                fail(error);
              }
            });
          }}
        />
        <span>
          Take subscription and membership payments with Square
          <span className="block text-[var(--muted)]">
            Shoppers&apos; cards are saved securely with Square and charged automatically each
            period. Failed payments retry after 1, 3 and 5 days. Existing Stripe subscribers stay
            on Stripe.
          </span>
        </span>
      </label>
      <ActionStatusText status={status} />
      {on && !hasScopes ? (
        <form
          action={startSquareConnect}
          className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4"
        >
          <p>
            One more step: reconnect Square so Vendl can save shoppers&apos; cards for renewals.
            Your settings and product links stay as they are.
          </p>
          <button
            type="submit"
            className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Reconnect Square
          </button>
        </form>
      ) : null}
      {on && hasScopes && !checkoutOnSquare ? (
        <p className="text-[var(--muted)]">
          Switch product checkout to Square under Payments for new signups to use Square.
        </p>
      ) : null}
    </div>
  );
}
