import type { CardNetwork } from "@/lib/landing-payment-marks";

/** Compact card-network marks for the homepage payment marquee. */
export default function CardNetworkIcon({
  network,
  className = "h-5 w-8",
}: {
  network: CardNetwork;
  className?: string;
}) {
  if (network === "visa") {
    return (
      <svg
        className={className}
        viewBox="0 0 48 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="48" height="32" rx="4" fill="#1A1F71" />
        <path
          fill="#fff"
          d="M20.2 21.2 22.4 10.8h2.7l-2.2 10.4h-2.7Zm11.6-10.1c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.5 1.4-4.5 3.4 0 1.5 1.3 2.3 2.3 2.8 1 .5 1.4.9 1.4 1.3 0 .7-.9 1.1-1.7 1.1-1.1 0-1.8-.2-2.7-.6l-.4-.2-.4 2.3c.7.3 2 .6 3.3.6 2.8 0 4.6-1.4 4.6-3.5 0-1.2-.7-2.1-2.3-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.4-2.3ZM37.5 10.8h-2.1c-.6 0-1.1.2-1.4.8l-4 9.6h2.8l.6-1.5h3.4l.3 1.5H39l-2.5-10.4Zm-3.1 6.7.9-2.6.2-.6.1-.5.3 1.5.8 2.6h-2.3ZM17.2 10.8l-2.6 7-.3-1.4c-.5-1.7-2-3.5-3.7-4.4l2.4 8.8h2.8l4.2-10h-2.8Z"
        />
        <path
          fill="#F9A51A"
          d="M12.2 10.8H8.1l-.1.4C11 12 13 14.1 13.7 16.6l.4 1.6.8-5.6c.1-.6.6-.9 1.1-.9l-3.8-.9Z"
        />
      </svg>
    );
  }

  if (network === "mastercard") {
    return (
      <svg
        className={className}
        viewBox="0 0 48 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="48" height="32" rx="4" fill="#1A1A1A" />
        <circle cx="19" cy="16" r="8" fill="#EB001B" />
        <circle cx="29" cy="16" r="8" fill="#F79E1B" />
        <path
          fill="#FF5F00"
          d="M24 10.3a8 8 0 0 0-2.5 5.7A8 8 0 0 0 24 21.7a8 8 0 0 0 2.5-5.7A8 8 0 0 0 24 10.3Z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="48" height="32" rx="4" fill="#2E77BC" />
      <rect x="6" y="8" width="10" height="7" rx="1" fill="#FFCC4E" />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        fill="#fff"
        fontSize="7"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        AMEX
      </text>
    </svg>
  );
}
