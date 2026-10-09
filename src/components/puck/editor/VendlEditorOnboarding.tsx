"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vendl-website-editor-onboarding-dismissed";

export default function VendlEditorOnboarding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[120] w-[min(92vw,22rem)] -translate-x-1/2">
      <div className="pointer-events-auto rounded-2xl border border-[var(--line)] bg-white p-4 shadow-lg">
        <p className="font-semibold text-[var(--field)]">Edit your website</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Click any section to change it, or use + Add section below.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-3 rounded-lg bg-[var(--field)] px-3 py-1.5 text-xs font-semibold text-white"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
