"use client";

import dynamic from "next/dynamic";
import type { QrPoster } from "@/lib/qr/poster";

const SignHtmlEditor = dynamic(() => import("@/components/SignHtmlEditor"), {
  ssr: false,
  loading: () => <div className="h-36 animate-pulse rounded-lg border border-[var(--line)] bg-[var(--wash)]" />,
});

const inputClass = "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5";

export default function PosterTextFields({
  poster,
  initial,
  onChange,
}: {
  poster: QrPoster;
  initial: QrPoster;
  onChange: (patch: Partial<QrPoster>) => void;
}) {
  return (
    <>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Poster heading</span>
        <input
          required
          maxLength={80}
          value={poster.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Location</span>
        <input
          maxLength={120}
          value={poster.locationLabel}
          onChange={(e) => onChange({ locationLabel: e.target.value })}
          placeholder="Gate on Miller Rd"
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Attention callout</span>
        <SignHtmlEditor
          name="qrCallout"
          height={120}
          defaultValue={initial.qrCallout}
          placeholder="ATTENTION or PLEASE NOTE"
          onChange={(v) => onChange({ qrCallout: v })}
        />
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Sign message under the heading</span>
        <SignHtmlEditor
          name="qrSignMessage"
          height={120}
          defaultValue={initial.qrSignMessage}
          placeholder="Scan to browse and pay."
          onChange={(v) => onChange({ qrSignMessage: v })}
        />
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Instructions</span>
        <SignHtmlEditor
          name="description"
          height={200}
          defaultValue={initial.description}
          placeholder="Step 1: Scan the QR code…"
          onChange={(v) => onChange({ description: v })}
        />
      </div>
    </>
  );
}
