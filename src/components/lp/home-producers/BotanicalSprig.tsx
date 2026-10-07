type Props = { className?: string };

const LEAVES = [
  { d: "M60 150c-18-4-30-16-34-32 17 2 29 13 34 32Z" },
  { d: "M62 122c16-8 32-6 44 4-15 7-30 7-44-4Z" },
  { d: "M58 98c-16-2-28-12-33-26 16 1 28 10 33 26Z" },
  { d: "M61 76c12-9 26-10 38-4-12 8-25 9-38 4Z" },
] as const;

const BLOOMS = [
  { cx: 60, cy: 30 },
  { cx: 38, cy: 44 },
  { cx: 84, cy: 42 },
] as const;

/** Decorative line-art herb sprig; hidden from assistive technology. */
export default function BotanicalSprig({ className }: Props) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 120 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M60 196C58 150 62 100 60 30" />
      <path d="M60 60 38 44M60 56l24-14" />
      {LEAVES.map((leaf) => (
        <path key={leaf.d} d={leaf.d} />
      ))}
      {BLOOMS.map((b) => (
        <g key={`${b.cx}-${b.cy}`}>
          <circle cx={b.cx} cy={b.cy} r={3} />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={b.cx + Math.cos(rad) * 4}
                y1={b.cy + Math.sin(rad) * 4}
                x2={b.cx + Math.cos(rad) * 9}
                y2={b.cy + Math.sin(rad) * 9}
              />
            );
          })}
        </g>
      ))}
    </svg>
  );
}
