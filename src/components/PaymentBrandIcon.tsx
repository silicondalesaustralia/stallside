export type PaymentBrand =
  | "cash"
  | "card"
  | "apple"
  | "google"
  | "paypal"
  | "stripe"
  | "payid";

/** Compact payment marks for settings / stand toggles (indicative, not official badges). */
export default function PaymentBrandIcon({
  brand,
  className = "size-5",
}: {
  brand: PaymentBrand;
  className?: string;
}) {
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

  if (brand === "payid") {
    // Official PayID wordmark — wider than square icons.
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
    const maxWidth = extras.includes("max-w-") ? "" : "max-w-[4.5rem]";
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/brand/payid.png"
        alt="PayID"
        aria-hidden
        className={`${height} w-auto ${maxWidth} object-contain object-left ${extras}`}
      />
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
        <path
          fill="#4285F4"
          d="M21.6 12.3c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 5-0.9 6.6-2.4l-3.2-2.5c-.9.6-2.1 1-3.4 1a6.6 6.6 0 0 1-6.2-4.5H2.5v2.6A11 11 0 0 0 12 22Z"
        />
        <path
          fill="#FBBC05"
          d="M5.8 13.6A6.6 6.6 0 0 1 5.4 12c0-.6.1-1.1.3-1.6V7.8H2.5A11 11 0 0 0 1 12c0 1.8.4 3.4 1.5 4.2l3.3-2.6Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.5c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.7 9.7 0 0 0 12 2a11 11 0 0 0-9.5 5.8l3.3 2.6A6.6 6.6 0 0 1 12 5.5Z"
        />
      </svg>
    );
  }

  if (brand === "paypal") {
    return (
      <svg {...common} viewBox="0 0 24 24" fill="currentColor">
        <path
          fill="#003087"
          d="M7.2 20.5 7.9 16c.1-.3.3-.5.6-.5h2.1c3.6 0 6.4-1.5 7-5.5.3-1.7 0-3-.8-4-.9-1.1-2.5-1.6-4.5-1.6H8.1c-.5 0-1 .4-1.1.9L4.2 19.5c-.1.4.2.8.6.8h2.4Z"
        />
        <path
          fill="#009CDE"
          d="M18.8 7.2c-.1 0-.1 0-.2.1.5 3.3-1.4 5.6-4.9 5.6H11.7c-.3 0-.6.2-.7.5l-.9 5.5-.3 1.6c-.1.3.2.6.5.6h2.1c.4 0 .7-.3.8-.6l0-.2.7-4.3 0-.2c.1-.3.4-.5.7-.5h.5c2.9 0 5.2-1.2 5.9-4.6.3-1.4.1-2.6-.6-3.5-.2-.3-.4-.5-.6-.5Z"
        />
      </svg>
    );
  }

  // Official Stripe mark
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/stripe.png"
      alt="Stripe"
      aria-hidden
      className={`${className} object-contain`}
    />
  );
}
