"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProductPublicCard({
  publicUrl,
  standSlug,
  slug,
  onError,
}: {
  publicUrl: string;
  standSlug: string;
  slug: string;
  onError: (msg: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="text-sm">
      <p className="break-all text-[var(--muted)]">{publicUrl}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          className="font-semibold text-[var(--leaf-dark)] underline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(publicUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              onError("Could not copy link.");
            }
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <Link
          href={`/s/${standSlug}/${slug}`}
          target="_blank"
          className="font-semibold text-[var(--leaf-dark)] underline"
        >
          Open
        </Link>
      </div>
    </div>
  );
}
