import type { ReactNode } from "react";

/** One checkout payment method: checkbox, label, hint. */
export default function CheckoutPaymentRow({
  name,
  checked,
  disabled,
  label,
  hint,
  children,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  label: ReactNode;
  hint: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0">
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name={name}
          defaultChecked={checked}
          disabled={disabled}
          className="mt-1 size-4 shrink-0 disabled:opacity-50"
        />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 font-medium">{label}</span>
          <span className="mt-0.5 block text-[var(--muted)]">{hint}</span>
        </span>
      </label>
      {children}
    </div>
  );
}
