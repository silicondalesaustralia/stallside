/** Animated wavy connectors for the desktop zigzag flow. */
export default function FeatureFlowWaves() {
  const paths = [
    // 1 → 2 (down-right)
    "M 118 70 C 150 70, 170 160, 210 175",
    // 2 → 3 (up-right)
    "M 330 220 C 360 220, 380 80, 430 70",
    // 3 → 4 (down-right)
    "M 550 75 C 580 75, 600 175, 650 185",
    // 4 → 5 (up-right)
    "M 770 230 C 800 230, 820 90, 870 80",
  ];

  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 300"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      preserveAspectRatio="none"
    >
      {paths.map((d, i) => (
        <g key={d} className="text-[var(--leaf)]">
          <path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="7 9"
            className="flow-dash opacity-70 motion-reduce:animate-none"
            style={{ color: ["#2e7d3f", "#c77400", "#1e5a2c", "#3d6b5a"][i] }}
          />
          <path
            d={arrowHead(d, i)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: ["#2e7d3f", "#c77400", "#1e5a2c", "#3d6b5a"][i] }}
          />
        </g>
      ))}
    </svg>
  );
}

/** Simple chevron near the end of each connector. */
function arrowHead(_d: string, index: number): string {
  const tips: string[] = [
    "M 200 168 L 210 175 L 202 186",
    "M 420 78 L 430 70 L 438 80",
    "M 640 176 L 650 185 L 642 194",
    "M 860 88 L 870 80 L 878 90",
  ];
  return tips[index] ?? tips[0];
}

export function FeatureFlowWaveDown({ color }: { color: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 56" className="mx-auto h-14 w-12">
      <path
        d="M 24 4 C 8 16, 40 28, 24 44"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 8"
        className="flow-dash motion-reduce:animate-none"
      />
      <path
        d="M 16 38 L 24 48 L 32 38"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
