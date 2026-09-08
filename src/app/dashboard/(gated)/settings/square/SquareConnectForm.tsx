"use client";

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
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          {connected ? "Reconnect Square" : "Connect Square"}
        </button>
      </form>
      {connected ? (
        <form action={disconnectSquareAction}>
          <button
            type="submit"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--wash)]"
          >
            Disconnect Square
          </button>
        </form>
      ) : null}
    </div>
  );
}
