"use client";

import { useState, useTransition } from "react";
import { subscribeToBlog } from "@/lib/blog/subscribe-action";

export default function BlogEmailSignup({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  function submit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await subscribeToBlog(formData);
        setStatus("ok" in result ? { ok: true, message: "You're on the list." } : { ok: false, message: result.error });
      } catch (error) {
        console.error("[blog] subscribe request failed", error);
        setStatus({ ok: false, message: "Could not sign you up. Try again." });
      }
    });
  }

  return (
    <section className="mt-14 rounded-[var(--radius-md)] bg-[var(--wash)] p-6 ring-1 ring-[var(--line)] sm:p-8" aria-labelledby="blog-email-heading">
      <h2 id="blog-email-heading" className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
        Get new guides by email
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Practical guides for stall, market and home-food sellers. No spam, unsubscribe any time.
      </p>
      {status?.ok ? (
        <p className="mt-4 text-sm font-semibold text-[var(--leaf-dark)]" role="status">{status.message}</p>
      ) : (
        <form action={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="sourceSlug" value={slug} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <label htmlFor="blog-email" className="sr-only">Email</label>
          <input
            id="blog-email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
          >
            {pending ? "Signing up…" : "Subscribe"}
          </button>
        </form>
      )}
      {status && !status.ok ? (
        <p className="mt-2 text-sm text-red-700" role="alert">{status.message}</p>
      ) : null}
    </section>
  );
}
