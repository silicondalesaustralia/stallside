"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProductPublicCard({
  publicUrl,
  farmstandUrl,
  onError,
}: {
  publicUrl: string;
  farmstandUrl: string;
  onError: (msg: string) => void;
}) {
  const [copied, setCopied] = useState<"shop" | "farmstand" | null>(null);

  async function copy(url: string, which: "shop" | "farmstand") {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      onError("Could not copy link.");
    }
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Shop</p>
        <p className="mt-1 break-all text-[var(--muted)]">{publicUrl}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <button
            type="button"
            className="font-semibold text-[var(--leaf-dark)] underline"
            onClick={() => copy(publicUrl, "shop")}
          >
            {copied === "shop" ? "Copied" : "Copy link"}
          </button>
          <Link
            href={publicUrl}
            target="_blank"
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            Open
          </Link>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          Farmstand
        </p>
        <p className="mt-1 break-all text-[var(--muted)]">{farmstandUrl}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <button
            type="button"
            className="font-semibold text-[var(--leaf-dark)] underline"
            onClick={() => copy(farmstandUrl, "farmstand")}
          >
            {copied === "farmstand" ? "Copied" : "Copy link"}
          </button>
          <Link
            href={farmstandUrl}
            target="_blank"
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}
