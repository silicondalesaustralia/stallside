import { testimonials } from "@/lib/testimonials";

const marnie = testimonials.find((t) => t.id === "marnie-melbourne");

export default function LpTestimonial() {
  if (!marnie) return null;

  const quote = [
    marnie.quote[1],
    marnie.quote[2],
  ].filter(Boolean);

  return (
    <section className="bg-[var(--wash)] px-5 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <blockquote>
          {quote.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-3 text-base leading-relaxed text-[var(--ink)] first:mt-0 sm:text-lg"
            >
              &ldquo;{paragraph}&rdquo;
            </p>
          ))}
          <footer className="mt-5 text-sm text-[var(--muted)]">
            <cite className="not-italic font-semibold text-[var(--ink)]">
              {marnie.name}
            </cite>
            {" · "}
            {marnie.location}
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
