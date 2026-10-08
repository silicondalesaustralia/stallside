"use client";

import { useCallback, useState, useTransition } from "react";
import { useSquareCard } from "@/app/s/[standSlug]/sub/use-square-card";
import { payBalanceWithSquareCard } from "./actions";

const CONTAINER_ID = "square-balance-card";

export default function SquareBalanceCard({
  orderId,
  token,
  applicationId,
  locationId,
}: {
  orderId: string;
  token: string;
  applicationId: string;
  locationId: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  const onError = useCallback((m: string) => setMessage(m), []);
  const card = useSquareCard({ applicationId, locationId, containerId: CONTAINER_ID, onError });

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4">
      <p className="font-semibold">Pay with a different card</p>
      <div id={CONTAINER_ID} className="min-h-[56px]" />
      <button
        type="button"
        disabled={pending || ok || !card}
        className="rounded-[var(--radius)] bg-[var(--leaf)] px-5 py-3 text-lg font-semibold text-white disabled:opacity-50"
        onClick={() => {
          if (!card) return;
          setMessage(null);
          start(async () => {
            try {
              const result = await card.tokenize();
              if (result.status !== "OK" || !result.token) {
                setMessage("Card was not accepted. Check the details and try again.");
                return;
              }
              const res = await payBalanceWithSquareCard(orderId, token, result.token);
              if (res.ok) {
                setOk(true);
                setMessage("Balance paid - thank you.");
                return;
              }
              setMessage(res.error);
            } catch (e) {
              console.error("Square balance payment failed", e);
              setMessage("Could not charge the card. Try again.");
            }
          });
        }}
      >
        {pending ? "Charging…" : ok ? "Paid" : "Pay balance with this card"}
      </button>
      {message ? <p className={ok ? "text-[var(--ok)]" : "text-[var(--gone)]"}>{message}</p> : null}
    </div>
  );
}
