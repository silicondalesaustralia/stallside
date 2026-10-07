import BotanicalSprig from "@/components/lp/home-producers/BotanicalSprig";

export default function FounderStory() {
  return (
    <section className="bg-[var(--field)] px-5 py-14 text-[var(--ink-on-dark)] sm:px-8 lg:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="hidden justify-center md:flex">
          <BotanicalSprig className="h-56 w-auto text-[var(--ink-on-dark)]/60 lg:h-64" />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[2.25rem]">
            It started with a customer asking us to put some aside.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--ink-on-dark)]/90 sm:text-lg">
            An egg customer asked for a weekly reservation. That simple request became a
            subscription—and one of the reasons we built Vendl.
          </p>
          <p className="mt-4 text-sm font-semibold text-[var(--ink-on-dark)]/80">
            The Vendl team
          </p>
        </div>
      </div>
    </section>
  );
}
