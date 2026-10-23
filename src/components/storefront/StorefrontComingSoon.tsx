export default function StorefrontComingSoon({ name }: { name: string }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Coming soon
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
        {name}
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Our online shop is almost ready. Check back soon.
      </p>
    </main>
  );
}
