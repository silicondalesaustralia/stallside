/** Shared class names for the marketing home page sections. */
export const HOME_HEADING_FONT =
  "font-[family-name:'Helvetica_Neue',Helvetica,Arial,sans-serif] font-medium tracking-normal";

export const HOME_WRAP = "mx-auto w-full max-w-[1280px] px-[22px] sm:px-[30px] lg:px-12";

export const HOME_EYEBROW = "mb-5 text-[11px] font-bold tracking-[0.15em] text-[var(--field)]";

export const HOME_H2 = `${HOME_HEADING_FONT} text-[34px] leading-[1.1] text-[var(--field)] sm:text-[clamp(34px,3.8vw,52px)]`;

export const HOME_H3 = `${HOME_HEADING_FONT} leading-[1.15] text-[var(--field)]`;

const BUTTON_MOTION =
  "inline-flex items-center justify-between rounded-md font-bold transition hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const BUTTON_BASE = `${BUTTON_MOTION} gap-8 px-6 py-4 text-[15px]`;

export const HOME_BUTTON = `${BUTTON_BASE} bg-[var(--field)] text-white hover:bg-[var(--leaf)]`;

export const HOME_BUTTON_SMALL = `${BUTTON_MOTION} gap-5 px-4 py-2.5 text-sm bg-[var(--field)] text-white hover:bg-[var(--leaf)]`;

export const HOME_BUTTON_GOLD = `${BUTTON_BASE} bg-[var(--marigold)] text-[var(--field)] hover:brightness-105`;

export const HOME_BUTTON_OUTLINE = `${BUTTON_BASE} border border-[var(--field)] text-[var(--field)] hover:bg-white`;

export const HOME_TEXT_LINK =
  "border-b border-current pb-0.5 text-sm font-semibold text-[var(--field)] hover:text-[var(--leaf)]";

export const HOME_PLAN_TAG =
  "inline-block rounded-[3px] border border-[#a1af9a] px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-[var(--field)]";

export const HOME_SCREEN_CAPTION = "mt-3 block text-[10px] text-[var(--muted)]";
