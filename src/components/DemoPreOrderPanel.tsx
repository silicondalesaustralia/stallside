"use client";

import { useState } from "react";
import Link from "next/link";
import type { DemoProduct } from "@/lib/demo";

export default function DemoPreOrderPanel({
  name,
  product,
  checkoutUrl,
  qrDataUrl,
}: {
  name: string;
  product: DemoProduct;
  checkoutUrl: string;
  qrDataUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <div>
        <p className="text-sm font-semibold text-[var(--field)]">
          Send customers this link
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Share it in a Facebook group, Instagram story, WhatsApp, or email -
          buyers open it, order, and pay ahead.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <p className="flex-1 break-all rounded-[var(--radius)] border border-[var(--line)] bg-white px-4 py-3 font-receipt text-sm text-[var(--field)]">
            {checkoutUrl}
          </p>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[var(--field)]">
          Or send them this QR code
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Print it on a poster, flyer, or collection-day sign.
        </p>
        <div className="mt-4 flex justify-center rounded-[var(--radius)] border border-[var(--line)] bg-white p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={`QR code for ${name}`}
            className="size-48 sm:size-56"
          />
        </div>
        <p className="mt-2 text-center text-xs text-[var(--muted)]">{name}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={`/demo/phone?product=${product}`}
          className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
        >
          Try ordering on phone as a customer
        </Link>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--field)]"
        >
          Open order page full screen
        </a>
      </div>
    </div>
  );
}
