import { HOME_EYEBROW, HOME_H2, HOME_H3, HOME_WRAP } from "@/components/home/home-styles";
import type { FeatureFlow as Flow } from "@/lib/features/flows";

/** Visual process flowchart — numbered nodes with connecting arrows. */
export default function FeatureFlow({ flow }: { flow: Flow }) {
  return (
    <section id="flow" className="scroll-mt-24 border-t border-[var(--line)] bg-[#eef2ea] py-16 md:py-[88px]">
      <div className={HOME_WRAP}>
        <p className={HOME_EYEBROW}>PROCESS FLOW</p>
        <h2 className={HOME_H2}>{flow.heading}</h2>
        <p className="mt-3 max-w-[520px] text-sm text-[var(--muted)]">
          How this feature moves from start to finish — follow the arrows.
        </p>

        {/* Mobile: vertical flowchart */}
        <ol className="mt-10 flex flex-col items-stretch md:hidden">
          {flow.nodes.map((node, index) => (
            <li key={node.label} className="flex flex-col items-center">
              <div className="w-full rounded-xl border-2 border-[var(--field)] bg-white p-4 shadow-[0_4px_16px_#17361f10]">
                <p className="text-[11px] font-bold tracking-[0.14em] text-[var(--leaf)]">
                  STEP {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className={`${HOME_H3} mt-1 text-xl`}>{node.label}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{node.detail}</p>
              </div>
              {index < flow.nodes.length - 1 ? (
                <div aria-hidden className="flex flex-col items-center py-1 text-[var(--field)]">
                  <span className="h-6 w-0.5 bg-[var(--field)]" />
                  <span className="text-lg leading-none">▼</span>
                </div>
              ) : null}
            </li>
          ))}
        </ol>

        {/* Desktop: horizontal flowchart with arrow connectors */}
        <ol className="mt-10 hidden md:flex md:items-stretch md:justify-between md:gap-0">
          {flow.nodes.map((node, index) => (
            <li key={node.label} className="flex min-w-0 flex-1 items-stretch">
              <div className="flex w-full min-w-0 flex-col rounded-xl border-2 border-[var(--field)] bg-white p-4 shadow-[0_4px_16px_#17361f10]">
                <p className="text-[11px] font-bold tracking-[0.14em] text-[var(--leaf)]">
                  STEP {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className={`${HOME_H3} mt-2 text-base lg:text-lg`}>{node.label}</h3>
                <p className="mt-1.5 flex-1 text-xs text-[var(--muted)] lg:text-sm">{node.detail}</p>
              </div>
              {index < flow.nodes.length - 1 ? (
                <div
                  aria-hidden
                  className="flex shrink-0 items-center px-1 text-xl font-bold text-[var(--field)] lg:px-2 lg:text-2xl"
                >
                  →
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
