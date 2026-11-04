import { HOME_HEADING_FONT } from "@/components/lp/makers/makers-lp-styles";

const CHECKS = ["Materials & packaging", "Your time & overheads", "Your target margin"] as const;

export default function MakersLpHeroCostNote() {
  return (
    <div className="absolute bottom-10 -left-5 w-[215px] -rotate-3 border border-[#d9d5c9] bg-[#fffdf7] p-5 shadow-[0_18px_45px_#17361f18] sm:bottom-[60px] sm:-left-9 sm:w-[255px] sm:p-6">
      <span className="text-[8px] tracking-[0.12em] text-[var(--field)]">THE BUSINESS BEHIND THE MAKING</span>
      <strong className={`${HOME_HEADING_FONT} my-3 block text-[28px] leading-[1.08] text-[var(--field)] sm:text-[32px]`}>
        A price that adds up.
      </strong>
      {CHECKS.map((label) => (
        <div key={label} className="flex justify-between border-t border-[var(--line)] py-2 text-[11px] text-[var(--field)]">
          <span>{label}</span>
          <b className="text-[var(--leaf)]" aria-hidden>
            ✓
          </b>
        </div>
      ))}
      <a href="#production" className="text-[11px] font-bold text-[var(--field)] hover:text-[var(--leaf)]">
        Meet your costing tools ↗
      </a>
    </div>
  );
}
