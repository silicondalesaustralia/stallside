export function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
      {children}
    </h2>
  );
}

export function SectionH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
      {children}
    </h3>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[var(--field)] leading-relaxed">{children}</p>;
}

export function ProseFollow({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[var(--field)] leading-relaxed">{children}</p>;
}
