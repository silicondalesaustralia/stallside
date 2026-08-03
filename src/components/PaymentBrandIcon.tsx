import {
  paymentBrandSrc,
  WORDMARK_BRANDS,
  type PaymentBrand,
} from "@/lib/payment-brand-assets";

export type { PaymentBrand };

/** Compact payment marks for settings / stand toggles / QR / checkout. */
export default function PaymentBrandIcon({
  brand,
  className = "size-5",
}: {
  brand: PaymentBrand;
  className?: string;
}) {
  const asset = paymentBrandSrc(brand);
  if (asset && (WORDMARK_BRANDS.has(brand) || brand === "stripe")) {
    return <WordmarkImg brand={brand} src={asset} className={className} />;
  }

  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
  };

  if (brand === "cash") {
    return (
      <svg {...common}>
        <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M6 9v6M18 9v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (brand === "card") {
    return (
      <svg {...common}>
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.75" />
        <path d="M6 15h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (brand === "apple") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M14.7 7.2c-.8.1-1.8.6-2.3 1.3-.5.6-.9 1.5-.8 2.3.9.1 1.8-.4 2.4-1.1.5-.7.9-1.6.7-2.5ZM14.9 11c-1.3-.1-2.4.7-3 .7-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.7-3.1 1.9-1.4 2.3-.3 5.8 1 7.7.6.9 1.4 1.9 2.4 1.9 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6c1 0 1.7-1 2.3-1.9.7-1 1-2 1-2.1-.1 0-1.9-.7-1.9-2.9 0-1.8 1.5-2.7 1.5-2.7-.9-1.2-2.2-1.4-2.7-1.4Z" />
      </svg>
    );
  }

  if (brand === "google") {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path fill="#4285F4" d="M21.6 12.3c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-0.9 6.6-2.4l-3.2-2.5c-.9.6-2.1 1-3.4 1a6.6 6.6 0 0 1-6.2-4.5H2.5v2.6A11 11 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M5.8 13.6A6.6 6.6 0 0 1 5.4 12c0-.6.1-1.1.3-1.6V7.8H2.5A11 11 0 0 0 1 12c0 1.8.4 3.4 1.5 4.2l3.3-2.6Z" />
        <path fill="#EA4335" d="M12 5.5c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.7 9.7 0 0 0 12 2a11 11 0 0 0-9.5 5.8l3.3 2.6A6.6 6.6 0 0 1 12 5.5Z" />
      </svg>
    );
  }

  if (brand === "paypal") {
    return (
      <svg {...common} viewBox="0 0 24 24" fill="currentColor">
        <path fill="#003087" d="M7.2 20.5 7.9 16c.1-.3.3-.5.6-.5h2.1c3.6 0 6.4-1.5 7-5.5.3-1.7 0-3-.8-4-.9-1.1-2.5-1.6-4.5-1.6H8.1c-.5 0-1 .4-1.1.9L4.2 19.5c-.1.4.2.8.6.8h2.4Z" />
        <path fill="#009CDE" d="M18.8 7.2c-.1 0-.1 0-.2.1.5 3.3-1.4 5.6-4.9 5.6H11.7c-.3 0-.6.2-.7.5l-.9 5.5-.3 1.6c-.1.3.2.6.5.6h2.1c.4 0 .7-.3.8-.6l0-.2.7-4.3 0-.2c.1-.3.4-.5.7-.5h.5c2.9 0 5.2-1.2 5.9-4.6.3-1.4.1-2.6-.6-3.5-.2-.3-.4-.5-.6-.5Z" />
      </svg>
    );
  }

  if (brand === "cashapp") {
    return (
      <svg {...common} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#00C244" />
        <path
          fill="#fff"
          d="M12.2 6.2c1.7 0 3.1.5 4.1 1.4l-1.3 1.5c-.7-.6-1.7-1-2.8-1-1.7 0-2.9.9-2.9 2.1 0 1.1.7 1.7 2.5 2.2l1 .3c2.5.7 3.7 1.8 3.7 3.7 0 2.3-1.9 3.8-4.5 3.8-1.8 0-3.3-.6-4.4-1.7l1.4-1.5c.8.8 1.9 1.3 3 1.3 1.7 0 2.8-.8 2.8-2.1 0-1.1-.8-1.8-2.6-2.3l-1-.3c-2.3-.6-3.5-1.8-3.5-3.6 0-2.2 1.8-3.8 4.5-3.8Z"
        />
      </svg>
    );
  }

  if (brand === "link") {
    return (
      <svg {...common} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#00D66F" />
        <path
          fill="#fff"
          d="M7.5 12a4.5 4.5 0 0 1 4.5-4.5h1.2v2.2H12a2.3 2.3 0 1 0 0 4.6h1.2v2.2H12A4.5 4.5 0 0 1 7.5 12Zm9 0a4.5 4.5 0 0 1-4.5 4.5h-1.2v-2.2H12a2.3 2.3 0 1 0 0-4.6h-1.2V7.5H12A4.5 4.5 0 0 1 16.5 12Z"
        />
      </svg>
    );
  }

  return null;
}

function WordmarkImg({
  brand,
  src,
  className,
}: {
  brand: PaymentBrand;
  src: string;
  className: string;
}) {
  // size-* without max-w = square slot (settings toggles) - do not expand wide.
  const squareSlot =
    brand === "stripe" ||
    (/\bsize-\d+\b/.test(className) && !className.includes("max-w-"));
  if (squareSlot) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden
        className={`${className} object-contain`}
      />
    );
  }

  const height =
    className.includes("size-7") || className.includes("h-7")
      ? "h-7"
      : className.includes("size-6") || className.includes("h-6")
        ? "h-6"
        : className.includes("size-4") || className.includes("h-4")
          ? "h-4"
          : "h-5";
  const extras = className
    .replace(/\bsize-\d+\b/g, "")
    .replace(/\bh-\d+\b/g, "")
    .trim();
  const maxWidth = extras.includes("max-w-")
    ? ""
    : brand === "payto"
      ? "max-w-[5rem]"
      : brand === "klarna"
        ? "max-w-[4.25rem]"
        : brand === "zip"
          ? "max-w-[2.75rem]"
          : "max-w-[4.5rem]";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      className={`${height} w-auto ${maxWidth} object-contain object-left ${extras}`}
    />
  );
}
