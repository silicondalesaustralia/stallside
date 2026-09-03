"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import QRCode from "qrcode";
import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import { standCheckoutUrl, standQrTargetUrl } from "@/lib/stand-qr";
import { updateStandQrPrint } from "../../actions";
import type { QrPrintSize } from "@/lib/print-qr-sheet";
import QrActions from "./QrActions";
import QrPagePreview from "./QrPagePreview";
import QrSignSheet, { type QrSignSheetProps } from "./QrSignSheet";

const SignHtmlEditor = dynamic(() => import("@/components/SignHtmlEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-36 animate-pulse rounded-lg border border-[var(--line)] bg-[var(--wash)]" />
  ),
});

export type QrLinkMode = "LEGACY_STAND" | "WEBSITE_HOME" | "WEBSITE_CATEGORY";

export type QrStudioStand = {
  id: string;
  name: string;
  description: string | null;
  locationLabel: string | null;
  qrSignMessage: string | null;
  qrCallout: string | null;
  cartMode: "PRODUCT" | "CUSTOMER_CHOICE";
  qrLinkMode: QrLinkMode;
  qrCategoryId: string | null;
  posterShowCta: boolean;
  posterCtaText: string | null;
  posterShowBundles: boolean;
  posterShowFirstOrder: boolean;
  posterShowInstructions: boolean;
  posterShowFreshness: boolean;
  posterShowHowItWorks: boolean;
  slug: string;
  logoUrl: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
};

