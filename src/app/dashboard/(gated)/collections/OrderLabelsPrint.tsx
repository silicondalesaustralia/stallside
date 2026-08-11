"use client";

export default function OrderLabelsPrint() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium"
    >
      Print labels
    </button>
  );
}
