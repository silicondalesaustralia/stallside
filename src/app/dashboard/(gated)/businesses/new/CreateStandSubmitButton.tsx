"use client";

import { useFormStatus } from "react-dom";

export default function CreateStandSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
    >
      {pending ? "Creating…" : "Create Business"}
    </button>
  );
}