export default function QrStudio({
  stand,
  siteUrl,
  paymentBrands,
  initialCheckoutUrl,
  initialQrDataUrl,
  fileName,
  bundleLines,
  firstOrderLine,
  freshnessLines,
  urlWarning,
  storefrontSlug,
  categories,
  primaryCustomHostname,
}: {
  stand: QrStudioStand;
  siteUrl: string;
  paymentBrands: PaymentBrand[];
  initialCheckoutUrl: string;
  initialQrDataUrl: string;
  fileName: string;
  bundleLines: string[];
  firstOrderLine: string | null;
  freshnessLines: string[];
  urlWarning?: ReactNode;
  storefrontSlug: string | null;
  categories: { id: string; slug: string; title: string }[];
  primaryCustomHostname?: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [size, setSize] = useState<QrPrintSize>("a4");

  const [name, setName] = useState(stand.name);
  const [locationLabel, setLocationLabel] = useState(stand.locationLabel ?? "");
  const [qrCallout, setQrCallout] = useState(stand.qrCallout ?? "");
  const [qrSignMessage, setQrSignMessage] = useState(stand.qrSignMessage ?? "");
  const [description, setDescription] = useState(stand.description ?? "");
  const [cartMode, setCartMode] = useState<"PRODUCT" | "CUSTOMER_CHOICE">(
    stand.cartMode,
  );
  const [qrLinkMode, setQrLinkMode] = useState<QrLinkMode>(stand.qrLinkMode);
  const [qrCategoryId, setQrCategoryId] = useState(stand.qrCategoryId ?? "");
  const [posterShowCta, setPosterShowCta] = useState(stand.posterShowCta);
  const [posterCtaText, setPosterCtaText] = useState(
    stand.posterCtaText ?? "SCAN TO PAY - CASH OR CARD",
  );
  const [posterShowBundles, setPosterShowBundles] = useState(
    stand.posterShowBundles,
  );
  const [posterShowFirstOrder, setPosterShowFirstOrder] = useState(
    stand.posterShowFirstOrder,
  );
  const [posterShowInstructions, setPosterShowInstructions] = useState(
    stand.posterShowInstructions,
  );
  const [posterShowFreshness, setPosterShowFreshness] = useState(
    stand.posterShowFreshness,
  );
  const [posterShowHowItWorks, setPosterShowHowItWorks] = useState(
    stand.posterShowHowItWorks,
  );

  const categorySlug =
    categories.find((c) => c.id === qrCategoryId)?.slug ?? null;

  const effectiveLinkMode: QrLinkMode =
    cartMode === "CUSTOMER_CHOICE" ? "LEGACY_STAND" : qrLinkMode;

  const checkoutUrl = useMemo(
    () =>
      standQrTargetUrl({
        linkMode: effectiveLinkMode,
        standSlug: stand.slug,
        cartMode,
        storefrontSlug,
        categorySlug,
        primaryCustomHostname,
      }),
    [
      effectiveLinkMode,
      stand.slug,
      cartMode,
      storefrontSlug,
      categorySlug,
      primaryCustomHostname,
    ],
  );
  const [qrDataUrl, setQrDataUrl] = useState(initialQrDataUrl);

  useEffect(() => {
    if (checkoutUrl === initialCheckoutUrl) {
      setQrDataUrl(initialQrDataUrl);
      return;
    }
    let cancelled = false;
    void QRCode.toDataURL(checkoutUrl, {
      margin: 2,
      width: 640,
      color: { dark: "#1a2e1a", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [checkoutUrl, initialCheckoutUrl, initialQrDataUrl]);

  const sheet: QrSignSheetProps = {
    name: name.trim() || stand.name,
    qrCallout: qrCallout || null,
    qrSignMessage: qrSignMessage || null,
    description: description || null,
    locationLabel: locationLabel.trim() || null,
    checkoutUrl,
    qrDataUrl,
    siteUrl,
    paymentBrands,
    logoUrl: stand.logoUrl,
    accentColor: stand.accentColor,
    secondaryColor: stand.secondaryColor,
    showPosterCta: posterShowCta,
    posterCtaText: posterCtaText.trim() || null,
    bundleLines: posterShowBundles ? bundleLines : [],
    firstOrderLine: posterShowFirstOrder ? firstOrderLine : null,
    freshnessLines: posterShowFreshness ? freshnessLines : [],
    showHowItWorks: posterShowHowItWorks,
    showInstructions: posterShowInstructions,
  };

  const compact = size !== "a4";
  const save = updateStandQrPrint.bind(null, stand.id);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await save(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Saved.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start print:block print:gap-0">
      <form
        action={onSubmit}
        className="flex flex-col gap-4 print:hidden"
      >
        <input type="hidden" name="standId" value={stand.id} />
        <h2 className="text-lg font-semibold">Edit QR sign</h2>
        <p className="text-sm text-[var(--muted)]">
          Changes update the preview as you type. Save to keep them for next time.
        </p>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="font-medium">QR destination</legend>
          <p className="text-xs text-[var(--muted)]">
            Prefer your website for new signs. Legacy /s/ links still work for
            old posters.
          </p>
          <label className="flex items-start gap-2">
            <input
              type="radio"
              name="qrLinkMode"
              value="WEBSITE_HOME"
              checked={qrLinkMode === "WEBSITE_HOME"}
              onChange={() => setQrLinkMode("WEBSITE_HOME")}
              disabled={!storefrontSlug}
              className="mt-1"
            />
            <span>
              <span className="font-medium">Website home</span>
              <span className="block text-[var(--muted)]">
                Opens your storefront homepage.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="radio"
              name="qrLinkMode"
              value="WEBSITE_CATEGORY"
              checked={qrLinkMode === "WEBSITE_CATEGORY"}
              onChange={() => setQrLinkMode("WEBSITE_CATEGORY")}
              disabled={!storefrontSlug || categories.length === 0}
              className="mt-1"
            />
            <span>
              <span className="font-medium">Website category</span>
              <span className="block text-[var(--muted)]">
                Deep-link to a category page (works for stall-only categories
                too).
              </span>
            </span>
          </label>
          {qrLinkMode === "WEBSITE_CATEGORY" ? (
            <label className="flex flex-col gap-1 pl-6 text-sm">
              <span className="font-medium">Category</span>
              <select
                name="qrCategoryId"
                value={qrCategoryId}
                onChange={(e) => setQrCategoryId(e.target.value)}
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <input type="hidden" name="qrCategoryId" value={qrCategoryId} />
          )}
          <label className="flex items-start gap-2">
            <input
              type="radio"
              name="qrLinkMode"
              value="LEGACY_STAND"
              checked={qrLinkMode === "LEGACY_STAND"}
              onChange={() => setQrLinkMode("LEGACY_STAND")}
              className="mt-1"
            />
            <span>
              <span className="font-medium">Legacy stand page</span>
              <span className="block text-[var(--muted)]">
                Classic stand checkout URL. Customer Choice requires this.
              </span>
            </span>
          </label>
        </fieldset>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="font-medium">Cart mode</legend>
          <label className="flex items-start gap-2">
            <input
              type="radio"
              name="cartMode"
              value="PRODUCT"
              checked={cartMode === "PRODUCT"}
              onChange={() => setCartMode("PRODUCT")}
              className="mt-1"
            />
            <span>
              <span className="font-medium">Product cart</span>
              <span className="block text-[var(--muted)]">
                Browse products, add to cart, then pay.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="radio"
              name="cartMode"
              value="CUSTOMER_CHOICE"
              checked={cartMode === "CUSTOMER_CHOICE"}
              onChange={() => setCartMode("CUSTOMER_CHOICE")}
              className="mt-1"
            />
            <span>
              <span className="font-medium">Customer Choice cart</span>
              <span className="block text-[var(--muted)]">
                QR opens a calculator — dollar amounts, no products.
              </span>
            </span>
          </label>
        </fieldset>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Stand name</span>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Location</span>
          <input
            name="locationLabel"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="Gate on Miller Rd"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Attention callout</span>
          <SignHtmlEditor
            name="qrCallout"
            height={120}
            defaultValue={stand.qrCallout ?? ""}
            placeholder="ATTENTION or PLEASE NOTE"
            onChange={setQrCallout}
          />
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Sign message under the name</span>
          <SignHtmlEditor
            name="qrSignMessage"
            height={120}
            defaultValue={stand.qrSignMessage ?? ""}
            placeholder="Scan to browse and pay at this stand."
            onChange={setQrSignMessage}
          />
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Instructions</span>
          <SignHtmlEditor
            name="description"
            height={200}
            defaultValue={stand.description ?? ""}
            placeholder="Step 1: Scan QR code…"
            onChange={setDescription}
          />
        </div>

        <fieldset className="flex flex-col gap-3 rounded-lg border border-[var(--line)] p-3">
          <legend className="px-1 text-sm font-medium">Poster sections</legend>
          <p className="text-xs text-[var(--muted)]">
            Check to show on the printout. Edit text above (or CTA below) to change
            what appears.
          </p>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="posterShowCta"
              checked={posterShowCta}
              onChange={(e) => setPosterShowCta(e.target.checked)}
              className="size-4"
            />
            Big CTA headline
          </label>
          {posterShowCta ? (
            <label className="flex flex-col gap-1 text-sm pl-6">
              <span className="font-medium">CTA text</span>
              <input
                name="posterCtaText"
                maxLength={60}
                value={posterCtaText}
                onChange={(e) => setPosterCtaText(e.target.value)}
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
              />
            </label>
          ) : (
            <input type="hidden" name="posterCtaText" value={posterCtaText} />
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="posterShowInstructions"
              checked={posterShowInstructions}
              onChange={(e) => setPosterShowInstructions(e.target.checked)}
              className="size-4"
            />
            Sign message + instructions
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="posterShowBundles"
              checked={posterShowBundles}
              onChange={(e) => setPosterShowBundles(e.target.checked)}
              className="size-4"
            />
            Bundle / volume prices
            {bundleLines.length === 0 ? (
              <span className="text-xs text-[var(--muted)]">
                (none set on products yet)
              </span>
            ) : null}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="posterShowFirstOrder"
              checked={posterShowFirstOrder}
              onChange={(e) => setPosterShowFirstOrder(e.target.checked)}
              className="size-4"
            />
            First-order offer
            {!firstOrderLine ? (
              <span className="text-xs text-[var(--muted)]">
                (enable in business conversion settings)
              </span>
            ) : null}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="posterShowFreshness"
              checked={posterShowFreshness}
              onChange={(e) => setPosterShowFreshness(e.target.checked)}
              className="size-4"
            />
            Freshness lines
            {freshnessLines.length === 0 ? (
              <span className="text-xs text-[var(--muted)]">
                (add freshness notes on products)
              </span>
            ) : null}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="posterShowHowItWorks"
              checked={posterShowHowItWorks}
              onChange={(e) => setPosterShowHowItWorks(e.target.checked)}
              className="size-4"
            />
            How it works (Scan · Pick · Pay)
          </label>
        </fieldset>

        {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save sign details"}
        </button>
      </form>

      <div className="flex flex-col gap-4 lg:sticky lg:top-4 print:contents">
        <QrPagePreview
          size={size}
          sheet={sheet}
          showCaption
          className="print:hidden"
        />

        <div
          className="pointer-events-none fixed left-[-10000px] top-0 w-[210mm]"
          aria-hidden
        >
          <QrSignSheet
            {...sheet}
            printable
            layout={compact ? "compact" : "full"}
            printSize={size}
          />
        </div>

        <div className="print:hidden">
          {urlWarning}
          <QrActions
            checkoutUrl={checkoutUrl}
            qrDataUrl={qrDataUrl}
            fileName={fileName}
            sheet={sheet}
            size={size}
            onSizeChange={setSize}
          />
        </div>
      </div>
    </div>
  );
}
