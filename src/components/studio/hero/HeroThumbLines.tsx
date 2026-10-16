/** Headline and text bars inside a hero style sketch. */
export default function HeroThumbLines({ centre = false, light = false }: { centre?: boolean; light?: boolean }) {
  return (
    <span className={`flex flex-col gap-0.5 ${centre ? "items-center" : ""}`}>
      <span className={`h-1 w-7 rounded-sm ${light ? "bg-white" : "bg-[var(--field)]"}`} />
      <span className={`h-0.5 w-5 rounded-sm ${light ? "bg-white/70" : "bg-[var(--muted)]/50"}`} />
    </span>
  );
}
