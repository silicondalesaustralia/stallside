import Image from "next/image";

const BENEFITS = [
  {
    title: "Sell ahead of pickup day",
    body: "Take pre-orders so you know what to prepare. Set available quantities, an order closing time and a collection window.",
    src: "/lp/home-producers/card-vegetables.jpg",
    alt: "A timber crate of freshly harvested carrots, beetroot, kale, radishes and tomatoes",
  },
  {
    title: "Add a little extra",
    body: "Offer a jar of jam, a herb bundle or a pantry favourite with each order. Give customers more of what you make.",
    src: "/lp/home-producers/card-pantry.jpg",
    alt: "Homemade jam jars with gingham lids beside a bundle of fresh herbs and small jars of dried herbs and spices",
  },
  {
    title: "Make it a regular order",
    body: "Offer weekly or fortnightly boxes for the products your regulars come back for. Let customers manage their subscription.",
    src: "/lp/home-producers/card-produce-box.jpg",
    alt: "A mixed produce box with tomatoes, carrots, zucchini, leafy greens, eggs and a sourdough loaf",
  },
] as const;

export default function RevenueBenefits() {
  return (
    <section className="bg-[var(--wash)] px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] font-bold leading-[1.1] tracking-tight text-[var(--field)] sm:text-[2.5rem]">
            You grow it. You make it.{" "}
            <span className="sm:block">Make buying the easy part.</span>
          </h2>
          <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
            One link for customers to order, pay and see when to collect.
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Veggies, jams, herbs, spices, eggs, baking and more.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <li
              key={b.title}
              className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] shadow-sm"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={b.src}
                  alt={b.alt}
                  fill
                  sizes="(min-width: 1152px) 368px, (min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
                  {b.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-[var(--muted)]">
                  {b.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
