"use client";

import { useState, useTransition } from "react";
import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import type { QrPrintSize } from "@/lib/print-qr-sheet";
import QrActions from "@/app/dashboard/(gated)/businesses/[standId]/qr/QrActions";
import QrSignSheet from "@/app/dashboard/(gated)/businesses/[standId]/qr/QrSignSheet";
import { deleteQrCode, updateQrCode } from "../actions";

export default function CategoryQrStudio({
  qrId,
  name: initialName,
  destinationLabel,
  checkoutUrl,
  qrDataUrl,
  fileName,
  siteUrl,
  paymentBrands,
  standName,
  locationLabel,
  logoUrl,
  accentColor,
  secondaryColor,
}: {
  qrId: string;
  name: string;
  destinationLabel: string;
  checkoutUrl: string;
  qrDataUrl: string;
  fileName: string;
  siteUrl: string;
  paymentBrands: PaymentBrand[];
  standName: string;
  locationLabel: string | null;
  logoUrl: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [size, setSize] = useState<QrPrintSize>("a4");

  const sheet = {
    name,
    qrCallout: destinationLabel,
    qrSignMessage: "Scan to browse and pay.",
    description: null,
    locationLabel,
    checkoutUrl,
    qrDataUrl,
    siteUrl,
    paymentBrands,
    logoUrl,
    accentColor,
    secondaryColor,
    showPosterCta: true,
    posterCtaText: "SCAN TO SHOP",
    showInstructions: true,
  };

  function onSave(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateQrCode(qrId, formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Saved.");
    });
  }

  function onDelete() {
    if (!window.confirm("Delete this QR code? Printed posters will still work.")) {
      return;
    }
    startTransition(async () => {
      await deleteQrCode(qrId);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-4 print:hidden">
        <form action={onSave} className="flex flex-col gap-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Poster name</span>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            />
          </label>
          <p className="text-sm text-[var(--muted)]">
            Opens: {destinationLabel}
            <br />
            Business: {standName}
          </p>
          {message ? (
            <p className="text-sm text-[var(--muted)]">{message}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="self-start rounded-full bg-[var(--field)] px-4 py-2 text-sm font-bold text-[var(--ink-on-dark)] disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save name"}
          </button>
        </form>

        <QrActions
          checkoutUrl={checkoutUrl}
          qrDataUrl={qrDataUrl}
          fileName={fileName}
          sheet={sheet}
          size={size}
          onSizeChange={setSize}
        />

        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="self-start text-sm font-semibold text-[var(--gone)] underline"
        >
          Delete QR code
        </button>
      </div>

      <div className="print:contents">
        <QrSignSheet {...sheet} printSize={size} />
      </div>
    </div>
  );
}
