"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import AtStallToggle from "@/components/qr/AtStallToggle";
import type { QrPoster } from "@/lib/qr/poster";
import type { PosterExtras } from "@/lib/qr/poster-extras";
import type { QrSignSheetProps } from "@/app/dashboard/(gated)/businesses/[standId]/qr/QrSignSheet";
import { saveQrDesign } from "@/app/dashboard/(gated)/qr/[qrId]/qr-edit-actions";
import QrDeleteButton from "./QrDeleteButton";
import PosterPreviewColumn from "./PosterPreviewColumn";
import PosterSectionToggles from "./PosterSectionToggles";
import PosterTextFields from "./PosterTextFields";

export type QrStudioBrand = {
  siteUrl: string;
  paymentBrands: PaymentBrand[];
  logoUrl: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
};

export default function QrCodeStudio({
  qrId,
  initialName,
  initialAtStall,
  initialPoster,
  qrUrl,
  qrDataUrl,
  fileName,
  brand,
  extras,
}: {
  qrId: string;
  initialName: string;
  initialAtStall: boolean;
  initialPoster: QrPoster;
  qrUrl: string;
  qrDataUrl: string;
  fileName: string;
  brand: QrStudioBrand;
  extras: PosterExtras;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [atStall, setAtStall] = useState(initialAtStall);
  const [poster, setPoster] = useState<QrPoster>(initialPoster);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const update = (patch: Partial<QrPoster>) => setPoster((p) => ({ ...p, ...patch }));

  const sheet: QrSignSheetProps = {
    ...brand,
    name: poster.title.trim() || initialName,
    qrCallout: poster.qrCallout || null,
    qrSignMessage: poster.qrSignMessage || null,
    description: poster.description || null,
    locationLabel: poster.locationLabel.trim() || null,
    checkoutUrl: qrUrl,
    qrDataUrl,
    showPosterCta: poster.showCta,
    posterCtaText: poster.ctaText.trim() || null,
    bundleLines: poster.showBundles ? extras.bundleLines : [],
    firstOrderLine: poster.showFirstOrder ? extras.firstOrderLine : null,
    freshnessLines: poster.showFreshness ? extras.freshnessLines : [],
    showHowItWorks: poster.showHowItWorks,
    showInstructions: poster.showInstructions,
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await saveQrDesign(qrId, { name, atStall, poster });
        if ("error" in result) return setMessage(result.error);
        setMessage("Saved.");
        router.refresh();
      } catch (err) {
        console.error("[qr] save failed", err);
        setMessage("Could not save. Please try again.");
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start print:block print:gap-0">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 print:hidden">
        <h2 className="text-lg font-semibold">Design the poster</h2>
        <p className="text-sm text-[var(--muted)]">
          The preview updates as you type. Save to keep your changes for this QR code.
        </p>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">QR code name</span>
          <input
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
          <span className="text-xs text-[var(--muted)]">Only you see this.</span>
        </label>
        <AtStallToggle checked={atStall} onChange={setAtStall} />
        <PosterTextFields poster={poster} initial={initialPoster} onChange={update} />
        <PosterSectionToggles poster={poster} extras={extras} onChange={update} />
        {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save poster"}
          </button>
          <QrDeleteButton qrId={qrId} />
        </div>
      </form>
      <PosterPreviewColumn sheet={sheet} fileName={fileName} />
    </div>
  );
}
