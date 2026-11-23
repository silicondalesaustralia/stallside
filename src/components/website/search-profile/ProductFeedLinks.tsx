"use client";

import { useState } from "react";
import type { ProductFeedUrls } from "@/lib/product-feeds/feed-urls";

type Props = {
  urls: ProductFeedUrls;
  isPublished: boolean;
  /** Full page under Marketing → Product Feeds (no nested card title). */
  standalone?: boolean;
};

function CopyRow({ label, url, hint }: { label: string; url: string; hint: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold text-[var(--field)]">{label}</p>
      <p className="text-xs text-[var(--muted)]">{hint}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--field)]">
          {url}
        </code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--field)] hover:bg-[var(--panel)]"
        >
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
    </div>
  );
}

/** Hosted catalogue feed URLs for Google Merchant Center and ChatGPT Business Hub. */
export default function ProductFeedLinks({ urls, isPublished, standalone = false }: Props) {
  return (
    <div
      className={
        standalone
          ? "dash-card space-y-5 p-5"
          : "space-y-4 rounded-xl border border-[var(--line)] bg-[var(--panel)]/40 p-4"
      }
    >
      <p className={standalone ? "text-sm text-[var(--muted)]" : "text-xs text-[var(--muted)]"}>
        {isPublished
          ? "Paste these URLs into Google Merchant Center or ChatGPT Business Hub. They update when you change products."
          : "Publish your website first so Google and ChatGPT can fetch these feeds. The URLs below will work once the site is live."}
      </p>
      <CopyRow
        label="Google Merchant Center"
        url={urls.googleMerchant}
        hint="RSS/XML — add as a scheduled fetch data source in Merchant Center."
      />
      <CopyRow
        label="ChatGPT Business Hub"
        url={urls.chatgpt}
        hint="CSV — add as a hosted feed URL after identity verification in Business Hub."
      />
    </div>
  );
}
