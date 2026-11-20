import { HOME_EYEBROW, HOME_H2, HOME_H3, HOME_WRAP } from "@/components/home/home-styles";
import type { FeatureFlow as Flow } from "@/lib/features/flows";

/** Connected process path — not a diamond flowchart. */
export default function FeatureFlow({ flow }: { flow: Flow }) {
  return (
    <section className="border-t border-[var(--line)] bg-[var(--wash)] py-16 md:py-[88px]">
      <div className={HOME_WRAP}>
        <p className={HOME_EYEBROW}>{flow.eyebrow}</p>
        <h2 className={HOME_H2}>{flow.heading}</h2>

        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {flow.nodes.map((node, index) => (
            <li
              key={node.label}
              className="relative rounded-xl border border-[var(--line)] bg-white p-4 shadow-[0_4px_16px_#17361f08]"
            >
              <p className="text-[11px] font-bold tracking-[0.14em] text-[var(--leaf)]">
                {String(index + 1).padStart(2, "0")}
                {index < flow.nodes.length - 1 ? (
                  <span className="ml-2 hidden text-[var(--muted)] lg:inline" aria-hidden>
                    →
                  </span>
                ) : null}
              </p>
              <h3 className={`${HOME_H3} mt-2 text-lg`}>{node.label}</h3>
              <p className="mt-1.5 text-sm text-[var(--muted)]">{node.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
