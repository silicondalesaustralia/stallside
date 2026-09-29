import Link from "next/link";
import type { ProductLpContent } from "@/lib/product-lp/types";

export default function ProductLpDoorways({
  heading,
  links,
}: {
  heading?: string;
  links: NonNullable<ProductLpContent["doorwayLinks"]>;
}) {
  if (links.length === 0) return null;
  return (
    <section className="px-5 pb-12 sm:px-6 sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--field)] sm:text-3xl">
          {heading ?? "Built for"}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((d) => (
            <li key={d.href}>
              <Link
                href={d.href}
                className="flex h-full flex-col gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-sm transition hover:border-[var(--leaf)]"
              >
                <span className="font-semibold text-[var(--field)]">{d.label}</span>
                <span className="text-sm text-[var(--muted)]">{d.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
