"use client";

import { useState, useTransition } from "react";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import type { ConnectPaymentMethodToggle } from "@/lib/stripe-payment-method-config";
import { toggleConnectPaymentMethod } from "./payment-method-actions";

export default function ConnectPaymentMethodToggles({
  configurationId,
  initialMethods,
}: {
  configurationId: string;
  initialMethods: ConnectPaymentMethodToggle[];
}) {
  const [methods, setMethods] = useState(initialMethods);
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onToggle(method: ConnectPaymentMethodToggle, enabled: boolean) {
    if (!method.overridable) return;
    const prev = methods;
    setMethods((rows) =>
      rows.map((row) =>
        row.method === method.method ? { ...row, enabled } : row,
      ),
    );
    setError(null);
    setPendingKey(method.method);
    startTransition(async () => {
      try {
        const result = await toggleConnectPaymentMethod({
          configurationId,
          method: method.method,
          enabled,
        });
        if (result.error) {
          setMethods(prev);
          setError(result.error);
        } else if (result.methods) {
          setMethods(result.methods);
        }
      } catch {
        setMethods(prev);
        setError("Could not save. Try again.");
      } finally {
        setPendingKey(null);
      }
    });
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <div>
        <p className="font-semibold">Checkout payment methods</p>
        <p className="mt-1 text-[var(--muted)]">
          Common methods for your billing region, synced with your connected
          Stripe account. Turn a method off to hide it at customer checkout
          (takes effect on the next Checkout session - not a tab already open).
        </p>
        <p className="mt-1 text-[var(--muted)]">
          Pre-orders stay card-only. Zip / Klarna still only appear above the
          provider&apos;s minimum (usually around $30), even when toggled on.
        </p>
      </div>
      <ul className="divide-y divide-[var(--line)]">
        {methods.map((method) => {
          const busy = pending && pendingKey === method.method;
          return (
            <li key={method.method} className="flex items-center gap-3 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--wash)] p-1.5 text-[var(--ink)]">
                {method.brand ? (
                  <PaymentBrandIcon brand={method.brand} className="size-5" />
                ) : (
                  <span className="text-[0.65rem] font-bold uppercase tracking-tight text-[var(--muted)]">
                    {method.label.slice(0, 3)}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{method.label}</span>
                {!method.overridable ? (
                  <span className="text-xs text-[var(--muted)]">
                    Managed by Stripe platform settings
                  </span>
                ) : method.enabled && !method.available ? (
                  <span className="text-xs text-[var(--muted)]">
                    On in Stripe, but Stripe has not enabled checkout for it on
                    this account (often business type or verification)
                  </span>
                ) : null}
              </span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={method.enabled}
                  disabled={!method.overridable || busy}
                  onChange={(e) => onToggle(method, e.target.checked)}
                />
                <span className="h-6 w-11 rounded-full bg-[var(--line)] transition peer-checked:bg-[var(--leaf)] peer-disabled:opacity-40 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
              </label>
            </li>
          );
        })}
      </ul>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
