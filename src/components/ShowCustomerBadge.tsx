"use client";

import { useState, type ReactNode } from "react";

export default function ShowCustomerBadge({
  customerName,
  customerPhone,
  email,
  emailSlot,
  className = "mt-2",
}: {
  customerName: string | null;
  customerPhone?: string | null;
  email: string | null;
  /** Optional custom email UI (e.g. order compose). Defaults to mailto. */
  emailSlot?: ReactNode;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!customerName && !customerPhone && !email) return null;

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className={`${className} inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--wash)] px-2.5 py-1 text-xs font-semibold text-[var(--leaf-dark)] hover:bg-[var(--line)]/40`}
      >
        Show customer
      </button>
    );
  }

  return (
    <div className={`${className} flex flex-col gap-1.5`}>
      {(customerName || customerPhone) && (
        <p className="text-sm text-[var(--muted)]">
          {[customerName, customerPhone].filter(Boolean).join(" · ")}
        </p>
      )}
      {emailSlot
        ? emailSlot
        : email ? (
            <a
              href={`mailto:${email}`}
              className="text-sm font-medium text-[var(--leaf-dark)] underline"
            >
              {email}
            </a>
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
