import Image from "next/image";

const LIST = [
  { product: "Veggie boxes", qty: 12, unit: "boxes", src: "/lp/home-producers/card-vegetables.jpg", pos: "object-center" },
  { product: "Jam jars", qty: 18, unit: "jars", src: "/lp/home-producers/card-pantry.jpg", pos: "object-[12%_45%]" },
  { product: "Herb bundles", qty: 10, unit: "bundles", src: "/lp/home-producers/card-pantry.jpg", pos: "object-[60%_75%]" },
] as const;

const STEPS = [
  {
    title: "Set your next collection.",
    body: "Add your products, prices, available quantities and collection time.",
  },
  {
    title: "Share your link.",
    body: "Send it to customers or add it to your social posts.",
  },
  {
    title: "Prepare from your orders.",
    body: "See what to pick, make and pack for collection day.",
  },
] as const;

export default function CollectionPreview() {
  return (
    <section className="bg-[var(--panel)] px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-0">
        <div className="lg:pr-14">
          <h2 className="font-[family-name:var(--font-display)] text-[1.75rem] font-bold leading-[1.1] tracking-tight text-[var(--field)] sm:text-[2.5rem]">
            See what to prepare.{" "}
            <span className="sm:block">Know who it is for.</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Get a clear list of orders for collection day, then pack by customer and keep
            track of handover.
          </p>

          <figure className="mt-7 max-w-md rounded-[20px] border border-[var(--line)] bg-[var(--wash)] p-4 sm:p-5">
            <figcaption className="text-sm font-semibold text-[var(--ink)]">
              Example collection list
            </figcaption>
            <table className="mt-3 w-full border-separate border-spacing-y-2">
              <thead className="sr-only">
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {LIST.map((row) => (
                  <tr key={row.product} className="bg-white shadow-sm">
                    <th scope="row" className="rounded-l-[12px] p-2 text-left font-semibold">
                      <span className="flex items-center gap-3">
                        <Image
                          src={row.src}
                          alt=""
                          width={40}
                          height={40}
                          sizes="40px"
                          className={`size-10 shrink-0 rounded-[8px] object-cover ${row.pos}`}
                        />
                        {row.product}
                      </span>
                    </th>
                    <td className="rounded-r-[12px] p-2 pr-4 text-right">
                      <span className="block font-[family-name:var(--font-display)] text-xl font-bold leading-none text-[var(--field)]">
                        {row.qty}
                      </span>
                      <span className="text-xs text-[var(--muted)]">{row.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        </div>

        <ol className="flex flex-col justify-center gap-7 lg:border-l lg:border-[var(--line)] lg:pl-14">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--wash)] font-[family-name:var(--font-display)] text-lg font-bold text-[var(--leaf-dark)]"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--field)]">
                  {step.title}
                </h3>
                <p className="mt-1 text-base leading-relaxed text-[var(--muted)]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
