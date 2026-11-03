function CurvyArrow({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 56" fill="none" aria-hidden className={className}>
      <path
        d="M116 12 C 80 2, 30 8, 10 48"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M18.5 42.5 L10 48 L9.5 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomeTryItArrows() {
  return (
    <div aria-hidden className="pointer-events-none h-10 text-[var(--leaf-dark)] xl:grid xl:h-14 xl:grid-cols-[1.45fr_1fr] xl:gap-4">
      <div className="relative h-full">
        <p className="absolute left-1/2 top-0 -translate-x-1/2 -rotate-3 whitespace-nowrap text-xl font-bold italic xl:left-auto xl:right-[67px] xl:translate-x-0">
          Try it!
        </p>
        <CurvyArrow className="absolute right-[135px] top-1 hidden h-14 w-[120px] xl:block" />
        <svg viewBox="0 0 120 150" fill="none" className="absolute right-[-65px] top-1 z-10 hidden h-[150px] w-[120px] xl:block">
          <path
            d="M6 12 C 40 4, 62 20, 63 60 L 63 118 C 63 134, 70 142, 82 143"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path d="M74 136 L82 143 L73 149" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 24 36" fill="none" className="absolute left-[calc(50%+34px)] top-0 h-9 w-6 xl:hidden">
          <path d="M4 4 C 18 10, 18 22, 10 32 M10 32 L8 23 M10 32 L18 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
