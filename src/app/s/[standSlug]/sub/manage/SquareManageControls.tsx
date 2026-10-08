"use client";

import { useState, useTransition } from "react";
import { pauseShopperSubscription, skipNextShopperCycle } from "./manage-actions";
import SquareCardUpdate from "./SquareCardUpdate";
import {
  cancelSquareSubscription,
  resumeSquareSubscription,
  undoCancelSquareSubscription,
} from "./square-manage-actions";

type Action = (formData: FormData) => Promise<{ error: string } | { ok: true; message: string }>;

const BUTTON =
  "rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-medium disabled:opacity-60";

export default function SquareManageControls(props: {
  token: string;
  status: string;
  skipNextCycle: boolean;
  cancelAtPeriodEnd: boolean;
  canCancel: boolean;
  cardLabel: string | null;
  applicationId: string | null;
  locationId: string | null;
  customerName: string;
  customerEmail: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState(false);
  const [pending, start] = useTransition();
  const paused = props.status === "PAUSED";
  const pastDue = props.status === "PAST_DUE";
  const active = props.status === "ACTIVE" || pastDue;
  const live = active || paused;

  function run(action: Action) {
    const fd = new FormData();
    fd.set("token", props.token);
    setMessage(null);
    start(async () => {
      try {
        const result = await action(fd);
        setMessage("error" in result ? result.error : result.message);
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {pastDue ? (
        <p className="rounded-lg bg-[var(--panel)] p-3 text-sm font-medium text-[var(--gone)]">
          Your last payment failed. Update your card to keep your subscription.
        </p>
      ) : null}
      {live ? (
        <p className="text-sm">Card: {props.cardLabel ?? "none saved"}</p>
      ) : null}
      {live && props.applicationId && props.locationId ? (
        editingCard ? (
          <SquareCardUpdate
            manageToken={props.token}
            applicationId={props.applicationId}
            locationId={props.locationId}
            customerName={props.customerName}
            customerEmail={props.customerEmail}
            onDone={(m) => {
              setEditingCard(false);
              setMessage(m);
            }}
          />
        ) : (
          <button type="button" className={BUTTON} onClick={() => setEditingCard(true)}>
            Update card
          </button>
        )
      ) : null}
      {active && !props.skipNextCycle && !props.cancelAtPeriodEnd ? (
        <button type="button" disabled={pending} className={BUTTON} onClick={() => run(skipNextShopperCycle)}>
          Skip next cycle
        </button>
      ) : null}
      {props.skipNextCycle ? (
        <p className="text-sm text-[var(--muted)]">Next cycle is skipped: no charge, no order.</p>
      ) : null}
      {active ? (
        <button type="button" disabled={pending} className={BUTTON} onClick={() => run(pauseShopperSubscription)}>
          Pause subscription
        </button>
      ) : null}
      {paused ? (
        <button
          type="button"
          disabled={pending}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          onClick={() => run(resumeSquareSubscription)}
        >
          Resume subscription
        </button>
      ) : null}
      {live && props.canCancel && !props.cancelAtPeriodEnd ? (
        <button type="button" disabled={pending} className={BUTTON} onClick={() => run(cancelSquareSubscription)}>
          Cancel subscription
        </button>
      ) : null}
      {props.cancelAtPeriodEnd && live ? (
        <button type="button" disabled={pending} className={BUTTON} onClick={() => run(undoCancelSquareSubscription)}>
          Keep my subscription
        </button>
      ) : null}
      {message ? <p className="text-sm text-[var(--leaf-dark)]">{message}</p> : null}
    </div>
  );
}
