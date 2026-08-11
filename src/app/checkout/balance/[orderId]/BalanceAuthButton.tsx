"use client";

import { useState, useTransition } from "react";
import { retryBalanceCharge } from "./actions";

export default function BalanceAuthButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={pending || ok}
        onClick={() => {
          setMessage(null);
          start(async () => {
            const result = await retryBalanceCharge(orderId);
            if (result.ok) {
              setOk(true);
              setMessage("Balance paid - thank you.");
              return;
            }
            setMessage(result.error);
          });
        }}
        className="rounded-[var(--radius)] bg-[var(--leaf)] px-5 py-3 text-lg font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Charging…" : ok ? "Paid" : "Pay remaining balance"}
      </button>
      {message ? (
        <p className={ok ? "text-[var(--ok)]" : "text-[var(--gone)]"}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
