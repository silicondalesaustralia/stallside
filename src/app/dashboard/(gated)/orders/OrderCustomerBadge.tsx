"use client";

import { useState } from "react";
import OrderCustomerEmail from "../collections/OrderCustomerEmail";

export default function OrderCustomerBadge({
  orderId,
  customerName,
  customerPhone,
  email,
  defaultSubject,
}: {
  orderId: string;
  customerName: string | null;
  customerPhone: string | null;
  email: string | null;
  defaultSubject: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!customerName && !customerPhone && !email) return null;

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="mt-2 inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--wash)] px-2.5 py-1 text-xs font-semibold text-[var(--leaf-dark)] hover:bg-[var(--line)]/40"
      >
        Show customer
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {(customerName || customerPhone) && (
        <p className="text-sm text-[var(--muted)]">
          {[customerName, customerPhone].filter(Boolean).join(" · ")}
        </p>
      )}
      {email ? (
        <OrderCustomerEmail
          orderId={orderId}
          email={email}
          defaultSubject={defaultSubject}
        />
      ) : null}
      <button
        type="button"
        onClick={() => setRevealed(false)}
        className="self-start text-xs font-medium text-[var(--muted)] underline"
      >
        Hide
      </button>
    </div>
  );
}
