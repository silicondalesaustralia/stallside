"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSquareCard } from "../use-square-card";
import { updateSquareCardAction } from "./square-manage-actions";

const CONTAINER_ID = "square-update-card";

export default function SquareCardUpdate({
  manageToken,
  applicationId,
  locationId,
  customerName,
  customerEmail,
  onDone,
}: {
  manageToken: string;
  applicationId: string;
  locationId: string;
  customerName: string;
  customerEmail: string;
  onDone: (message: string) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const onError = useCallback((m: string) => setError(m), []);
  const card = useSquareCard({ applicationId, locationId, containerId: CONTAINER_ID, onError });

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--line)] p-4 text-sm">
      <div id={CONTAINER_ID} className="min-h-[56px]" />
      {error ? <p className="text-[var(--gone)]">{error}</p> : null}
      <button
        type="button"
        disabled={pending || !card}
        className="rounded-lg bg-[var(--ink)] px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        onClick={() => {
          if (!card) return;
          setError(null);
          start(async () => {
            try {
              const result = await card.tokenize({
                intent: "STORE",
                customerInitiated: true,
                sellerKeyedIn: false,
                billingContact: { givenName: customerName, email: customerEmail },
              });
              if (result.status !== "OK" || !result.token) {
                setError("Card was not accepted. Check the details and try again.");
                return;
              }
              const res = await updateSquareCardAction({ manageToken, sourceId: result.token });
              if ("error" in res) {
                setError(res.error);
                router.refresh();
                return;
              }
              onDone(res.message);
              router.refresh();
            } catch (e) {
              console.error("Square card update failed", e);
              setError("Could not update the card. Try again.");
            }
          });
        }}
      >
        {pending ? "Saving…" : "Save card"}
      </button>
    </div>
  );
}
