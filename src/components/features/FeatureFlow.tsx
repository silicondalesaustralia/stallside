import FeatureFlowWaves, { FeatureFlowWaveDown } from "@/components/features/FeatureFlowWaves";
import { FLOW_DESKTOP_POS, FLOW_STEP_THEMES } from "@/components/features/FeatureFlowThemes";
import { HOME_EYEBROW, HOME_H2, HOME_H3, HOME_WRAP } from "@/components/home/home-styles";
import type { FeatureFlow as Flow } from "@/lib/features/flows";

function StepCard({
  index,
  label,
  detail,
  className = "",
  style,
}: {
  index: number;
  label: string;
  detail: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const theme = FLOW_STEP_THEMES[index % FLOW_STEP_THEMES.length];
  const Icon = theme.Icon;

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-[0_10px_28px_#17361f14] ${className}`}
      style={{ borderColor: theme.ring, ...style }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
          style={{ backgroundColor: theme.accent }}
        >
          <Icon aria-hidden className="size-5" strokeWidth={2} />
        </span>
        <p className="text-[11px] font-bold tracking-[0.14em]" style={{ color: theme.accent }}>
          STEP {String(index + 1).padStart(2, "0")}
        </p>
      </div>
      <h3 className={`${HOME_H3} mt-3 text-lg`}>{label}</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">{detail}</p>
      <div className="mt-3 h-1.5 w-12 rounded-full" style={{ backgroundColor: theme.soft }} />
    </div>
  );
}

/** Zigzag process flow with wavy animated arrows and per-step colour/icons. */
export default function FeatureFlow({ flow }: { flow: Flow }) {
  const nodes = flow.nodes.slice(0, 5);

  return (
    <section id="flow" className="scroll-mt-24 border-t border-[var(--line)] bg-[#f3f6f0] py-16 md:py-[88px]">
      <div className={HOME_WRAP}>
        <p className={HOME_EYEBROW}>PROCESS FLOW</p>
        <h2 className={HOME_H2}>{flow.heading}</h2>
        <p className="mt-3 max-w-[520px] text-sm text-[var(--muted)]">
          Follow the wavy path — each step has its own colour and icon.
        </p>

        {/* Mobile: zigzag left / right with wavy arrows */}
        <ol className="mt-10 space-y-0 md:hidden">
          {nodes.map((node, index) => {
            const theme = FLOW_STEP_THEMES[index % FLOW_STEP_THEMES.length];
            const side = index % 2 === 0 ? "mr-[12%] ml-0" : "ml-[12%] mr-0";
            return (
              <li key={node.label} className="flex flex-col">
                <StepCard
                  index={index}
                  label={node.label}
                  detail={node.detail}
                  className={side}
                  style={{
                    background: `linear-gradient(180deg, #fff 70%, ${theme.soft})`,
                    transform: `rotate(${index % 2 === 0 ? -1.5 : 1.5}deg)`,
                  }}
                />
                {index < nodes.length - 1 ? (
                  <FeatureFlowWaveDown color={theme.accent} />
                ) : null}
              </li>
            );
          })}
        </ol>

        {/* Desktop: staggered wave path */}
        <div className="relative mt-12 hidden h-[340px] md:block lg:h-[360px]">
          <FeatureFlowWaves />
          <ol className="absolute inset-0">
            {nodes.map((node, index) => {
              const pos = FLOW_DESKTOP_POS[index] ?? FLOW_DESKTOP_POS[0];
              const theme = FLOW_STEP_THEMES[index % FLOW_STEP_THEMES.length];
              return (
                <li
                  key={node.label}
                  className="absolute w-[20%] min-w-[150px] max-w-[200px]"
                  style={{ top: pos.top, left: pos.left, transform: `rotate(${pos.rotate})` }}
                >
                  <StepCard
                    index={index}
                    label={node.label}
                    detail={node.detail}
                    style={{ background: `linear-gradient(165deg, #fff 65%, ${theme.soft})` }}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
