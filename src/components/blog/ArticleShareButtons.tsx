"use client";

import { useState } from "react";
import { FOOTER_SOCIALS, FooterSocialIcon } from "@/components/footer-socials";

const BUTTON =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--leaf-dark)] transition hover:border-[var(--leaf)] hover:bg-[var(--panel)]";
const ICON = "h-4 w-4";

const FACEBOOK_PATH = FOOTER_SOCIALS.find((s) => s.label === "Facebook")?.path ?? "";
const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.73 1.637-1.84 3.37-1.84 3.601 0 4.267 2.37 4.267 4.455v6.276zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";
const EMAIL_PATH =
  "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z";
const LINK_PATH =
  "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z";
const CHECK_PATH = "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z";

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

  const copyLabel = copied === "done" ? "Link copied" : copied === "failed" ? "Copy failed" : "Copy link";

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Share this article">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Share</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON}
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <FooterSocialIcon path={FACEBOOK_PATH} className={ICON} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <FooterSocialIcon path={LINKEDIN_PATH} className={ICON} />
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        className={BUTTON}
        aria-label="Share by email"
        title="Share by email"
      >
        <FooterSocialIcon path={EMAIL_PATH} className={ICON} />
      </a>
      <button type="button" onClick={copyLink} className={BUTTON} aria-label={copyLabel} title={copyLabel}>
        <FooterSocialIcon path={copied === "done" ? CHECK_PATH : LINK_PATH} className={ICON} />
      </button>
    </div>
  );
}
