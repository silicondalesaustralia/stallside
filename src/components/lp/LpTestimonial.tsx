export default function LpTestimonial() {
  return (
    <section className="px-5 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl rounded-[var(--radius)] border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
        <blockquote>
          <p className="text-lg leading-relaxed text-[var(--ink)] sm:text-xl">
            &ldquo;It was all so easy and fast to set up - your 10-minute setup
            was generous. I did it all in about three!&rdquo;
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            &ldquo;I was keen to try something that didn&apos;t have so many
            fees - like PayID.&rdquo;
          </p>
          <footer className="mt-5 text-sm text-[var(--muted)]">
            <cite className="not-italic font-semibold text-[var(--ink)]">
              Marnie
            </cite>
            {" · Melbourne, Australia"}
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
