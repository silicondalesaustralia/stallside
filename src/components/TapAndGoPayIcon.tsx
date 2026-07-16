/** Contactless card mark — no official universal Tap & Go logo exists. */
export default function TapAndGoPayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect
        x="4"
        y="10"
        width="24"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M8 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M30 14c2.2 2.2 2.2 5.8 0 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M33.5 11.5c4 4 4 10.5 0 14.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
