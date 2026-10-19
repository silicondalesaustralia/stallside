"use client";

import { useState } from "react";

const BUTTON =
  "inline-flex items-center rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--leaf-dark)] hover:border-[var(--leaf)]";

export default function ArticleShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied("done");
    } catch (error) {
      console.error("[blog] copy link failed", error);
      setCopied("failed");
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Share this article">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Share</span>
      <button type="button" onClick={copyLink} className={BUTTON}>
        {copied === "done" ? "Link copied" : copied === "failed" ? "Copy failed" : "Copy link"}
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON}
      >
        Facebook
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON}
      >
        LinkedIn
      </a>
      <a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`} className={BUTTON}>
        Email
      </a>
    </div>
  );
}
