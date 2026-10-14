export default function NavIconSvg({
  d,
  extra,
}: {
  d: string;
  extra?: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0"
      aria-hidden
    >
      <path d={d} />
      {extra}
    </svg>
  );
}
