"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/production/form-parse";

const VARIANTS = {
  primary: "rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]",
  secondary:
    "rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-[var(--ink)] outline outline-[var(--line)] hover:bg-[var(--wash)]",
  danger: "rounded-lg px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50",
} as const;

export default function ActionForm({
  action,
  submitLabel,
  children,
  className = "flex flex-col gap-3",
  variant = "primary",
  resetOnSuccess = false,
  confirmMessage,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  children?: React.ReactNode;
  className?: string;
  variant?: keyof typeof VARIANTS;
  resetOnSuccess?: boolean;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await action(formData);
        if ("error" in result) {
          setMessage({ text: result.error, error: true });
          return;
        }
        if (result.redirectTo) {
          router.push(result.redirectTo);
          return;
        }
        if (resetOnSuccess) formRef.current?.reset();
        if (result.message) setMessage({ text: result.message, error: false });
        router.refresh();
      } catch (error) {
        console.error("Production form failed", error);
        setMessage({ text: "Could not save. Try again.", error: true });
      }
    });
  }

  return (
    <form ref={formRef} action={onSubmit} className={className}>
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={`${VARIANTS[variant]} disabled:opacity-60`}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {message ? (
          <p role="status" className={`text-sm ${message.error ? "text-red-700" : "text-[var(--muted)]"}`}>
            {message.text}
          </p>
        ) : null}
      </div>
    </form>
  );
}
