"use client";

import { useState, useTransition } from "react";
import { sendOrderCustomerEmail } from "@/app/dashboard/(gated)/collections/email-actions";

/** Optional ready/pickup notice using existing owner→customer email. */
export default function OpsNotifyReadyButton({
  orderId,
  standName,
  orderNumber,
  hasEmail,
}: {
  orderId: string;
  standName: string;
  orderNumber: string;
  hasEmail: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (!hasEmail) return null;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold disabled:opacity-50"
        onClick={() => {
          start(async () => {
            const result = await sendOrderCustomerEmail({
              orderId,
              subject: `${standName}: your order ${orderNumber} is ready`,
              message: `Hi — your order ${orderNumber} from ${standName} is ready for pickup.\n\nSee you soon!`,
            });
            setMsg(result.error ?? "Ready email sent.");
          });
        }}
      >
        {pending ? "Sending…" : "Email: order ready"}
      </button>
      {msg ? <p className="text-xs text-[var(--muted)]">{msg}</p> : null}
    </div>
  );
}
