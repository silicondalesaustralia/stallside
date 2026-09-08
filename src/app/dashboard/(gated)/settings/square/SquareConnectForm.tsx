"use client";

import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import { startSquareConnect, disconnectSquareAction } from "./actions";

export default function SquareConnectForm({
  connected,
}: {
  connected: boolean;
}) {
  return (
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
  );
}
