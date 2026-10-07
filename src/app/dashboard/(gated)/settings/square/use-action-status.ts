"use client";

import { useEffect, useState } from "react";

export type ActionStatus = { tone: "ok" | "error"; text: string } | null;

/** Turns a server action result into a short-lived status line. */
export function useActionStatus() {
  const [status, setStatus] = useState<ActionStatus>(null);

  useEffect(() => {
    if (status?.tone !== "ok") return;
    const timer = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(timer);
  }, [status]);

  function report(result: { error?: string } | { ok: true }, okText: string) {
    if ("error" in result && result.error) {
      setStatus({ tone: "error", text: result.error });
    } else {
      setStatus({ tone: "ok", text: okText });
    }
  }

  function fail(error: unknown) {
    setStatus({
      tone: "error",
      text: error instanceof Error ? error.message : "Something went wrong.",
    });
  }

  return { status, report, fail, clear: () => setStatus(null) };
}
