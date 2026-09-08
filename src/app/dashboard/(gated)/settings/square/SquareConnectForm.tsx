"use client";

import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import { startSquareConnect, disconnectSquareAction } from "./actions";

export default function SquareConnectForm({
  connected,
  sandbox = false,
}: {
  connected: boolean;
  sandbox?: boolean;
}) {
  return (
    <div className="space-y-3">
      {sandbox && !connected ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--muted)]">
          Sandbox OAuth shows a blank page unless you first open a seller test
          account: Developer Dashboard → your app → Sandbox test accounts →{" "}
          <strong className="text-[var(--ink)]">Open</strong> on Default Test
          Account. Leave that dashboard open, then click Connect Square.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <form action={startSquareConnect}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            <span className="rounded-sm bg-white p-0.5">
              <PaymentBrandIcon brand="square" className="size-4" />
            </span>
            {connected ? "Reconnect Square" : "Connect Square"}
          </button>
        </form>
        {connected ? (
          <form action={disconnectSquareAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]"
            >
              <PaymentBrandIcon brand="square" className="size-5" />
              Disconnect Square
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
