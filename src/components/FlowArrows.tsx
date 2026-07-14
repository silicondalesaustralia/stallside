type ArrowProps = { className?: string };

/** Vertical curved dashed arrow with mild draw motion. */
export function FlowArrowDown({ className = "h-10 w-8" }: ArrowProps) {
  return (
    <svg
      viewBox="0 0 32 44"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        className="flow-dash"
        d="M16 2 C10 14, 22 22, 16 34"
        stroke="var(--leaf)"
        strokeWidth="1.75"
        strokeDasharray="5 4"
        strokeLinecap="round"
      />
      <path
        d="M11 30 L16 38 L21 30"
        stroke="var(--leaf)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Horizontal curved dashed arrow. */
export function FlowArrowRight({ className = "h-6 w-10" }: ArrowProps) {
  return (
    <svg
      viewBox="0 0 44 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        className="flow-dash"
        d="M2 12 C12 4, 22 20, 32 12"
        stroke="var(--leaf)"
        strokeWidth="1.75"
        strokeDasharray="5 4"
        strokeLinecap="round"
      />
      <path
        d="M28 7 L36 12 L28 17"
        stroke="var(--leaf)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
