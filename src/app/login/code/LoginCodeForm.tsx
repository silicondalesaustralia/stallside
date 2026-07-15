"use client";

import { useState, useTransition } from "react";
import { requestLoginCode, verifyLoginCode } from "../actions";

type LoginCodeFormProps = {
  email: string;
};

export default function LoginCodeForm({ email }: LoginCodeFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onVerify(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await verifyLoginCode(formData);
      if (result?.error) setMessage(result.error);
    });
  }

  function onResend(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      try {
        await requestLoginCode(formData);
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "digest" in error &&
          String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
        ) {
          throw error;
        }
        setMessage("Could not resend code. Try again.");
      }
    });
  }

  return (
    <div className="mt-8 flex w-full flex-col gap-6">
      <form action={onVerify} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[var(--ink)]">6-digit code</span>
          <input
            type="text"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            placeholder="123456"
            className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5 text-center text-2xl tracking-[0.3em] outline-none ring-[var(--leaf)] focus:ring-2"
          />
        </label>
        {message ? <p className="text-sm text-red-700">{message}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <form action={onResend}>
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={pending}
          className="text-sm font-medium text-[var(--leaf-dark)] underline disabled:opacity-60"
        >
          Resend code
        </button>
      </form>
    </div>
  );
}
