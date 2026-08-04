"use client";

import { useEffect, useState, type ReactNode } from "react";

export default function LpHeaderShell({ children }: { children: ReactNode }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition ${
        stuck
          ? "border-[var(--line)] bg-white/90 shadow-sm backdrop-blur-md"
          : "border-transparent bg-[var(--panel)]/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:h-[72px] sm:px-6">
        {children}
      </div>
    </header>
  );
}
